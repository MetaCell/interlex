const { launchBrowser } = require("./helpers/browser");
const { getTexts, waitForText } = require("./helpers/dom");
const { BASE_URL, TIMEOUT } = require("./helpers/constants");

const MEDULLA_URI = "http://uri.interlex.org/base/ilx_0106736"

const MEDULLA_SYNONYMS = [
    "Afterbrain",
    "Bulb",
    "bulbus",
    "Epencephalon",
    "medulla",
    "medulla oblonzata",
    "Metencephalon",
    "metepencephalon"
];

const MEDULLA_PREFERRED_ID = ["http://uri.interlex.org/base/ilx_0106736"]
// Existing IDs now render as CURIEs (the full URI lives in the chip's href, not its label) —
// see IriChip / the "predicates use CURIE if available" change.
const MEDULLA_EXISTING_ID = [
    "FMA:62004",
    "BIRNLEX:957"
]

const MEDULLA_DESCRIPTION = ["The lower portion of the hindbrain and brainstem located between the pons and spinal cord. This structure contains several descending and ascending tracts, lower cranial nerve nuclei, a significant proportion of the reticular system of the brainstem and other structures (adapted from NCI Thesaurus).The topographic division of the cerebrospinal axis between pons and spinal cord. It was clearly described and illustrated for macrodissected adult humans by Piccolomini (1586, pp. 265, 269; his intracranial medulla oblongata), while the term medulla was used by Winslow (1733, Sect. X, p. 42) and Haller (1747, see translation by Mihles, 1754, pp. 287, 286), and more recently in the classic textbooks of for example Mettler (1948, p. 76) and Carpenter (1976, p. 60)."]

const PREDICATE_HEADERS = [
    "@id",
    "@type",
    "definition",
    "ilxr:synonym",
    // Renamed from ilxtr:hasExistingId — see Details.jsx's FIELD_PREDICATES.
    "ilxtr:hasExternalId",
    "rdfs:label",
    // The hierarchy predicate moved from rdfs:subClassOf to this custom predicate.
    "ilx.partOf",
];

// The predicates table is the strongest generic signal that a term's detail view has finished
// rendering (every term has one), so waits below use it instead of racing a loading spinner's
// appear-then-disappear — that intermediate state is incidental and can be too brief to catch.
const PREDICATES_PANEL_HEADER = '[id^="panel"][id$="-header"]';

jest.setTimeout(60000 * 2);
// CI hits a real deployment over the network; retrying absorbs a single transient blip
// (a slow backend response, a dropped request) without masking a genuine, repeatable failure.
if (typeof jest.retryTimes === "function") {
    jest.retryTimes(2, { logErrorsBeforeRetry: true });
}

let page;
let browser;

describe('Smoke Tests', () => {

    beforeAll(async () => {
        browser = await launchBrowser();
        page = await browser.newPage();

        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
        const pageTitle = await page.title();
        expect(pageTitle).toBe('Interlex')
    });

    afterAll(async () => {
        await browser.close()
    })

    describe('Start test', () => {

        it('Home Page check', async () => {
            await page.waitForSelector('a[href="/"]', { timeout: TIMEOUT.medium });
            await page.waitForSelector('.MuiAutocomplete-root', { timeout: TIMEOUT.medium });
        });

    })

    describe('Search functionality', () => {

        it('Search for medulla', async () => {
            await page.waitForSelector('input[placeholder="Find something..."]', { timeout: TIMEOUT.medium });
            await page.click('input[placeholder="Find something..."]');
            await page.type('input[placeholder="Find something..."]', 'medulla');

            await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const browse_all_button = buttons.find(btn => btn.innerText.trim() === 'Browse all');
                if (browse_all_button) browse_all_button.click();
                else throw new Error("Browse all button not found");
            });
        })

        it('Browse all results & open medulla', async () => {
            await page.waitForSelector('h6', { timeout: TIMEOUT.long });
            await page.evaluate(() => {
                const headers = Array.from(document.querySelectorAll('h6'));
                const header_results = headers.find(hdr => hdr.innerText.trim() === 'medulla');
                if (header_results) header_results.click();
                else throw new Error("Medulla not found");
            });
            await page.waitForSelector(PREDICATES_PANEL_HEADER, { timeout: TIMEOUT.long });
        })


    })

    describe('Check medulla overview', () => {

        it('Check URI', async () => {
            // The canonical URI is the link's visible text, not its href: the app deliberately
            // keeps the href pointed at this term's own page rather than at uri.interlex.org
            // directly — see CopyLinkComponent.
            await waitForText(page, 'a', MEDULLA_URI, { timeout: TIMEOUT.medium });
        });

        it('Check Synonyms', async () => {
            await page.waitForSelector('.MuiGrid-item .MuiStack-root span.MuiChip-label.MuiChip-labelMedium', { timeout: TIMEOUT.medium });
            const chipTexts = await getTexts(page, '.MuiGrid-item .MuiStack-root span.MuiChip-label.MuiChip-labelMedium');
            MEDULLA_SYNONYMS.forEach(syn => {
                expect(chipTexts.some(text => text.includes(syn))).toBe(true);
            });
        });

        it('Check Preferred ID', async () => {
            await page.waitForSelector('p.MuiTypography-root', { timeout: TIMEOUT.medium });
            const pTexts = await getTexts(page, 'p.MuiTypography-root');
            MEDULLA_PREFERRED_ID.forEach(id => {
                expect(pTexts.some(text => text.includes(id))).toBe(true);
            });
        });

        it('Check Existing ID', async () => {
            await page.waitForSelector('.MuiGrid-item .MuiStack-root span.MuiChip-label.MuiChip-labelMedium', { timeout: TIMEOUT.medium });
            const chipTexts = await getTexts(page, '.MuiGrid-item .MuiStack-root span.MuiChip-label.MuiChip-labelMedium');
            MEDULLA_EXISTING_ID.forEach(id => {
                expect(chipTexts.some(text => text.includes(id))).toBe(true);
            });
        });

        it('Check Description', async () => {
            await page.waitForSelector('p.MuiTypography-root', { timeout: TIMEOUT.medium });
            const pTexts = await getTexts(page, 'p.MuiTypography-root');
            MEDULLA_DESCRIPTION.forEach(id => {
                expect(pTexts.some(text => text.includes(id))).toBe(true);
            });
        });

    })

    describe('Check Predicates table', () => {

        it('Check Headers', async () => {
            await page.waitForSelector(PREDICATES_PANEL_HEADER, { timeout: TIMEOUT.medium });
            const panelHeaderTexts = await getTexts(page, PREDICATES_PANEL_HEADER);
            PREDICATE_HEADERS.forEach(expected => {
                expect(panelHeaderTexts.some(text => text.includes(expected))).toBe(true);
            });
        });
    })


})
