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
Answer the question based only on the following context:
{context}

Question: {question}

Please provide a concise answer and cite specific information from the legal documents when possible.If the answer cannot be found in the context, say "I cannot find information about this in the provided legal documents"Answer should be in markdown.Also if possible use points to make the answer consise....Dont elaborate much.Keep it simple like the user is just 16 years old"

Answer:
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
    return uniqueLawIds;
  } catch (error) {
    return {
      isError: true,
      data: null,
      message: INTERNAL_SERVER_ERROR,
    };
  }
};

const getChatContext = async ({
  questionEmbedding,
  nameSpace,
}: commonProps) => {
  try {
    const lawIds = await getLawIdsFromPineCone({
      questionEmbedding,
      nameSpace,
    });

    const uniqueLawIds = [...new Set(lawIds)];

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
