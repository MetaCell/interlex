//IMPORTS:
const selectors = require('./selectors');
const puppeteer = require("puppeteer");

// INFO
const USERNAME = process.env.TEST_USERNAME 
const PASSWORD = process.env.TEST_PASSWORD 
const baseURL = 'https://interlex.dev.metacell.us/'



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
            // headless: 'new',
            headless: false,
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

    describe('Login Flow', () => {

        it('Home Page check', async () => {
            console.log('Going to the homepage ...')
            await page.waitForSelector('a[href="/"]', { timeout: 1000 });
            await page.waitForSelector('.MuiAutocomplete-root', { timeout: 1000 });
            console.log('Homepage found')

        });

        it('Login using ORCid', async () => {
            console.log('Logging in ...');
            console.log('Testing user: ' + USERNAME)
            console.log('page is:', typeof page, page && page.constructor && page.constructor.name);
            await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const loginButton = buttons.find(btn => btn.innerText === 'Log in');
            if (loginButton) loginButton.click();
            else throw new Error("Log In button not found");
            });

            await page.waitForSelector('h4.MuiTypography-root.MuiTypography-h4', { timeout: 1000 });
            await page.waitForSelector('div:has(input[name="username"])', { timeout: 1000 });

            await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const orcidloginbtn = btns.find(btn => btn.innerText === 'Sign in with ORCID');
            if (orcidloginbtn) orcidloginbtn.click();
            else throw new Error("Sign in with ORCID button not found");
            });

            console.log('Logged In');
        });
    })

    describe('Post Login Checks', () => {

        it('User Info', async () => {
            console.log(' ...')

           
            console.log('')
        })

        it('My Dashboard', async () => {
            console.log(' ...')

           
            console.log('')
        })
    })

    describe('Logout Flow', () => {

        it('Logout', async () => {
            console.log('Logging out ...')

           
            console.log('User logged out')
        })
    })

})