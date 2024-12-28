import { FastifyReply, FastifyRequest } from "fastify";
import { MessageModel } from "../model/Message";
import { response } from "../utils/response";
import { UserModel } from "../model/User";
import { generateEmbeddings } from "../utils/generateEmbedding";
import { getChatContext, lawPromptTemplate } from "../utils/chatUtils";
import { ChatGroq } from "@langchain/groq";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { GROQ_API_KEY, GEMINI_API_KEY } from "../constant/envvariables";
import { INTERNAL_SERVER_ERROR } from "../constant/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

type GetChatUserMessagesRequestType = FastifyRequest<{
  Params: {
    chatId: string;
  };
  Querystring: {
    skip: number;
    limit: number;
  };
}>;
const getChatUserMessages = async (
  req: GetChatUserMessagesRequestType,
  reply: FastifyReply
) => {
  try {
    const { _id } = req.user;
    const { chatId } = req.params;
    const { skip = 0, limit = 10 } = req.query;
    const chats = await MessageModel.find({
      isDeleted: false,
      chatId,
      createdBy: _id,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    if (chats) {
      reply.send(
        response({
          data: chats,
          isError: false,
          message: "",
        })
      );
    } else {
      reply.send(
        response({
          data: [],
          isError: true,
        })
      );
    }
  } catch (error) {
    console.error("Something went wrong in getUserMessages due to", error);
    reply.send(
      response({
        isError: true,
      })
    );
  }
};

type StartMessageRequestType = FastifyRequest<{
  Body: {
    question: string;
    chatId: string;
  };
  user: typeof UserModel;
}>;
const startMessage = async (
  req: StartMessageRequestType,
  reply: FastifyReply
) => {
  try {
    const { _id } = req.user;
    const { question, chatId } = req.body;
    const savedMessage = await MessageModel.create({
      question,
      chatId,
      createdBy: _id,
    });
    if (savedMessage) {
      reply.send(
        response({
          data: savedMessage,
          isError: false,
          message: "",
        })
      );
    } else {
      reply.send(
        response({
          message: "Failed to generate response. Please try again",
          isError: true,
        })
      );
    }
  } catch (error) {
    console.error("error", error);
    reply.send(
      response({
        isError: true,
      })
    );
  }
};

type GetMessageRequestType = FastifyRequest<{
  Params: {
    id: string;
  };
}>;
const getMessage = async (req: GetMessageRequestType, reply: FastifyReply) => {
  reply.raw.setHeader("Content-Type", "text/event-stream");
  reply.raw.setHeader("Connection", "keep-alive");
  reply.raw.setHeader("Cache-Control", "no-store");
  reply.raw.setHeader("Access-Control-Allow-Origin", "*");
  reply.raw.flushHeaders();

  type sendSSEProps = {
    data: any;
    isError?: boolean;
    message: string;
    stopTheSSE?: boolean;
  };
  const sendSSE = ({
    data,
    isError = false,
    message,
    stopTheSSE = false,
  }: sendSSEProps) => {
    const stringified = JSON.stringify(
      response({
        data,
        isError,
        message,
      })
    );
    reply.raw.write(`data: ${stringified}\n\n`);
    if (stopTheSSE) {
      reply.raw.end();
    }
  };
  try {
    const { id } = req.params;
    const message = await MessageModel.findById(id);
    if (message) {
      const { question } = message;
      if (!question) {
        sendSSE({
          data: null,
          isError: true,
          message: "NO_CONTEXT",
          stopTheSSE: true,
        });
        return;
      }
      const questionEmbeddings = await generateEmbeddings(question);
      const context = await getChatContext({
        nameSpace: "India",
        questionEmbedding: questionEmbeddings,
      });
      if (!context) {
        sendSSE({
          data: null,
          isError: true,
          message: "NO_CONTEXT",
          stopTheSSE: true,
        });
        return;
      }

      const llm = new ChatGoogleGenerativeAI({
        apiKey: GEMINI_API_KEY,
        model: "gemini-1.5-flash",
        streaming: true,
      });
      sendSSE({
        data: "",
        message: "STARTED",
      });
      const answer = await lawPromptTemplate
        .pipe(llm)
        .pipe(new StringOutputParser())
        .stream({ context, question });

      const allAnswer = [];

      for await (const chunk of answer) {
        allAnswer.push(chunk);
        sendSSE({
          data: chunk,
          message: "IN_PROGRESS",
          stopTheSSE: false,
        });
      }

      const updatedMessage = await MessageModel.findByIdAndUpdate(
        id,
        {
          answer: allAnswer.join(""),
        },
        {
          new: true,
        }
      );
      sendSSE({
        data: updatedMessage,
        message: "COMPLETED",
        stopTheSSE: true,
      });
    } else {
    }
  } catch (error) {
    console.log("errpr bicth", error);
    sendSSE({
      data: null,
      message: INTERNAL_SERVER_ERROR,
      stopTheSSE: true,
    });
  }
};

export { getChatUserMessages, startMessage, getMessage };
