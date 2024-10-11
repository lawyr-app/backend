const { states, baseUrl } = require("./constant");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const limit = 2000;

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    );

    const dir = path.join(__dirname, "acts");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    for (const state of states) {
      const url = baseUrl
        .replace("#ID", String(state.id))
        .replace("#LIMIT", String(limit));

      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 120000,
      });

      const tableData = await page.evaluate(() => {
        const ViewUrls = document.querySelectorAll('td[headers="t4"] a');
        console.log("ViewUrls", ViewUrls);
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
            url: url.href,
            date,
            actNumber: actNumbers[index].innerText,
            shortTitle: shortTitles[index].innerText,
          };
        });
        return arrayOfObjects;
      });
      console.log("tableData", tableData);

      if (tableData) {
        const filePath = path.join(
          dir,
          `${state.name.replace(/ /g, "_")}.json`
        );
        fs.writeFileSync(filePath, JSON.stringify(tableData, null, 2), "utf-8");
        console.log(`Data for ${state.name} saved to ${filePath}`);
      } else {
        console.log(`No data found for state: ${state.name}`);
      }
    }

    await browser.close();
  } catch (error) {
    console.error("Something went wrong due to ", error);
  }
})();
