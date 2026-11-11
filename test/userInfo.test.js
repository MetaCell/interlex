const { launchBrowser } = require("./helpers/browser");
const { login, logout, AVATAR, AVATAR_BUTTON } = require("./helpers/auth");
const { getTexts } = require("./helpers/dom");
const { BASE_URL, USERNAME, PASSWORD, TIMEOUT } = require("./helpers/constants");

const USER_INFO = [
    "dariodippi",
];
const USER_EMAIL_INFO = [
    "dariodippi@gmail.com",
];

const USER_ORCID_ID = ["https://sandbox.orcid.org/0009-0008-7651-6771"]
const USER_DASHBOARD = ["dariodippi dashboard"]

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

        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
        const pageTitle = await page.title();
        expect(pageTitle).toBe('Interlex')
    });

    afterAll(async () => {
        await browser.close()
    })

    describe('Login Flow', () => {

        it('Home Page check', async () => {
            await page.waitForSelector('a[href="/"]', { timeout: TIMEOUT.medium });
            await page.waitForSelector('.MuiAutocomplete-root', { timeout: TIMEOUT.medium });
        });

        it('Login', async () => {
            await login(page, { username: USERNAME, password: PASSWORD });
        });
    })

    describe('Post Login Checks', () => {

        it('User Info', async () => {
            await page.waitForSelector(AVATAR_BUTTON, { timeout: TIMEOUT.medium });
            await page.click(AVATAR_BUTTON);
            await page.waitForSelector('.MuiListItem-gutters .MuiListItemAvatar-root', { timeout: TIMEOUT.medium });
            await page.waitForSelector('.MuiListItem-gutters .MuiListItemText-root .MuiListItemText-primary', { timeout: TIMEOUT.medium });
            await page.waitForSelector('.MuiListItem-gutters .MuiListItemText-root .MuiListItemText-secondary', { timeout: TIMEOUT.medium });

            const primaryTexts = await getTexts(page, '.MuiListItem-gutters .MuiListItemText-root .MuiListItemText-primary');
            USER_INFO.forEach(expected => {
                expect(primaryTexts.some(text => text.includes(expected))).toBe(true);
            });

            const secondaryTexts = await getTexts(page, '.MuiListItem-gutters .MuiListItemText-root .MuiListItemText-secondary');
            USER_EMAIL_INFO.forEach(expected => {
                expect(secondaryTexts.some(text => text.includes(expected))).toBe(true);
            });

            await page.waitForSelector(AVATAR_BUTTON, { timeout: TIMEOUT.medium });
            await page.click(AVATAR_BUTTON);
        })

        it('My Dashboard', async () => {
            await page.waitForSelector(AVATAR_BUTTON, { timeout: TIMEOUT.medium });
            await page.click(AVATAR_BUTTON);
            await page.evaluate(() => {
                const user_dropdown_btns = Array.from(document.querySelectorAll('.MuiListItemButton-gutters'));
                const myDashboardbtn = user_dropdown_btns.find(user_dropdown_btn => user_dropdown_btn.innerText === 'My dashboard');
                if (myDashboardbtn) myDashboardbtn.click();
                else throw new Error("My dashboard button not found");
            });

            await page.waitForFunction(
                () => window.location.pathname.endsWith('/dashboard'),
                { timeout: TIMEOUT.medium }
            );
            expect(page.url().endsWith('/dashboard')).toBe(true);

            // Wait directly for the dashboard's own content rather than for a loading spinner to
            // appear-then-disappear: that intermediate state is incidental (it can be too brief
            // to observe) and racing it was a source of flakiness independent of the login flow.
            await page.waitForSelector('.MuiPagination-text', { timeout: TIMEOUT.long });

            await page.waitForSelector(AVATAR_BUTTON, { timeout: TIMEOUT.medium });
            await page.click(AVATAR_BUTTON);

            const ps = await getTexts(page, 'p');
            USER_DASHBOARD.forEach(expected => {
                expect(ps.some(text => text.includes(expected))).toBe(true);
            });
            USER_ORCID_ID.forEach(expected => {
                expect(ps.some(text => text.includes(expected))).toBe(true);
            });
            USER_EMAIL_INFO.forEach(expected => {
                expect(ps.some(text => text.includes(expected))).toBe(true);
            });
        })
    })

    describe('Logout Flow', () => {

        it('Logout', async () => {
            await logout(page);
        })
    })

})
