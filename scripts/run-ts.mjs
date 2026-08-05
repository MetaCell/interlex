#!/usr/bin/env node
/**
 * Run a script that imports TypeScript, on plain Node, with no extra dependency.
 *
 *   node scripts/run-ts.mjs <entry.mjs> [args...]
 *
 * Why not vite-node / tsx: both would be a new dependency, and the versions new enough to still
 * be maintained require Node >= 20 while the Docker build image is node:18-alpine — adding one
 * broke `yarn install` inside the container. esbuild is already present as a vite dependency and
 * is all this needs.
 *
 * The bundle is written next to the entry so `import.meta.url` still resolves to the same
 * directory (the parser fixture is read relative to it), then removed afterwards.
 */

import { build } from "esbuild";
import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";

const [entry, ...rest] = process.argv.slice(2);
if (!entry) {
  console.error("usage: node scripts/run-ts.mjs <entry> [args...]");
  process.exit(64);
}

const entryPath = resolve(entry);
const outfile = resolve(dirname(entryPath), `.${basename(entryPath, ".mjs")}.bundle.mjs`);

const cleanup = () => rm(outfile, { force: true });

try {
  await build({
    entryPoints: [entryPath],
    outfile,
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node18",
    // Only our own sources need bundling; node builtins and anything from node_modules stay
    // external so this does not try to bundle the whole dependency tree.
    packages: "external",
    logLevel: "warning",
  });
} catch {
  await cleanup();
  process.exit(1); // esbuild already printed the error
}

const child = spawn(process.execPath, [outfile, ...rest], { stdio: "inherit" });
child.on("exit", async (code, signal) => {
  await cleanup();
  process.exit(signal ? 1 : (code ?? 1));
});
