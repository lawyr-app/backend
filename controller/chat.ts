import { FastifyReply, FastifyRequest } from "fastify";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { generateEmbeddings } from "../utils/generateEmbedding";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { GROQ_API_KEY } from "../constant/envvariables";
import { response } from "../utils/response";
import { LawModel } from "../model/Law";
import { EmbeddingModel } from "../model/Embedding";
import { getDataFromPineCone } from "../services/PineConeService";

const getEmbeddingIds = async (questionEmbedding, nameSpace) => {
  try {
    const results = await getDataFromPineCone({
      embeddings: questionEmbedding,
      namespace: "India",
    });
    const embeddingIds = results.matches.map((m) => m.metadata.embeddingId);
    return embeddingIds[0] ?? [];
  } catch (error) {
    console.error(`Something went wrong in getEmbeddingIds due to `, error);
    return [];
  }
};

async function findSimilarLaws(questionEmbedding) {
  try {
    const embeddingIds = await getEmbeddingIds(questionEmbedding, "India");
    const results = await EmbeddingModel.find({ _id: { $in: embeddingIds } });
    return results;
  } catch (error) {
    console.error("findSimilarLaws", error);
    throw error;
  }
}

const ragPromptTemplate = ChatPromptTemplate.fromTemplate(`
Answer the question based only on the following context:
{context}

Question: {question}

Please provide a concise answer and cite specific information from the legal documents when possible.If the answer cannot be found in the context, say "I cannot find information about this in the provided legal documents". Dont forget to mention article number and article name.Answer has to be regarding Country India.Format it in the markdown. article ,law name and number should be highlighted properly."

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
        results = await findSimilarLaws(questionEmbedding);
        console.info("findSimilarLaws", results);
      } catch (error) {
        console.error("error while finding law model", error);
      }

      try {
        documents =
          results?.map((doc) => ({
            pageContent: doc.content,
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
    if (similarDocuments?.length === 0) {
      return "NO_SIMILAR_DOCUMENTS_CHECK_YOUR_LOGIOC";
    }
    const llm = new ChatGroq({
      apiKey: GROQ_API_KEY,
      model: "llama-3.1-8b-instant",
      // model: "llama-3.1-70b-versatile",
    });
    const context = similarDocuments
      ?.map((doc) => ` Content: ${doc.pageContent}`)
      .join("\n\n");

    // 3. Generate response using LLM
    const llmAnswer = await ragPromptTemplate
      .pipe(llm)
      .pipe(new StringOutputParser())
      .invoke({
        context,
        question,
      });

    console.log("llmAnswer", llmAnswer);

    const answer = {
      answer: llmAnswer,
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
    reply.send(
      response({
        data: "",
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
