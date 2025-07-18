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
  **Answer the question strictly based on the provided Indian legal context:**
  
  {context}
  
  **Question:** {question}
  
  ---
  
  **Answer Guidelines:**
  
  - Respond as an Indian legal assistant or lawyer would, using formal legal tone.
  - Your answer must rely only on the information provided in the context above.
  - Cite specific clauses, sections, or references where applicable.
  - If the answer is not available in the context, respond with:
  
    *"The answer to this question is not available in the provided legal documents. However, based on general Indian legal understanding, here is a relevant interpretation:"*
  
    Then proceed with a thoughtful LLM-generated response rooted in Indian law, clearly separated from the factual context.
  
  - Format your answer in **Markdown**.
  - Use **bold** for key legal terms, headings, or points.
  - Separate each paragraph with a blank line for readability.
  - Ensure **no important detail from the context is missed**.
  
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
      if (
        queryResponse &&
        typeof queryResponse === "object" &&
        "matches" in queryResponse
      ) {
        const arrayResponse = queryResponse?.matches;
        combinedResults = [...combinedResults, ...arrayResponse];
      }
    }
    console.log("combinedResults", combinedResults);
    const onlyLawIds = combinedResults.map((m: any) => m.metadata.lawId);
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
