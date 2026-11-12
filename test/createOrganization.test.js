const { launchBrowser } = require("./helpers/browser");
const { login } = require("./helpers/auth");
const { clickByText, getTexts } = require("./helpers/dom");
const { BASE_URL, USERNAME, PASSWORD, TIMEOUT } = require("./helpers/constants");

const ORGANIZATION_TEXT = [`If you would like to create a new organization please contact support@interlex.org with "new organization request" as the subject. Please include the name of the organization that you would like to create, a brief explaination of what it will be used for, and the interlex username associated with the email you are sending from which will become the owner of the new organization.`]

// The header's icon-only nav button has no visible text/label, so it can't use clickByText —
// this is the one selector in this file still matched by class. The class list here is
// deduplicated from the original, which repeated the same compound selector twice back to back.
const NAV_MENU_BUTTON = '.MuiButtonBase-root.MuiButton-outlined.MuiButton-outlinedPrimary.MuiButton-sizeMedium.MuiButton-outlinedSizeMedium.MuiButton-colorPrimary.MuiButton-disableElevation';
const CREATE_ORG_BUTTON = 'button.MuiButtonBase-root.MuiButton-root.MuiButton-text.MuiButton-textPrimary.MuiButton-sizeMedium.MuiButton-textSizeMedium.MuiButton-colorPrimary.MuiButton-disableElevation';

jest.setTimeout(60000);
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

        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
        const pageTitle = await page.title();
        expect(pageTitle).toBe('Interlex')
    });

    afterAll(async () => {
        await browser.close()
    })

    describe('Login', () => {

        it('Home Page check', async () => {
            await page.waitForSelector('a[href="/"]', { timeout: TIMEOUT.medium });
            await page.waitForSelector('.MuiAutocomplete-root', { timeout: TIMEOUT.medium });
        });

        it('Login', async () => {
            await login(page, { username: USERNAME, password: PASSWORD });
        });
    })

    describe('Create Organization', () => {

        it('Organizations page', async () => {
            await page.waitForSelector(NAV_MENU_BUTTON, { timeout: TIMEOUT.medium });
            await page.click(NAV_MENU_BUTTON);
            await page.waitForSelector('.MuiPaper-elevation ul.MuiList-padding li', { timeout: TIMEOUT.medium });

            await clickByText(page, '.MuiPaper-elevation ul.MuiList-padding li div', 'Organizations');

            // Wait directly for the organizations list UI rather than racing a loading
            // spinner's appear-then-disappear: that intermediate state is incidental (it can
            // be too brief to observe) and was a source of flakiness unrelated to what this
            // test actually verifies.
            await page.waitForSelector(CREATE_ORG_BUTTON, { timeout: TIMEOUT.long });
        })

        it('Create org', async () => {
            await clickByText(page, CREATE_ORG_BUTTON, 'Create a new organization');
            await page.waitForSelector('div[aria-describedby="alert-dialog-description"] > div', { timeout: TIMEOUT.medium });

            const popupText = await getTexts(page, 'div[aria-describedby="alert-dialog-description"] > div');
            ORGANIZATION_TEXT.forEach(txt => {
                expect(popupText.some(text => text.includes(txt))).toBe(true);
            });
        })
    })
})
