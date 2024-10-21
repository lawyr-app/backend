import { FastifyReply, FastifyRequest } from "fastify";
import { ChatGroq } from "@langchain/groq";
import { generateEmbeddings } from "../utils/generateEmbedding";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { GROQ_API_KEY } from "../constant/envvariables";
import { response } from "../utils/response";
import { getChatContext, lawPromptTemplate } from "../utils/chatUtils";

type InitiateChatRequestType = FastifyRequest<{
  Body: {
    question: string;
  };
}>;
const initiateChat = async (
  req: InitiateChatRequestType,
  reply: FastifyReply
) => {
  try {
    const { question } = req.body;
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

    if (answer) {
      reply.send(
        response({
          data: answer,
          isError: false,
        })
      );
    } else {
      reply.send(
        response({
          data: "Failed to generate response. Please try again",
          isError: false,
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

export { initiateChat };
