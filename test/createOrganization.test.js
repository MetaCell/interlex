//IMPORTS:
const selectors = require('./selectors');
const puppeteer = require("puppeteer");

// INFO
const USERNAME = process.env.TEST_USERNAME 
const PASSWORD = process.env.TEST_PASSWORD 
const baseURL = process.env.DOMAIN || 'https://interlex.dev.metacell.us/'

const ORGANIZATION_TEXT = [`If you would like to create a new organization please contact support@interlex.org with "new organization request" as the subject. Please include the name of the organization that you would like to create, a brief explaination of what it will be used for, and the interlex username associated with the email you are sending from which will become the owner of the new organization.`]

//TESTS:

jest.setTimeout(60000);
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

        await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
        const pageTitle = await page.title();
        console.log(pageTitle);
        expect(pageTitle).toBe('Interlex')
    });

    afterAll(async () => {

        await browser.close()
    })

    describe('Login', () => {

        it('Home Page check', async () => {
            console.log('Going to the homepage ...')
            await page.waitForSelector('a[href="/"]', { timeout: 1000 });
            await page.waitForSelector('.MuiAutocomplete-root', { timeout: 1000 });
            console.log('Homepage found')

        });

        it('Login using ORCid', async () => {
            console.log('Logging in ...');
            console.log('Testing user: ' + USERNAME)
            await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const loginButton = buttons.find(btn => btn.innerText === 'Log in');
                if (loginButton) loginButton.click();
                else throw new Error("Log In button not found");
            });

            await page.waitForSelector('h4.MuiTypography-root.MuiTypography-h4', { timeout: 1000 });
            await page.waitForSelector('div:has(input[name="username"])', { timeout: 1000 });


            // Store the pages before clicking
            const pagesBefore = await browser.pages();

            // Click the "Sign in with ORCID" button
            await page.evaluate(() => {
                const btns = Array.from(document.querySelectorAll('button'));
                const orcidloginbtn = btns.find(btn => btn.innerText === 'Sign in with ORCID');
                if (orcidloginbtn) orcidloginbtn.click();
                else throw new Error("Sign in with ORCID button not found");
            });

            // Wait for the new page to open
            let orcidPage;
            await browser.waitForTarget(
                target => target.url().includes('orcid.org'),
                { timeout: 5000 }
            );
            const pagesAfter = await browser.pages();
            orcidPage = pagesAfter.find(p => !pagesBefore.includes(p));

            // Wait for the ORCID page to load
            await orcidPage.bringToFront();
            await orcidPage.waitForNavigation({ waitUntil: 'domcontentloaded' });

            // Now interact with the ORCID page
            await orcidPage.waitForSelector('#onetrust-accept-btn-handler', { timeout: 1000 });
            await orcidPage.click('#onetrust-accept-btn-handler');
            await orcidPage.waitForSelector('#username-input', { timeout: 1000 });
            await orcidPage.type('#username-input', USERNAME);
            await orcidPage.waitForSelector('#password', { timeout: 1000 });
            await orcidPage.type('#password', PASSWORD);
            await orcidPage.waitForSelector('#signin-button');
            await orcidPage.click('#signin-button');

            await new Promise(resolve => orcidPage.once('close', resolve));
            await page.waitForSelector('.MuiAvatar-root.MuiAvatar-circular.MuiAvatar-colorDefault', { timeout: 1000 });
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Logged In');
        });
    })

    describe('Create Organization', () => {

        it('Organizations page', async () => {
            console.log('Checking organizations page ...')

            await page.waitForSelector('.MuiButtonBase-root.MuiButton-root.MuiButton-outlined.MuiButton-outlinedPrimary.MuiButton-sizeMedium.MuiButton-outlinedSizeMedium.MuiButton-colorPrimary.MuiButton-disableElevation.MuiButton-root.MuiButton-outlined.MuiButton-outlinedPrimary.MuiButton-sizeMedium.MuiButton-outlinedSizeMedium.MuiButton-colorPrimary.MuiButton-disableElevation', { timeout: 1000 });
            await page.click('.MuiButtonBase-root.MuiButton-root.MuiButton-outlined.MuiButton-outlinedPrimary.MuiButton-sizeMedium.MuiButton-outlinedSizeMedium.MuiButton-colorPrimary.MuiButton-disableElevation.MuiButton-root.MuiButton-outlined.MuiButton-outlinedPrimary.MuiButton-sizeMedium.MuiButton-outlinedSizeMedium.MuiButton-colorPrimary.MuiButton-disableElevation');
            await page.waitForSelector('.MuiPaper-elevation ul.MuiList-padding', { timeout: 1000 });
            await page.waitForSelector('.MuiPaper-elevation ul.MuiList-padding li', { timeout: 1000 });
            
            await page.evaluate(() => {
                const listbtns = Array.from(document.querySelectorAll('.MuiPaper-elevation ul.MuiList-padding li div'));
                const orgbtn = listbtns.find(listbtn => listbtn.innerText === 'Organizations');
                if (orgbtn) orgbtn.click();
                else throw new Error("Organizations button not found");
            });
            // await page.waitForSelector('span[role="progressbar"]', { timeout: 2000, hidden: false });
            // await page.waitForSelector('span[role="progressbar"]', { timeout: 2000, hidden: true });

            await page.waitForSelector('button.MuiButtonBase-root.MuiButton-root.MuiButton-text.MuiButton-textPrimary.MuiButton-sizeMedium.MuiButton-textSizeMedium.MuiButton-colorPrimary.MuiButton-disableElevation', { timeout: 2000 });
            await new Promise(resolve => setTimeout(resolve, 1000));
        })
        it('Create org', async () => {
            await page.waitForSelector('button.MuiButtonBase-root.MuiButton-root.MuiButton-text.MuiButton-textPrimary.MuiButton-sizeMedium.MuiButton-textSizeMedium.MuiButton-colorPrimary.MuiButton-disableElevation', { timeout: 2000 });
            await page.evaluate(() => {
                const btn = Array.from(document.querySelectorAll('button.MuiButtonBase-root.MuiButton-root.MuiButton-text.MuiButton-textPrimary.MuiButton-sizeMedium.MuiButton-textSizeMedium.MuiButton-colorPrimary.MuiButton-disableElevation'))
                    .find(btn => btn.innerText.trim() === 'Create a new organization');
                if (btn) btn.click();
                else throw new Error('Create new organization button not found');
            });
            await page.waitForSelector('div[aria-describedby="alert-dialog-description"]', { timeout: 3000 });
            await page.waitForSelector('div[aria-describedby="alert-dialog-description"] > div', { timeout: 2000 });

            const popupText = await page.evaluate(() => {
                return Array.from(
                    document.querySelectorAll('div[aria-describedby="alert-dialog-description"] > div')
                ).map(el => el.innerText.trim());
            });

            ORGANIZATION_TEXT.forEach(txt => {
                expect(popupText.some(text => text.includes(txt))).toBe(true);
            });
        })
    })
})