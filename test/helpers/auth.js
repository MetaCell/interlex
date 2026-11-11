const { BASE_URL, TIMEOUT } = require("./constants");
const { clickByText } = require("./dom");

const AVATAR = '.MuiAvatar-root.MuiAvatar-circular.MuiAvatar-colorDefault';
const AVATAR_BUTTON = `button:has(${AVATAR})`;

// Logs in through InterLex's own username/password form instead of the ORCID OAuth popup the
// suite used previously. That popup flow depends on a sandbox.orcid.org account (a separate
// credential from the ones this suite is given) and a third-party domain being reachable and
// not showing an unexpected consent/interstitial screen — none of which this suite is actually
// trying to verify, and all of which were recurring, unrelated sources of CI flakiness.
async function login(page, { username, password }) {
  await page.goto(`${BASE_URL}login`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('h4.MuiTypography-root.MuiTypography-h4', { timeout: TIMEOUT.medium });

  await page.waitForSelector('input[name="username"]', { timeout: TIMEOUT.medium });
  await page.type('input[name="username"]', username);
  await page.type('input[name="password"]', password);

  await clickByText(page, 'button', 'Sign in');

  // The success path awaits a real backend call (fetch user settings) before the avatar
  // renders, so this needs the long tier rather than a short one.
  await page.waitForSelector(AVATAR, { timeout: TIMEOUT.long });
}

async function logout(page) {
  await page.waitForSelector(AVATAR_BUTTON, { timeout: TIMEOUT.medium });
  await page.click(AVATAR_BUTTON);
  await clickByText(page, '.MuiListItemButton-gutters', 'Log out');
  await page.waitForSelector(AVATAR_BUTTON, { timeout: TIMEOUT.long, hidden: true });
}

module.exports = { login, logout, AVATAR, AVATAR_BUTTON };
