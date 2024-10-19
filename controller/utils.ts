import { baseUrl, regions } from "../constant/seed";
import { LawModel } from "../model/Law";
import { RegionsModel } from "../model/Regions";
import puppeteer from "puppeteer";
import { fetchAndParsePDF } from "../utils/fetchAndParsePdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { generateEmbeddings } from "../utils/generateEmbedding";

const handleSeedRegions = async () => {
  try {
    for (let region of regions) {
      await RegionsModel.findOneAndUpdate(
        { uniqueId: region.id },
        { name: region.name, uniqueId: region.id },
        { upsert: true }
      );
    }
    console.log("regions added successfully");
  } catch (error) {
    console.error(`Something went wrong while seeding regions`, error);
  }
};

const scrapAndStoreActUrls = async () => {
  try {
    const LIMIT = 2000;
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    );

    const regions = await RegionsModel.find();

    for (const region of regions) {
      const url = baseUrl
        .replace("#ID", String(region.uniqueId))
        .replace("#LIMIT", String(LIMIT));

      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 120000,
      });

      const scrappedData = await page.evaluate((region) => {
        const ViewUrls = document.querySelectorAll('td[headers="t4"] a');
        const enactmentDate = document.querySelectorAll('td[headers="t1"]');
        const actNumbers = document.querySelectorAll('td[headers="t2"]');
        const shortTitles = document.querySelectorAll(
          'td[headers="t3"] strong'
        );

        const arrayOfObjects = Array.from(ViewUrls).map((url, index) => {
          const date = (() => {
            const textDate = enactmentDate[index].innerText;
            const parsedDate = new Date(textDate);
            if (!isNaN(parsedDate)) {
              return parsedDate.toISOString();
            } else {
              console.log("fallback date bruh", textDate);
              return textDate;
            }
          })();
          return {
            websiteUrl: url.href,
            actDate: date,
            actNumber: actNumbers[index].innerText,
            shortTitle: shortTitles[index].innerText,
            uniqueId: region.uniqueId,
            regionId: region._id,
          };
        });
        return arrayOfObjects;
      }, region);

      console.log("scrappedData", scrappedData);

      await LawModel.insertMany(scrappedData)
        .then((docs) => {
          console.log("Documents inserted:", docs);
        })
        .catch((err) => {
          console.error("Insertion failed:", err);
        });
    }

    await browser.close();
  } catch (error) {
    console.error("Something went wrong due to ", error);
  }
};

const scrapPdfUsingActUrls = async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    );

    // const laws = await LawModel.find();
    const laws = await LawModel.find({ error: "Something went wrong" });
    console.log("length", laws.length);
    for (const law of laws) {
      try {
        await page.goto(law.websiteUrl!, {
          waitUntil: "networkidle2",
          timeout: 120000,
        });
        const pdfLink = await page.evaluate(() => {
          const links = Array.from(
            document.querySelectorAll('a[target="_blank"]')
          );
          const allLinks = links
            .map((link) => link.href)
            .find((href) => href.endsWith(".pdf"));
          return allLinks;
        });
        await LawModel.findByIdAndUpdate(law._id, {
          pdfUrl: pdfLink,
          error: "",
        });
        console.log(`Successful`, law._id);
      } catch (error) {
        await LawModel.findByIdAndUpdate(law._id, {
          error: "Something went wrong",
          pdfUrl: "",
        });
        console.log(`error in ${law._id} due to`, error);
      }
    }
  } catch (error) {
    console.error("Something went wrong due to ", error);
  }
};

const generateAndSaveEmbeddings = async () => {
  try {
    const laws = await LawModel.find({ shortTitle: "Constitution" });
    console.log("laws", laws.length);

    for (const law of laws) {
      try {
        const content = await fetchAndParsePDF({ url: law.pdfUrl! });
        // if (content) {
        //   console.log("content", content);
        //   const textSplitter = new RecursiveCharacterTextSplitter({
        //     chunkSize: 2000,
        //     chunkOverlap: 500,
        //   });
        //   const chunks = await textSplitter.splitText(content);
        //   console.log("chunks", chunks);

        //   const documentRes = await generateEmbeddings(chunks);
        //   // const documentRes = await model.embedDocuments(chunks);
        //   law.content = content;
        //   law.embeddings = documentRes;
        //   law.isTrained = true;
        //   law.error = "";
        //   await law.save();
        //   console.log("completed", law.shortTitle);
        // } else {
        //   console.log("did not completed", law.shortTitle);
        // }
      } catch (error) {
        console.log("Failed", law.shortTitle);
        console.error(`Error processing ${law.shortTitle}:`, error);
        law.isTrained = true;
        law.embeddings = [];
        law.error = "FAILED_TO_SAVE_EMBEDDINGS";
        await law.save();
      }
    }
  } catch (error) {
    console.error(
      `Something went wrong in generateAndSaveEmbeddings due to `,
      error
    );
  }
};

export {
  handleSeedRegions,
  scrapAndStoreActUrls,
  scrapPdfUsingActUrls,
  generateAndSaveEmbeddings,
};
