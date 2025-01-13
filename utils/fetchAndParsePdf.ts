import axios from "axios";
import pdf from "pdf-parse";
import fs from "fs";
import path from "path";
import { assetsFolder } from "../constant/constitutionData";

type fetchAndParsePDFType = {
  url: string;
  isLocal: boolean;
};
const fetchAndParsePDF = async ({
  url,
  isLocal = false,
}: fetchAndParsePDFType) => {
  try {
    let pdfData = null;
    if (isLocal) {
      const fullPath = path.join(assetsFolder, `${url}.pdf`);
      console.log("fullPath", fullPath);
      pdfData = fs.readFileSync(fullPath);
    } else {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      pdfData = response.data;
    }
    // console.log("pdfData", pdfData);
    const data = await pdf(pdfData);
    // console.log("data", data);
    return data.text;
  } catch (error) {
    console.error(`Something went wrong in fetchAndParsePDF due to `, error);
    return "";
  }
};

export { fetchAndParsePDF };
