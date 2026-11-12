const { TIMEOUT } = require("./constants");

// MUI generates its utility class names from theme internals, so matching on them (as this
// suite otherwise does) breaks on any styling change. Text content is the stable contract for
// interactive elements that have a visible label — prefer this over a class selector whenever
// the target has one.
//
// This polls (via waitForFunction) rather than checking once: a single-shot query can lose a
// race against a transient re-render between two `it` blocks, even right after a preceding
// `waitForSelector` confirmed the element existed moments earlier.
async function clickByText(page, selector, text, { timeout = TIMEOUT.medium } = {}) {
  const handle = await page.waitForFunction(
    (sel, label) => Array.from(document.querySelectorAll(sel)).find(
      (node) => node.innerText.trim() === label
    ) || false,
    { timeout },
    selector,
    text
  ).catch(() => {
    throw new Error(`Could not find "${selector}" with text "${text}"`);
  });

  const element = handle.asElement();
  await element.click();
}

async function getTexts(page, selector) {
  return page.evaluate(
    (sel) => Array.from(document.querySelectorAll(sel)).map((el) => el.innerText.trim()),
    selector
  );
}

// Waits for an element matching `selector` whose text is exactly `text` to exist, without
// clicking it — for asserting content that may still be streaming in (e.g. after an SPA
// navigation) rather than failing the instant a single snapshot query misses it.
async function waitForText(page, selector, text, { timeout = TIMEOUT.medium } = {}) {
  await page.waitForFunction(
    (sel, label) => Array.from(document.querySelectorAll(sel)).some(
      (node) => node.innerText.trim() === label
    ),
    { timeout },
    selector,
    text
  ).catch(() => {
    throw new Error(`Could not find "${selector}" with text "${text}"`);
  });
}

module.exports = { clickByText, getTexts, waitForText };
