import puppeteer from "puppeteer";
import { LawModel } from "../model/Law";
import { connectDB } from "../utils/connectDb";
require("dotenv").config();

const handle = async () => {
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

connectDB({
  onSuccess: () => {
    handle();
  },
  mogoUrl: process.env.MONGODB!,
});
