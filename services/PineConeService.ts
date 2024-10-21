import { Pinecone } from "@pinecone-database/pinecone";
import { PINECONE } from "../constant/envvariables";

const pc = new Pinecone({
  apiKey: PINECONE!,
});
const index = pc.index("lawyer");
const handleCreateIndex = async () => {
  await pc.createIndex({
    name: "lawyer",
    dimension: 384,
    metric: "cosine",
    spec: {
      serverless: {
        cloud: "aws",
        region: "us-east-1",
      },
    },
  });
};

type addDataToPineConeProps = {
  namespace: string;
  regionId: string;
  lawId: string;
  id: string;
  embeddingId: string;
  part: number;
  embeddings: [number];
};
const addDataToPineCone = async ({
  namespace,
  id,
  embeddingId,
  regionId,
  lawId,
  embeddings,
  part,
}: addDataToPineConeProps) => {
  try {
    await index.namespace(namespace).upsert([
      {
        id,
        values: embeddings,
        metadata: { regionId, lawId, embeddingId, part },
      },
    ]);
  } catch (error) {
    console.error(`Something went wrong due to `, error);
  }
};

type getDataFromPineConeProps = {
  namespace: string;
  embeddings: [number];
};
const getDataFromPineCone = async ({
  namespace,
  embeddings,
}: getDataFromPineConeProps) => {
  try {
    const queryResponse = await index.namespace(namespace).query({
      topK: 3,
      vector: embeddings,
      includeMetadata: true,
    });
    console.log("queryResponse", queryResponse);
    return queryResponse;
  } catch (error) {
    console.error("error in getDataFromPineCone due to ", error);
    return [];
  }
};

export { handleCreateIndex, addDataToPineCone, getDataFromPineCone };
