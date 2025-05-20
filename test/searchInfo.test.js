//IMPORTS:
const selectors = require('./selectors');
const puppeteer = require("puppeteer");

// INFO
const USERNAME = process.env.TEST_USERNAME 
const PASSWORD = process.env.TEST_PASSWORD 
const baseURL = process.env.URL || 'https://interlex.dev.metacell.us/'

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
const MEDULLA_EXISTING_ID = [
    "http://purl.org/sig/ont/fma/fma62004",
    "http://uri.neuinfo.org/nif/nifstd/birnlex_957"
]

const MEDULLA_DESCRIPTION = ["The lower portion of the hindbrain and brainstem located between the pons and spinal cord. This structure contains several descending and ascending tracts, lower cranial nerve nuclei, a significant proportion of the reticular system of the brainstem and other structures (adapted from NCI Thesaurus).The topographic division of the cerebrospinal axis between pons and spinal cord. It was clearly described and illustrated for macrodissected adult humans by Piccolomini (1586, pp. 265, 269; his intracranial medulla oblongata), while the term medulla was used by Winslow (1733, Sect. X, p. 42) and Haller (1747, see translation by Mihles, 1754, pp. 287, 286), and more recently in the classic textbooks of for example Mettler (1948, p. 76) and Carpenter (1976, p. 60)."]

 const PREDICATE_HEADERS = [
                "@id",
                "@type",
                "definition",
                "ilxr:synonym",
                "ilxtr:hasExistingId",
                "rdfs:label",
                "rdfs:subClassOf",
            ];

//TESTS:

jest.setTimeout(60000 * 2);
let page;
let browser;


