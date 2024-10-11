const { states, baseUrl } = require("./constant");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

function readJsonFile(filePath, callback) {
  const fullPath = path.join(__dirname, filePath);

  fs.readFile(fullPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      return callback(err, null); // Pass error to callback
    }
    try {
      const jsonData = JSON.parse(data);
      callback(null, jsonData); // Pass parsed data to callback
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      callback(parseError, null); // Pass parse error to callback
    }
  });
}

async function downloadFile(foldername, url) {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });
  const writer = fs.createWriteStream(
    path.resolve(`./pdfs/${foldername}`, path.basename(url))
  );
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}
// https://www.indiacode.nic.in/bitstream/123456789/17132/1/thebondedlaboursystem%28abolition%29act1976.pdf

(async () => {
  try {
    // const browser = await puppeteer.launch({ headless: false });
    // const page = await browser.newPage();
    // await page.setUserAgent(
    //   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    // );

    const dir = path.join(__dirname, "pdfs");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    for (const state of states) {
      const { file, id, name } = state;
      const filePath = `./acts/${file}`;
      const nameDir = path.join(dir, name);
      if (!fs.existsSync(nameDir)) {
        fs.mkdirSync(nameDir);
      }
      console.log(name, "started");
      readJsonFile(filePath, async (err, jsonData) => {
        if (err) {
          console.error("Failed to read JSON:", err);
        } else {
          const browser = await puppeteer.launch({ headless: false });
          const page = await browser.newPage();
          await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
          );
          for (const data of jsonData) {
            await page.goto(data.url, {
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
            downloadFile(name, pdfLink)
              .then(() => console.log("Download completed!"))
              .catch((err) => console.error("Download failed:", err));
          }
          await browser.close();
        }
      });
    }

    // await browser.close();
  } catch (error) {
    console.error("Something went wrong due to ", error);
  }
})();
