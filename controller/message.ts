import { FastifyReply, FastifyRequest } from "fastify";
import { MessageModel } from "../model/Message";
import { response } from "../utils/response";
import { UserModel } from "../model/User";
import { generateEmbeddings } from "../utils/generateEmbedding";
import { getChatContext, lawPromptTemplate } from "../utils/chatUtils";
import { ChatGroq } from "@langchain/groq";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { GROQ_API_KEY } from "../constant/envvariables";

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

    const questionEmbeddings = await generateEmbeddings(question);
    const context = await getChatContext({
      nameSpace: "India",
      questionEmbedding: questionEmbeddings,
    });
    if (!context) {
      return reply.send(
        response({
          data: "No context found",
          isError: false,
        })
      );
    }

    const llm = new ChatGroq({
      apiKey: GROQ_API_KEY,
      model: "llama-3.1-8b-instant",
      streaming: true,
    });

    const answer = await lawPromptTemplate
      .pipe(llm)
      .pipe(new StringOutputParser())
      .invoke({
        context,
        question,
      });

    const updatedMessage = await MessageModel.findByIdAndUpdate(
      savedMessage._id,
      {
        answer,
      },
      {
        new: true,
      }
    );

    if (answer) {
      reply.send(
        response({
          data: updatedMessage,
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

export { getChatUserMessages, startMessage };
