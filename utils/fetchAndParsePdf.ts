import axios from "axios";
import pdf from "pdf-parse";

type fetchAndParsePDFType = {
  url: string;
};
const fetchAndParsePDF = async ({ url }: fetchAndParsePDFType) => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const data = await pdf(response.data);
    console.log("data", data);
    return data.text;
  } catch (error) {
    return "";
  }
};

export { fetchAndParsePDF };
