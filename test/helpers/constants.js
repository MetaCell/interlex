const BASE_URL = process.env.DOMAIN || 'https://interlex.dev.metacell.us/';
const USERNAME = process.env.TEST_USERNAME;
const PASSWORD = process.env.TEST_PASSWORD;

// CI runs against a real deployment over the network (dev backend + ES + the app itself), so
// timeouts need headroom beyond what's needed against a local build. Two tiers cover: a
// fetch-backed element (medium), and a full page load or multi-request chain like the login
// round trip (long).
const TIMEOUT = {
  medium: 8000,
  long: 15000,
};

module.exports = { BASE_URL, USERNAME, PASSWORD, TIMEOUT };
