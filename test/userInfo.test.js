//IMPORTS:
const puppeteer = require("puppeteer");

// INFO
const USERNAME = process.env.TEST_USERNAME 
const PASSWORD = process.env.TEST_PASSWORD 
const baseURL = process.env.DOMAIN || 'https://interlex.dev.metacell.us/'


const USER_INFO = [
    "dariodippi",
];
const USER_EMAIL_INFO = [
    "dariodippi@gmail.com",
];

const USER_ORCID_ID = ["https://sandbox.orcid.org/0009-0006-1293-2544"]
// const USER_DASHBOARD = [`${USER_INFO[0]} dashboard`]
const USER_DASHBOARD = ["dariodippi dashboard"]


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
            // slowMo: 50
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
            console.log('Logged In');
        });
    })

    describe('Post Login Checks', () => {

        it('User Info', async () => {
            console.log('Checking User Info ...')
            await page.waitForSelector('.MuiAvatar-root.MuiAvatar-circular.MuiAvatar-colorDefault', { timeout: 1000 });
            await page.waitForSelector('button:has(.MuiAvatar-root.MuiAvatar-circular.MuiAvatar-colorDefault)', { timeout: 1000 });
            await page.click('button:has(.MuiAvatar-root.MuiAvatar-circular.MuiAvatar-colorDefault)');
            await page.waitForSelector('.MuiListItem-gutters .MuiListItemAvatar-root', { timeout: 1000 });
            await page.waitForSelector('.MuiListItem-gutters .MuiListItemText-root .MuiListItemText-primary', { timeout: 1000 });
            await page.waitForSelector('.MuiListItem-gutters .MuiListItemText-root .MuiListItemText-secondary', { timeout: 1000 });

            const primaryTexts = await page.evaluate(() => {
                return Array.from(
                    document.querySelectorAll('.MuiListItem-gutters .MuiListItemText-root .MuiListItemText-primary')
                ).map(el => el.innerText.trim());
            });

            USER_INFO.forEach(expected => {
                expect(primaryTexts.some(text => text.includes(expected))).toBe(true);
            });

            const secondaryTexts = await page.evaluate(() => {
                return Array.from(
                    document.querySelectorAll('.MuiListItem-gutters .MuiListItemText-root .MuiListItemText-secondary')
                ).map(el => el.innerText.trim());
            });

            USER_EMAIL_INFO.forEach(expected => {
                expect(secondaryTexts.some(text => text.includes(expected))).toBe(true);
            });

            await page.waitForSelector('button:has(.MuiAvatar-root.MuiAvatar-circular.MuiAvatar-colorDefault)', { timeout: 1000 });
            await page.click('button:has(.MuiAvatar-root.MuiAvatar-circular.MuiAvatar-colorDefault)');
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('User info inspected')
        })

        it('My Dashboard', async () => {
            console.log('Checking My Dashboard ...')

            await page.waitForSelector('button:has(.MuiAvatar-root.MuiAvatar-circular.MuiAvatar-colorDefault)', { timeout: 1000 });
            await page.click('button:has(.MuiAvatar-root.MuiAvatar-circular.MuiAvatar-colorDefault)');
            await page.evaluate(() => {
                const user_dropdown_btns = Array.from(document.querySelectorAll('.MuiListItemButton-gutters'));
                const myDashboardbtn = user_dropdown_btns.find(user_dropdown_btn => user_dropdown_btn.innerText === 'My dashboard');
                if (myDashboardbtn) myDashboardbtn.click();
                else throw new Error("My dashboard button not found");
            });

            await page.waitForFunction(
                () => window.location.pathname.endsWith('/dashboard'),
                { timeout: 5000 }
            );
            expect(page.url().endsWith('/dashboard')).toBe(true);

            await page.waitForSelector('span[role="progressbar"]', { timeout: 2000, hidden: false });
            await page.waitForSelector('span[role="progressbar"]', { timeout: 2000, hidden: true });
            await page.waitForSelector('.MuiPagination-text', { timeout: 2000 });
            
            await page.waitForSelector('button:has(.MuiAvatar-root.MuiAvatar-circular.MuiAvatar-colorDefault)', { timeout: 1000 });
            await page.click('button:has(.MuiAvatar-root.MuiAvatar-circular.MuiAvatar-colorDefault)');

            const title_ps = await page.evaluate(() => {
                return Array.from(
                    document.querySelectorAll('p')
                ).map(el => el.innerText.trim());
            });

            USER_DASHBOARD.forEach(expected => {
                expect(title_ps.some(text => text.includes(expected))).toBe(true);
            });

            const subtitle_ps = await page.evaluate(() => {
                return Array.from(
                    document.querySelectorAll('p')
                ).map(el => el.innerText.trim());
            });


            USER_ORCID_ID.forEach(expected => {
                expect(subtitle_ps.some(text => text.includes(expected))).toBe(true);
            });

            USER_EMAIL_INFO.forEach(expected => {
                expect(subtitle_ps.some(text => text.includes(expected))).toBe(true);
            });

            console.log('My Dashboard inspected')
        })
    })

    describe('Logout Flow', () => {

        it('Logout', async () => {
            console.log('Logging out ...')

            await page.waitForSelector('button:has(.MuiAvatar-root.MuiAvatar-circular.MuiAvatar-colorDefault)', { timeout: 1000 });
            await page.click('button:has(.MuiAvatar-root.MuiAvatar-circular.MuiAvatar-colorDefault)');

            await page.evaluate(() => {
                const user_dropdown_btns = Array.from(document.querySelectorAll('.MuiListItemButton-gutters'));
                const logoutBtn = user_dropdown_btns.find(user_dropdown_btn => user_dropdown_btn.innerText === 'Log out');
                if (logoutBtn) logoutBtn.click();
                else throw new Error("Log out button not found");
            });
            await page.waitForSelector(
                'button:has(.MuiAvatar-root.MuiAvatar-circular.MuiAvatar-colorDefault)',
                { timeout: 2000, hidden: true }
            );

            console.log('User logged out')
        })
    })

})