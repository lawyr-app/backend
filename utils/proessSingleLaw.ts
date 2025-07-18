import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { CONSTITUTION_URL } from "../constant/constitutionData";
import { ADMIN_MESSAGES, INTERNAL_SERVER_ERROR } from "../constant/messages";
import { LawModel } from "../model/Law";
import { fetchAndParsePDF } from "./fetchAndParsePdf";
import { generateEmbeddings } from "./generateEmbedding";
import { addDataToPineCone } from "./pineConeService";
import { response } from "./response";
import { getCleanedText } from "./cleanText";

type processSingleLawProps = {
  lawId: string;
};

const errorResponse = {
  isError: true,
  data: null,
  message: INTERNAL_SERVER_ERROR,
};

const splitArrayIntoChunks = (array: string[], chunkSize: number) => {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
};

type generateAndSaveProps = {
  text: string;
  lawId: string;
};
const generateAndSave = async ({ text, lawId }: generateAndSaveProps) => {
  try {
    const law = await LawModel.findById(lawId);

    if (!law) {
      return response({
        isError: true,
        data: null,
        message: ADMIN_MESSAGES.NO_LAW_EXISTS,
      });
    }

    const cleanedText = getCleanedText(text);
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 500,
    });
    const allchunks = await textSplitter.splitText(cleanedText);
    const smallerChunks = splitArrayIntoChunks(allchunks, 3);

    const embeddings = [];
    for (const chunk of smallerChunks) {
      const list = await generateEmbeddings(chunk);
      if (!list.isError) {
        embeddings.push(list.data);
      } else {
        return response({
          isError: true,
          data: null,
        });
      }
    }

    console.log({
      embeddingslength: embeddings.length,
      smallerChunksLength: smallerChunks.length,
    });

    if (embeddings.length !== smallerChunks.length) {
      return response({
        isError: true,
        data: null,
      });
    } else {
      let index = 1;
      let pineconeIds: string[] = [];

      for (const embd of embeddings) {
        const id = `${lawId}-${index}`;
        await addDataToPineCone({
          id,
          regionId: String(law.regionId),
          embeddings: embd,
          lawId: lawId,
        });
        pineconeIds.push(id);
        index++;
      }
      await law.updateOne({
        pineconeIds,
        rawText: text,
      });

      return response({
        isError: false,
        data: null,
      });
    }
  } catch (error) {
    console.log("error", error);
    return response({
      isError: true,
      data: null,
      message: INTERNAL_SERVER_ERROR,
    });
  }
};

const processSingleLaw = async ({ lawId }: processSingleLawProps) => {
  try {
    const law = await LawModel.findById(lawId);
    if (law) {
      const pdfUrl = law?.pdfUrl;
      if (pdfUrl) {
        let parsedText = law.rawText;
        if (!parsedText) {
          const isLocal = law.pdfUrl === CONSTITUTION_URL;
          const urlOfPdf = isLocal
            ? `constitution of ${law.shortTitle}`
            : pdfUrl;
          parsedText = await fetchAndParsePDF({
            url: urlOfPdf,
            isLocal,
          });

          if (parsedText) {
            return await generateAndSave({
              text: parsedText,
              lawId,
            });
          } else {
            return response({
              isError: true,
              message: ADMIN_MESSAGES.FAILED_TO_PARSE,
            });
          }
        } else {
          return await generateAndSave({
            text: parsedText,
            lawId,
          });
        }
      } else {
        return response({
          isError: true,
          message: ADMIN_MESSAGES.SCRAP_LAW_AGAIN,
        });
      }
    } else {
      return response({
        isError: true,
        message: ADMIN_MESSAGES.NO_LAW_EXISTS,
      });
    }
  } catch (error) {
    console.error("Somethign went wrong in processSingleLaw due to ", error);
    return response(errorResponse);
  }
};

export { processSingleLaw };
