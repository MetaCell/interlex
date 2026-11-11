const puppeteer = require("puppeteer");

async function launchBrowser() {
  return puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new',
    defaultViewport: {
      width: 1600,
      height: 1000,
    },
  });
}

module.exports = { launchBrowser };
