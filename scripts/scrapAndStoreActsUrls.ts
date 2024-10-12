import { baseUrl } from "../constant/seed";
import puppeteer from "puppeteer";
import { LawModel } from "../model/Law";
import { connectDB } from "../utils/connectDb";
import { RegionsModel } from "../model/Regions";
require("dotenv").config();

// NOTE - This is the limit which we are setting...as of now the
// number of acts by states/UT/central acts are below 1000

const handleScrapAndStore = () => {
  (async () => {
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
  })();
};

connectDB({
  onSuccess: () => {
    handleScrapAndStore();
  },
  mogoUrl: process.env.MONGODB!,
});
