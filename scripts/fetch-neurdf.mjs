#!/usr/bin/env node
/**
 * Download the reasoned neurdf ontology to `public/data/`, so the app can serve it same-origin.
 *
 * Why this exists: the upstream endpoint has no caching yet and answers the ~16MB body in ~9s on
 * a good day, with enough flakiness that the client already retries three times. Fetching it once
 * at image-build time and serving it as a static asset turns that into a local, cacheable GET.
 * This is a temporary shim — delete it once the source server caches (see README note below).
 *
 * Used by:
 *   - the Dockerfile (build stage), so the file is baked into the image
 *   - `yarn fetch-data` for local development
 *   - `yarn build-fixture`, so the parser fixture is derived from current source data
 *
 * Usage:
 *   node scripts/fetch-neurdf.mjs [--out path] [--url url] [--force]
 *
 * Exit codes: 0 written (or already current), 2 download/validation failed.
 */

import { writeFile, mkdir, stat } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Single source of truth for the URL is gridConfig.ts, which the app itself reads. Parsing it
// here (rather than duplicating the string) means the two cannot drift apart silently — and if
// the constant is renamed this fails loudly instead of downloading the wrong thing.
const readConfiguredUrl = () => {
  const config = readFileSync(resolve(ROOT, "src/components/CellCards/config/gridConfig.ts"), "utf8");
  const match = /export const NEURDF_URL\s*=\s*\n?\s*"([^"]+)"/.exec(config);
  if (!match) {
    throw new Error(
      "Could not find NEURDF_URL in src/components/CellCards/config/gridConfig.ts — " +
        "if it was renamed, update this script so the two stay in step."
    );
  }
  return match[1];
};

const readConfiguredOut = () => {
  const config = readFileSync(resolve(ROOT, "src/components/CellCards/config/gridConfig.ts"), "utf8");
  const match = /export const NEURDF_LOCAL_URL\s*=\s*"([^"]+)"/.exec(config);
  // The served path is /data/...; on disk that is public/data/...
  const served = match ? match[1] : "/data/npo-merged-neurdf.jsonld";
  return resolve(ROOT, "public", served.replace(/^\//, ""));
};

const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};

const url = arg("url") || process.env.NEURDF_URL || readConfiguredUrl();
const out = arg("out") || process.env.NEURDF_OUT || readConfiguredOut();
const force = process.argv.includes("--force");

const MIN_BYTES = 1_000_000; // a truncated or error body is nowhere near this

// Same guards the runtime loader applies, so a bad payload fails here at build time rather than
// silently shipping an image that serves an HTML error page as "the ontology".
const validate = (text) => {
  if (text.length < MIN_BYTES) throw new Error(`Body is only ${text.length} bytes — expected >${MIN_BYTES}`);
  if (text.trimStart().startsWith("<")) throw new Error("Received HTML, not JSON-LD");
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error(`Body is not valid JSON: ${err.message}`);
  }
  if (!Array.isArray(data["@graph"]) || data["@graph"].length === 0) {
    throw new Error("Parsed JSON has no non-empty @graph");
  }
  return data["@graph"].length;
};

const main = async () => {
  if (!force) {
    const existing = await stat(out).catch(() => null);
    if (existing && existing.size > MIN_BYTES) {
      console.log(`[neurdf] ${out} already present (${(existing.size / 1e6).toFixed(1)} MB) — pass --force to refetch`);
      return;
    }
  }

  console.log(`[neurdf] GET ${url}`);
  const started = Date.now();
  const res = await fetch(url, { headers: { Accept: "application/ld+json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  // The endpoint serves the body as text/plain, so parse rather than trusting the content type.
  const text = await res.text();
  const nodes = validate(text);

  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, text);

  // Pre-compress so nginx `gzip_static` can serve the deflated bytes directly instead of
  // compressing 16MB on every cache miss. Written next to the file, which is where nginx looks.
  const gz = gzipSync(Buffer.from(text), { level: 9 });
  await writeFile(`${out}.gz`, gz);

  const secs = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    `[neurdf] wrote ${out} — ${(text.length / 1e6).toFixed(1)} MB, ${nodes} nodes, ${secs}s\n` +
      `[neurdf] wrote ${out}.gz — ${(gz.length / 1e6).toFixed(1)} MB ` +
      `(${((1 - gz.length / text.length) * 100).toFixed(0)}% smaller)`
  );
};

main().catch((err) => {
  console.error(`[neurdf] FAILED: ${err.message}`);
  process.exit(2);
});
