import axios from "axios";
import { HUGGING_FACE_TOKEN } from "../constant/envvariables";
const model_id = "sentence-transformers/all-MiniLM-L6-v2";

export const generateEmbeddings = async (text: string) => {
  try {
    console.log("HUGGING_FACE_TOKEN", HUGGING_FACE_TOKEN);
    const response = await axios.post(
      `https://api-inference.huggingface.co/pipeline/feature-extraction/${model_id}`,
      {
        inputs: text,
        options: { wait_for_model: true },
      },
      {
        headers: {
          Authorization: `Bearer ${HUGGING_FACE_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("response", response?.data);
    return response?.data;
  } catch (error) {
    console.log("error in generateEmbeddings", error);
    return [];
  }
};
