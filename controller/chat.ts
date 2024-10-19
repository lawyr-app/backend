import { FastifyReply, FastifyRequest } from "fastify";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { generateEmbeddings } from "../utils/generateEmbedding";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { GROQ_API_KEY } from "../constant/envvariables";
import { response } from "../utils/response";
import { LawModel } from "../model/Law";

async function findSimilarLaws(
  questionEmbedding,
  limit = 5,
  minScore = 0,
  regionId = null
) {
  return await LawModel.find({ shortTitle: "Constitution" });
  // const pipeline = [
  //   {
  //     $vectorSearch: {
  //       index: "default", // replace with your actual index name
  //       queryVector: questionEmbedding,
  //       path: "embeddings",
  //       numCandidates: limit,
  //       limit: limit,
  //     },
  //   },
  //   {
  //     $project: {
  //       shortTitle: 1,
  //       actDate: 1,
  //       actNumber: 1,
  //       websiteUrl: 1,
  //       content: 1,
  //     },
  //   },
  // ];
  // return await LawModel.aggregate(pipeline);
}

const ragPromptTemplate = ChatPromptTemplate.fromTemplate(`
Answer the question based only on the following context:
{context}

Question: {question}

Please provide a detailed answer and cite specific information from the legal documents when possible.If the answer cannot be found in the context, say "I cannot find information about this in the provided legal documents.Also make sure you return answer in markdown"

Answer:
`);

type answerTheQuestionType = {
  question: string;
  questionEmbedding: [number];
};
const answerTheQuestion = async ({
  question,
  questionEmbedding,
}: answerTheQuestionType) => {
  console.log({
    question,
    questionEmbedding,
  });
  try {
    const getMongoData = async () => {
      let results, documents;
      try {
        results = await findSimilarLaws(questionEmbedding, 5, 0.7);
        // console.info("results", results);
      } catch (error) {
        console.error("error while finding law model", error);
      }

      try {
        documents =
          results?.map((doc) => ({
            pageContent: doc.content,
            metadata: {
              shortTitle: doc.shortTitle,
              actDate: doc.actDate,
              actNumber: doc.actNumber,
            },
          })) ?? [];
        // console.info("documents", documents);
      } catch (error) {
        console.error("error while finding documents", error);
      }

      return {
        similarResults: results,
        similarDocuments: documents,
      };
    };

    const { similarDocuments } = await getMongoData();
    const llm = new ChatGroq({
      apiKey: GROQ_API_KEY,
      model: "llama-3.1-8b-instant",
      // model: "llama-3.1-70b-versatile",
    });
    const context = similarDocuments
      ?.map(
        (doc) => `Document: ${doc.metadata.shortTitle} (${doc.metadata.actDate})
      Content: ${doc.pageContent}`
      )
      .join("\n\n");
    const contextLength = context.length;
    const middleIndex = Math.floor(contextLength / 2);
    const firstText = context.substring(0, middleIndex);
    const secondText = context.substring(middleIndex);

    // 3. Generate response using LLM
    const llmAnswer = await ragPromptTemplate
      .pipe(llm)
      .pipe(new StringOutputParser())
      .invoke({
        context: secondText,
        question,
      });

    console.log("llmAnswer", llmAnswer);

    const answer = {
      answer: llmAnswer,
      sources: similarDocuments?.map((doc) => ({
        title: doc.metadata.shortTitle,
        date: doc.metadata.actDate,
        actNumber: doc.metadata.actNumber,
      })),
    };

    return answer;
  } catch (error) {
    console.error(`Something went wrong in answerTheQuestion due to`, error);
  }
};

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
    const answer = await answerTheQuestion({
      question,
      questionEmbedding: questionEmbeddings,
    });
    reply.send(
      response({
        data: answer,
        isError: false,
      })
    );
  } catch (error) {
    reply.send(
      response({
        isError: true,
      })
    );
  }
};

export { initiateChat };
