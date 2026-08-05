#!/usr/bin/env node
/**
 * Regenerate `neurdf-precision-sample.jsonld` from the full ontology.
 *
 *   yarn fetch-data --force        # get current source data
 *   yarn build-fixture             # trim it down to the fixture
 *
 * The fixture must be derived from the *source* file rather than hand-edited, so that when the
 * upstream ontology changes shape the checks fail against real data instead of quietly passing
 * against a stale hand-maintained sample.
 *
 * Reads the same `public/data/` copy the app serves, so whatever you just downloaded is what the
 * fixture is cut from. Fails loudly if a chosen cell has lost a property the checks rely on —
 * that is a signal to look at the upstream change, not to silently regenerate a weaker fixture.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, "../../..");
const SOURCE = process.env.NEURDF_OUT || resolve(ROOT, "public/data/npo-merged-neurdf.jsonld");
const OUT = resolve(here, "neurdf-precision-sample.jsonld");

// Each cell is here for a reason; `requires` is asserted so a fixture rebuild cannot quietly
// drop the coverage the parser checks depend on.
const CELLS = [
  {
    id: "npokb:1067",
    why: "richest cell: plain soma location, marker genes, dataCitation, genLabel",
    requires: [
      "neurdf.eqv:hasSomaLocatedIn",
      "neurdf.eqv:hasNucleicAcidExpressionPhenotype",
      "ilxtr:dataCitation",
      "ilxtr:genLabel",
    ],
  },
  {
    id: "npokb:934",
    why: "soma location ONLY via neurdf.eqv.uo (@list) — the regression this fixture exists for",
    requires: ["neurdf.eqv.uo:hasSomaLocatedIn"],
    forbids: ["neurdf.eqv:hasSomaLocatedIn"],
  },
  {
    id: "npokb:1007",
    why: "cross-nomenclature evidence derivation + atlas annotations + curator note",
    requires: ["TEMP:assertedSubClassOf", "TEMP:mapsTo", "ilxtr:atlasAnnotation", "ilxtr:curatorNote"],
  },
];

// Keys worth keeping on a *referenced* node: enough to resolve a label and a display label,
// nothing else — this is what keeps the fixture at ~45KB instead of 16MB.
const REF_KEYS = ["@id", "@type", "rdfs:label", "ilxtr:displayLabel", "ilxtr:shortDefinition"];

const source = JSON.parse(readFileSync(SOURCE, "utf8"));
const graph = source["@graph"] || [];
const index = new Map(graph.filter((n) => n["@id"]).map((n) => [n["@id"], n]));

// Every @id a node points at, including inside an @list (which is exactly the case the fixture
// is here to cover, so missing it would drop the label nodes for the union values).
const referencedIds = (node) => {
  const out = new Set();
  const walk = (value) => {
    if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") {
      if (typeof value["@id"] === "string") out.add(value["@id"]);
      if (value["@list"]) walk(value["@list"]);
    }
  };
  for (const [key, value] of Object.entries(node)) {
    if (key !== "@id" && key !== "@type") walk(value);
  }
  return out;
};

const pick = (node, keys) =>
  Object.fromEntries(Object.entries(node).filter(([k]) => keys.includes(k)));

const keep = new Map();
const problems = [];

for (const spec of CELLS) {
  const node = index.get(spec.id);
  if (!node) {
    problems.push(`${spec.id} is missing from the source graph (was: ${spec.why})`);
    continue;
  }
  for (const key of spec.requires || []) {
    if (!(key in node)) problems.push(`${spec.id} no longer has ${key} — needed for: ${spec.why}`);
  }
  for (const key of spec.forbids || []) {
    if (key in node) {
      problems.push(
        `${spec.id} now ALSO has ${key}, so it no longer isolates the @list-only case (${spec.why}) ` +
          `— pick a different cell that has only the union form`
      );
    }
  }
  keep.set(spec.id, node);
  for (const ref of referencedIds(node)) {
    if (ref.startsWith("_:")) continue; // restriction blank nodes carry nothing we render
    const target = index.get(ref);
    if (target && !keep.has(ref)) keep.set(ref, pick(target, REF_KEYS));
  }
}

// The root class the parse scopes to, plus every predicate node carrying display metadata (the
// checks assert these are read from the graph rather than from the front end's fallback map).
const root = index.get("ilxtr:NeuronPrecision");
keep.set("ilxtr:NeuronPrecision", root ? pick(root, REF_KEYS) : { "@id": "ilxtr:NeuronPrecision", "@type": "owl:Class" });
for (const node of graph) {
  const id = node["@id"];
  if (typeof id !== "string") continue;
  if ("ilxtr:displayLabel" in node || "ilxtr:shortDefinition" in node) {
    if (!keep.has(id)) keep.set(id, pick(node, REF_KEYS));
  }
}

// The owl:Ontology node, so parseOntologyMeta has a title/version to read.
const ontology = graph.find((n) => {
  const t = n["@type"];
  return t === "owl:Ontology" || (Array.isArray(t) && t.includes("owl:Ontology"));
});
if (ontology) keep.set(ontology["@id"], ontology);

if (problems.length) {
  console.error("[fixture] source data no longer supports this fixture:\n  - " + problems.join("\n  - "));
  process.exit(2);
}

const fixture = { "@context": source["@context"], "@graph": [...keep.values()] };
writeFileSync(OUT, `${JSON.stringify(fixture, null, 1)}\n`);
console.log(
  `[fixture] ${OUT}\n[fixture] ${fixture["@graph"].length} nodes from ${graph.length}, ` +
    `${(JSON.stringify(fixture).length / 1024).toFixed(0)} KB`
);
for (const spec of CELLS) console.log(`[fixture]   ${spec.id} — ${spec.why}`);