describe('Smoke Tests', () => {

    beforeAll(async () => {

        browser = await puppeteer.launch({
            args: [
                '--no-sandbox', '--disable-setuid-sandbox', '--bail',
            ],
            headless: 'new',
            // headless: false,
            defaultViewport: {
                width: 1600,
                height: 1000,
            },
            // slowMo: 30
        });


        page = await browser.newPage();
        await console.log(
            "Checking page",
            baseURL
        );
        await console.log('Starting tests ...')

        await page.goto(baseURL, { waitUntil: 'domcontentloaded' })
        const pageTitle = await page.title();
        console.log(pageTitle);
        expect(pageTitle).toBe('Interlex')
    });

    afterAll(async () => {

        await browser.close()
    })

    describe('Start test', () => {

        it('Home Page check', async () => {
            console.log('Going to the homepage ...')
            await page.waitForSelector('a[href="/"]', { timeout: 1000 });
            await page.waitForSelector('.MuiAutocomplete-root', { timeout: 1000 });
            console.log('Homepage found')

        });

    })

    describe('Search functionality', () => {

        it('Search for medulla', async () => {
            console.log('Searching for medulla ...')

            await page.waitForSelector('input[placeholder="Find something..."]', { timeout: 1000 });
            await page.click('input[placeholder="Find something..."]');
            await page.type('input[placeholder="Find something..."]', 'medulla');

            await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const browse_all_button = buttons.find(btn => btn.innerText.trim() === 'Browse all');
                if (browse_all_button) browse_all_button.click();
                else throw new Error("Browse all button not found");
            });

            console.log('Medulla found')
        })

        it('Browse all results & open medulla', async () => {
            console.log('Browsing all results and opening medulla ...')
            await page.waitForSelector('span[role="progressbar"]', { timeout: 1000, hidden: false });
            await page.waitForSelector('span[role="progressbar"]', { timeout: 2000, hidden: true });
            await page.waitForSelector('span[role="progressbar"]', { timeout: 1000, hidden: false });
            await page.waitForSelector('span[role="progressbar"]', { timeout: 2000, hidden: true });
            await page.waitForSelector('h6', { timeout: 1000 });
            await page.evaluate(() => {
                const headers = Array.from(document.querySelectorAll('h6'));
                const header_results = headers.find(hdr => hdr.innerText.trim() === 'medulla');
                if (header_results) header_results.click();
                else throw new Error("Medulla not found");
            });
            await page.waitForSelector('span[role="progressbar"]', { timeout: 1000, hidden: false });
            await page.waitForSelector('span[role="progressbar"]', { timeout: 2000, hidden: true });
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log('Medulla details page opened')
        })


    })

    describe('Check medulla overview', () => {

        it('Check URI', async () => {
            console.log('Checking URI ...')
            await page.waitForSelector('a[href="http://uri.interlex.org/base/ilx_0106736"]', { timeout: 1000 });
            const linkText = await page.$eval(`a[href="${MEDULLA_URI}"]`, el => el.innerText.trim());
            expect(linkText).toBe(MEDULLA_URI);
            console.log('URI found')
        });

        it('Check Synonyms', async () => {
            console.log('Checking Synonyms ...')
            // Wait for all chips to appear
            await page.waitForSelector('.MuiGrid-item .MuiStack-root span.MuiChip-label.MuiChip-labelMedium', { timeout: 2000 });

            // Get all chip texts
            const chipTexts = await page.evaluate(() => {
                return Array.from(
                    document.querySelectorAll('.MuiGrid-item .MuiStack-root span.MuiChip-label.MuiChip-labelMedium')
                ).map(el => el.innerText.trim());
            });

            // Check each synonym
            MEDULLA_SYNONYMS.forEach(syn => {
                expect(chipTexts.some(text => text.includes(syn))).toBe(true);
            });
            console.log('Synonyms found')
        });

        it('Check Preferred ID', async () => {
            console.log('Checking Preferred ID ...')
            // Wait for all chips to appear
            await page.waitForSelector('p.MuiTypography-root', { timeout: 2000 });

            // Get all chip texts
            const pTexts = await page.evaluate(() => {
                return Array.from(
                    document.querySelectorAll('p.MuiTypography-root')
                ).map(el => el.innerText.trim());
            });

            // Check each exsting ID
            MEDULLA_PREFERRED_ID.forEach(id => {
                expect(pTexts.some(text => text.includes(id))).toBe(true);
            });
            console.log('Preferred ID found')

        });

        it('Check Existing ID', async () => {
            console.log('Checking Existing ID ...')
            // Wait for all chips to appear
            await page.waitForSelector('.MuiGrid-item .MuiStack-root span.MuiChip-label.MuiChip-labelMedium', { timeout: 2000 });

            // Get all chip texts
            const chipTexts = await page.evaluate(() => {
                return Array.from(
                    document.querySelectorAll('.MuiGrid-item .MuiStack-root span.MuiChip-label.MuiChip-labelMedium')
                ).map(el => el.innerText.trim());
            });

            // Check each exsting ID
            MEDULLA_EXISTING_ID.forEach(id => {
                expect(chipTexts.some(text => text.includes(id))).toBe(true);
            });
            console.log('Existing ID found')

        });

        it('Check Description', async () => {
            console.log('Checking Description ...')
            // Wait for all p's to appear
            await page.waitForSelector('p.MuiTypography-root', { timeout: 2000 });

            // Get all p's texts
            const pTexts = await page.evaluate(() => {
                return Array.from(
                    document.querySelectorAll('p.MuiTypography-root')
                ).map(el => el.innerText.trim());
            });

            // Check the existing Description
            MEDULLA_DESCRIPTION.forEach(id => {
                expect(pTexts.some(text => text.includes(id))).toBe(true);
            });
            console.log('Description found')
        });

    })

    describe('Check Predicates table', () => {
        
        it('Check Headers', async () => {
            console.log('Checking headers ...')
           // Wait for at least one panel header to appear
            await page.waitForSelector('[id^="panel"][id$="-header"]', { timeout: 2000 });

            // Get all panel header texts
            const panelHeaderTexts = await page.evaluate(() => {
                return Array.from(
                    document.querySelectorAll('[id^="panel"][id$="-header"]')
                ).map(el => el.innerText.trim());
            });

            PREDICATE_HEADERS.forEach(expected => {
                expect(panelHeaderTexts.some(text => text.includes(expected))).toBe(true);
            });
            console.log('Headers match')
        });
    })


})