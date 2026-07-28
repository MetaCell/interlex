// Assertions for neurdfParser against the trimmed fixture. See README.md in this directory.
//   npx vite-node src/parsers/__fixtures__/checkParser.mjs
// Exits non-zero on the first failure.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseNeurdf, parsePredicateDisplay } from "../neurdfParser";
import {
  hasCellGrouping,
  hasTranscriptomicProfile,
} from "../../components/CellCards/CellCard/widgetVisibility";

const here = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(here, "neurdf-precision-sample.jsonld"), "utf8"));

let failed = 0;
const check = (name, actual, expected) => {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`  ok   ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL ${name}\n         expected ${e}\n         actual   ${a}`);
  }
};

const { cells, predicateDisplay } = parseNeurdf(data, "ilxtr:NeuronPrecision");
const byId = Object.fromEntries(cells.map((c) => [c.id, c]));

console.log("parseNeurdf");
check("finds the three fixture cells", cells.length, 3);

// --- the @list regression -----------------------------------------------------
// npokb:934 carries soma location ONLY as neurdf.eqv.uo:hasSomaLocatedIn, a JSON-LD @list.
// Before the fix resolveValue ignored @list, so this property vanished entirely.
const union = byId["npokb:934"].properties.hasSomaLocatedIn;
console.log("\n@list unwrapping (npokb:934)");
check("soma location is present", Boolean(union), true);
check(
  "both list members resolve, with labels",
  union?.values.map((v) => v.label),
  ["dorsal root ganglion", "trigeminal ganglion"]
);
check("union semantics are preserved as 'or'", union?.combinator, "or");

// A plain family must NOT claim a combinator — its values are independent assertions, not
// alternatives, and rendering them as "A or B" would overstate what the ontology says.
console.log("\nplain family (npokb:1067)");
const plain = byId["npokb:1067"].properties.hasSomaLocatedIn;
check("soma location resolves", plain?.values.map((v) => v.label), ["dorsal root ganglion"]);
check("no combinator on a plain family", plain?.combinator, undefined);

// --- annotation allow-list ----------------------------------------------------
console.log("\nannotations (npokb:1007)");
const c1007 = byId["npokb:1007"];
check("atlas annotations are captured", c1007.annotations.atlasAnnotation.length > 0, true);
check("curator note is captured", c1007.annotations.curatorNotes.length, 1);

console.log("\nannotations (npokb:1067)");
const c1067 = byId["npokb:1067"];
check("data citation is captured", c1067.annotations.dataCitations.length, 1);
check("generated label is captured", typeof c1067.annotations.generatedLabel, "string");
check("temporary id is captured", Boolean(c1067.annotations.temporaryId), true);

// Annotations must stay OFF `properties`: the grid derives its filter facets from that object
// (getFacets), so leaking notes and ids in would add junk facets to the sidebar.
console.log("\nannotations do not leak into properties (grid facets)");
const leaked = cells.flatMap((c) =>
  Object.keys(c.properties).filter((k) => /atlas|curator|alert|genLabel|Temporary|mapsTo|assertedSub/i.test(k))
);
check("no annotation keys among properties", leaked, []);

// --- cross-nomenclature evidence ---------------------------------------------
// Evidence is derived from which relation carried the mapping, since the graph has no dedicated
// evidence predicate: assertedSubClassOf/subClassOf -> described, mapsTo -> inferred.
console.log("\nmapping evidence derivation (npokb:1007)");
const evidence = [...new Set(c1007.mappings.map((m) => m.evidence))].sort();
check("both evidence kinds are derived", evidence, ["described", "inferred"]);
check(
  "provenance is split out of the label",
  c1007.mappings.every((m) => !m.source || !m.source.includes("(")),
  true
);

// --- display metadata read from the ontology ---------------------------------
console.log("\npredicate display metadata");
check("displayLabel is read from the graph", predicateDisplay.hasSomaLocatedIn?.label, "Soma location");
check("displayLabel for taxon", predicateDisplay.hasInstanceInTaxon?.label, "Observed in");
check(
  "shortDefinition is read as the tooltip",
  typeof predicateDisplay.hasSomaLocatedIn?.description,
  "string"
);
check(
  "parsePredicateDisplay is callable on a raw graph",
  Boolean(parsePredicateDisplay(data["@graph"]).hasSomaLocatedIn),
  true
);

// --- deep-link predicates (the widgets' forward-compatible path) ---------------
// hasSPARCMap / hasNervoSensusLink / hasSPARCTranscriptomicsLink have **zero occurrences** in the
// shipped ontology, so a trim of it cannot cover them — hence this synthetic graph. Three widgets
// promise to light up "with no code change" once the backend emits the triple, and that promise
// only holds if the parser (a) matches the predicate whatever prefix it arrives under and (b) keeps
// it off `properties`, where every key becomes a facet option in the grid sidebar.
const linkGraph = {
  "@graph": [
    {
      "@id": "npokb:9001",
      "@type": ["owl:Class", "neurdf:Neuron"],
      "rdfs:label": "synthetic deep-link cell",
      "rdfs:subClassOf": [{ "@id": "ilxtr:NeuronPrecision" }],
      // One predicate per prefix form on purpose: a CURIE the file's @context does not define, the
      // readable `ilxtr:` CURIE, and the fully expanded IRI.
      "ilx:hasSPARCMap": [{ "@id": "https://maps.sparc.science/dataset/1" }],
      "ilxtr:hasNervoSensusLink": { "@id": "https://nervosensus.org/cell/9001" },
      "http://uri.interlex.org/tgbugs/uris/readable/hasSPARCTranscriptomicsLink": {
        "@id": "https://sparc.science/data?cell=9001",
      },
    },
  ],
};

console.log("\ndeep-link predicates (synthetic graph)");
const linked = parseNeurdf(linkGraph, "ilxtr:NeuronPrecision").cells[0];
check("the synthetic cell parses", linked?.curie, "npokb:9001");
check(
  "an `ilx:` CURIE lands on annotations",
  linked?.annotations.sparcMaps.map((r) => r.iri),
  ["https://maps.sparc.science/dataset/1"]
);
check(
  "an `ilxtr:` CURIE lands on annotations",
  linked?.annotations.nervoSensusLinks.map((r) => r.iri),
  ["https://nervosensus.org/cell/9001"]
);
check(
  "an expanded IRI lands on annotations",
  linked?.annotations.sparcTranscriptomicsLinks.map((r) => r.iri),
  ["https://sparc.science/data?cell=9001"]
);
check("deep links stay off properties", Object.keys(linked?.properties || {}), []);
// The bug this guards: the widgets used to look these up as `properties["ilx:has…"]`, a key the
// parser never writes, so they could not light up even with the triple present.
check("the NervoSensus widget lights up", hasCellGrouping(linked), true);
check("the Transcriptomic widget lights up on the link alone", hasTranscriptomicProfile(linked), true);

console.log(failed ? `\n${failed} check(s) failed` : "\nall checks passed");
process.exit(failed ? 1 : 0);
