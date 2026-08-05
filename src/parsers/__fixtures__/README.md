# neurdf parser fixtures

`neurdf-precision-sample.jsonld` — a 106-node trim of the full ~16MB
`npo-merged-reasoned-neurdf.jsonld`, holding three Precision cells plus the label nodes and
`ilxtr:displayLabel` / `ilxtr:shortDefinition` property nodes they reference.

The three cells are not arbitrary; each covers behaviour the Cell Card depends on:

| Cell | Covers |
|---|---|
| `npokb:1067` | The richest cell (24 predicates): plain `neurdf.eqv:hasSomaLocatedIn`, marker genes (including one `NCBIGene` with no label in the graph), `ilxtr:dataCitation`, `ilxtr:genLabel`. |
| `npokb:934` | Soma location **only** via `neurdf.eqv.uo:hasSomaLocatedIn`, i.e. a JSON-LD `@list`. This is the regression the fixture exists for — `resolveValue` used to drop `@list` values, which silently lost soma location on 61 of the 161 Precision cells. Must parse to two values with `combinator: "or"`. |
| `npokb:1007` | `TEMP:assertedSubClassOf` + `TEMP:mapsTo` (→ the `described` / `inferred` evidence derivation), `ilxtr:atlasAnnotation`, `ilxtr:curatorNote`. |

One behaviour cannot come from a trim of the real file: the three deep-link predicates
(`hasSPARCMap`, `hasNervoSensusLink`, `hasSPARCTranscriptomicsLink`) have **zero occurrences**
upstream. `checkParser.mjs` therefore builds a small synthetic graph of its own for those, carrying
one predicate in each prefix form (`ilx:`, `ilxtr:`, expanded IRI) to pin the claim that the widgets
reading them light up with no code change — and that they stay off `properties`, where they would
become facet options in the grid sidebar. Keep it in the script rather than in the fixture, so
regenerating the fixture cannot drop it.

## Running the checks

The root project has no unit-test runner (`test/` is a separate Puppeteer + Jest e2e package), so
the assertions live in a plain script:

```
yarn check-parser
```

That runs `scripts/run-ts.mjs`, which bundles the TypeScript parser with esbuild (already a vite
dependency) and executes it on plain Node — no runner dependency, and it works on the `node:18-alpine`
build image. It exits non-zero on failure and runs in CI after `build` and `lint`
(`.github/workflows/lint.yml`).

Regenerate the fixture from the full graph with the snippet in this repo's git history if the
upstream ontology changes shape; the cells above should keep their listed properties.
