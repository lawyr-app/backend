import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getDataFromPineCone } from "../services/PineConeService";
import { INTERNAL_SERVER_ERROR } from "../constant/messages";
import { LawModel } from "../model/Law";
import { getCleanedText } from "./cleanText";

type commonProps = {
  questionEmbedding: [number];
  nameSpace: string;
};

const lawPromptTemplate = ChatPromptTemplate.fromTemplate(`
  **Answer the question based only on the following context like a lawyer:**

  {context}

  **Question:** {question}

  ---

  **Answer:**

  - Provide a comprehensive response that includes all relevant details available in the context.
  - Cite specific information from the legal documents where possible.
  - If the answer cannot be found in the context, respond with:
    *"I cannot find information about this in the provided legal documents."*
  - Format the response in **Markdown**.
  - Use **bold text** for headers or key points.
  - Separate paragraphs with a blank line for better readability.
  - Ensure no relevant information from the context is omitted in the response.
  ---
  `);

const CONSTITUTION_NAMESPACE = "67806ffbeda08a849e48cab3";
const INDIA_NAMESPACE = "67806ffbeda08a849e48cab2";
const DEFAULT_NAMESPACE = [CONSTITUTION_NAMESPACE, INDIA_NAMESPACE];

type getLawIdsFromPineConeProps = {
  questionEmbedding: [number];
  nameSpace: string;
};
const getLawIdsFromPineCone = async ({
  questionEmbedding,
  nameSpace,
}: getLawIdsFromPineConeProps) => {
  try {
    const namespaces = nameSpace
      ? DEFAULT_NAMESPACE
      : [...DEFAULT_NAMESPACE, nameSpace];
    let combinedResults: any = [];
    for (const ns of namespaces) {
      const queryResponse = await getDataFromPineCone({
        namespace: ns,
        embeddings: questionEmbedding,
      });
      const arrayResponse = queryResponse?.matches;
      combinedResults = [...combinedResults, ...arrayResponse];
    }
    console.log("combinedResults", combinedResults);
    const onlyLawIds = combinedResults.map((m) => m.metadata.lawId);
    const uniqueLawIds = [...new Set(onlyLawIds)];
    return {
      isError: false,
      data: uniqueLawIds,
      message: "SUCCESS",
    };
  } catch (error) {
    return {
      isError: true,
      data: [],
      message: INTERNAL_SERVER_ERROR,
    };
  }
};

const getChatContext = async ({
  questionEmbedding,
  nameSpace,
}: commonProps) => {
  try {
    const { data } = await getLawIdsFromPineCone({
      questionEmbedding,
      nameSpace,
    });

    if (data.length === 0) {
      console.error("returning null as context");
      return null;
    }

    const uniqueLawIds = [...new Set(data)];

    const laws = await LawModel.find({
      _id: { $in: uniqueLawIds },
    });

    const context = laws
      ?.map((doc) => ` Content: ${getCleanedText(String(doc?.rawText))}`)
      .join("\n\n");
    return context;
  } catch (error) {
    return null;
  }
};

export { lawPromptTemplate, getChatContext };
