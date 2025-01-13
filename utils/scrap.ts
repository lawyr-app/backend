import axios from "axios";
import * as cheerio from "cheerio";
import { constitutionPart } from "../constant/constitutionData";
import { baseUrl, fullDomain } from "../constant/law";

const scrapTheConstitution = async () => {
  try {
    const data = constitutionPart.map((m) => ({
      ...m,
      actDate: null,
      actNumber: null,
      shortTitle: m.shortTitle,
      pdfUrl: m.pdfUrl,
      isError: false,
    }));
    return data;
  } catch (error) {
    console.error(
      "Something went wrong in scrapTheConstitution due to ",
      error
    );
    return [];
  }
};

type scrapTheLawsProps = {
  id: string;
};

type scrappedDataType = {
  websiteUrl: string;
  actDate: string;
  actNumber: string;
  shortTitle: string;
  pdfUrl: string;
  isError: boolean;
};

const scrapTheLaws = async ({ id }: scrapTheLawsProps) => {
  try {
    const newUrl = baseUrl.replace("#ID", id);
    const { data } = await axios.get(newUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
      },
      timeout: 120000,
    });
    const $ = cheerio.load(data);
    const scrappedData: scrappedDataType[] = [];
    const elements = $('td[headers="t4"] a').toArray();

    for (const [index, element] of elements.entries()) {
      const websiteUrl = $(element).attr("href") ?? "";
      const dateText = $('td[headers="t1"]').eq(index).text();
      const actDate = (() => {
        if (!dateText) {
          return "";
        }
        try {
          const parsedDate = new Date(dateText);
          return !isNaN(parsedDate.getTime())
            ? parsedDate.toISOString()
            : dateText;
        } catch (dateError) {
          console.log("dateError", dateError);
          return "";
        }
      })();
      const actNumber = $('td[headers="t2"]').eq(index).text();
      const shortTitle = $('td[headers="t3"] strong').eq(index).text();

      const builtLink = `${fullDomain.trim()}${websiteUrl.trim()}`;
      const { data, isError } = await getlawPdfUrl(builtLink);

      scrappedData.push({
        websiteUrl: builtLink,
        actDate,
        actNumber,
        shortTitle,
        pdfUrl: data,
        isError,
      });
    }
    return scrappedData;
  } catch (error) {
    console.error("Something went wrong in scrapTheLaws due to ", error);
    return [];
  }
};

const getlawPdfUrl = async (url: string) => {
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
      },
      timeout: 120000,
    });
    const $ = cheerio.load(data);

    let pdfLink = $('a[target="_blank"]')
      .map((i, link) => $(link).attr("href"))
      .get()
      .find((href) => href.endsWith(".pdf"));

    const joined = fullDomain.concat(pdfLink?.trim() ?? "");

    pdfLink = pdfLink ? joined : "";

    return {
      isError: pdfLink ? false : true,
      data: pdfLink ?? "",
    };
  } catch (error) {
    console.error("Something went wrong in getlawPdfUrl due to ", error);
    return {
      isError: true,
      data: "",
    };
  }
};

export { scrapTheLaws, scrapTheConstitution };
