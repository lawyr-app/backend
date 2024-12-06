import { ChatPromptTemplate } from "@langchain/core/prompts";
import { EmbeddingModel } from "../model/Embedding";
import { getDataFromPineCone } from "../services/PineConeService";
import { QueryResponse, RecordMetadata } from "@pinecone-database/pinecone";

type commonProps = {
  questionEmbedding: [number];
  nameSpace: string;
};

const getEmbeddingIds = async ({
  questionEmbedding,
  nameSpace = "India",
}: commonProps) => {
  try {
    const results: QueryResponse<RecordMetadata> | never[] =
      await getDataFromPineCone({
        embeddings: questionEmbedding,
        namespace: nameSpace,
      });
    if (results && "matches" in results && results.matches.length > 0) {
      const embeddingIds = results.matches.map((m) => {
        const id = m?.metadata?.embeddingId;
        if (id) {
          return id;
        }
      });
      return embeddingIds[0] ?? [];
    }

    return [];
  } catch (error) {
    console.error(`Something went wrong in getEmbeddingIds due to `, error);
    return [];
  }
};

const findSimilarLaws = async ({
  questionEmbedding,
  nameSpace = "India",
}: commonProps) => {
  try {
    const embeddingIds = await getEmbeddingIds({
      questionEmbedding,
      nameSpace,
    });
    const results = await EmbeddingModel.find({ _id: { $in: embeddingIds } });
    return results;
  } catch (error) {
    console.error("findSimilarLaws", error);
    return [];
  }
};

const lawPromptTemplate = ChatPromptTemplate.fromTemplate(`
Answer the question based only on the following context:
{context}

Question: {question}

Please provide a concise answer and cite specific information from the legal documents when possible.If the answer cannot be found in the context, say "I cannot find information about this in the provided legal documents". Dont forget to mention article number and article name.Answer has to be regarding Country India.article ,law name and number should be highlighted properly.Answer should be in markdown"

Answer:
`);

const getChatContext = async ({
  questionEmbedding,
  nameSpace = "India",
}: commonProps) => {
  try {
    const similarDocuments = await findSimilarLaws({
      questionEmbedding,
      nameSpace,
    });
    const context = similarDocuments
      ?.map((doc) => ` Content: ${doc?.content}`)
      .join("\n\n");
    return context;
  } catch (error) {
    return null;
  }
};

export { lawPromptTemplate, getChatContext };
