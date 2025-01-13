import { Pinecone } from "@pinecone-database/pinecone";
import { PINECONE } from "../constant/envvariables";

const pc = new Pinecone({
  apiKey: PINECONE!,
});
const index = pc.index("lawyer");

type addDataToPineConeProps = {
  regionId: string;
  embeddings: [number];
  lawId: string;
  id: string;
};
const addDataToPineCone = async ({
  id,
  lawId,
  embeddings,
  regionId,
}: addDataToPineConeProps) => {
  try {
    await index.namespace(regionId).upsert([
      {
        id,
        values: embeddings,
        metadata: { lawId },
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

export { addDataToPineCone, getDataFromPineCone };
