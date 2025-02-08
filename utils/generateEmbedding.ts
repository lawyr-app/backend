import axios from "axios";
import { GEMINI_API_KEY } from "../constant/envvariables";

const generateEmbeddings = async (text: string[]) => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not found");
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`;

    const parts = text.map((t) => ({ text: t }));

    const data = {
      model: "models/text-embedding-004",
      content: {
        parts,
      },
    };

    const { data: response } = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const array = response.embedding.values;
    if (array.length > 0) {
      return {
        isError: false,
        data: array,
      };
    } else {
      return {
        isError: true,
        data: [],
      };
    }
  } catch (error) {
    console.log("error", error);
    return {
      isError: true,
      data: [],
    };
  }
};

export { generateEmbeddings };
