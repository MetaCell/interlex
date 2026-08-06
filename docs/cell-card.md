# Cell Card — implementation notes

Orientation for follow-up work on the single-term **Cell Card**: what exists, why it is shaped that
way, and what is genuinely blocked rather than merely unfinished.

Sources of truth, in precedence order:

1. **Figma** — file `vjQBZc9IbwGcC0VxViBNp0` ("Interlex-UI"), frame **`9239:67503` "CellCard term"**
   inside section `8988:38896` "Cell card + org". Interaction states are sibling top-level frames:
   `9272:85572` commenting, `8917:35906` graph expanded, `8875:120714` not logged,
   `9484:84345` loading, `9484:85847` navigating via the graph.
2. **Meeting transcripts** — [cellcard-spec/meeting-*.md](../cellcard-spec/).
3. **The v0.8 functional spec** —
   [cellcard-spec/functional-spec-stakeholders.md](../cellcard-spec/functional-spec-stakeholders.md).
   Predates the design reviews and is stale in load-bearing ways; see §5.

---

## 1. What it is and where it lives

A read-only three-column dossier for one neuron cell type, added as the **first and default tab** on
the term page. Overview remains the details/edit surface — the design review explicitly rejected
inline editing here, replacing the per-widget pencil with one **Edit** button that sends you to
Overview.

```
src/components/CellCards/CellCard/
├── CellCardPanel.jsx        tab entry point: resolve the term, loading/error/not-a-cell states, scroll container
├── CellCard.jsx             the three-column layout + which widgets appear
├── CellCardWidget.jsx       the shared widget shell (title + action icons + body)
├── PropertyList.jsx         label/value rows (exports PropertyRow too)
├── TermValueLink.jsx        one ResolvedRef rendered as a link via termLink()
├── DefinitionBanner.jsx     the auto-generated description
├── WidgetCommentButton.jsx  per-widget comment popover
├── RelationshipGraphSvg.jsx dagre layout + hand-drawn SVG
├── buildRelationGraph.js    cell -> {nodes, edges}
├── buildRows.js             config rows + cell -> row models
├── widgetVisibility.js      which widgets have anything to show
├── useCellTerm.js           the data hook
├── citationService.js       DOI -> CrossRef
├── commentService.js        discussion thread access
├── nervoSensusLink.js       NervoSensus deep-link builder
└── widgets/                 the nine widgets
```

Supporting changes outside that directory:

| File | What changed |
|---|---|
| `src/parsers/neurdfParser.ts` | `@list` fix, annotation allow-list, `parsePredicateDisplay` (§4) |
| `src/components/CellCards/model/types.ts` | `CellMapping`, `CellAnnotations`, `ValueCombinator`, Cell Card types |
| `src/components/CellCards/config/cellCardConfig.ts` | **new** — widget rows, graph predicates, NervoSensus vocabulary |
| `src/components/CellCards/services/ontologyGridService.ts` | `findCell`, `relatedBySource`, `hierarchyNeighbours`, slug helpers |
| `src/components/SingleTermView/index.jsx` | Cell Card as tab 0; every hardcoded tab index shifted (§3) |
| `src/components/CellCards/OntologyGridPage.jsx` | tile click navigates instead of raising a snackbar |
| `src/theme/index.jsx` | 10 new component overrides + `currentTerm` typography + `MuiButton` `tile` variant |
| `src/components/common/EmptyState.jsx` | **new** — replaces three inlined copies |

---

## 2. Data flow

**The card never reads the InterLex term API.** Precision cells are `npokb:*` only and that endpoint
404s on every one of them (§5.1). Everything comes from the neurdf ontology graph.

```
useCellTerm(termSlug, ontologySlug)
  └─ loadOntology(slug)                     memoised: graphPromise (fetch) + parsedCache (parse)
       └─ parseNeurdf(graph, rootClass)     -> { cells, hierarchy, predicateDisplay, meta }
  └─ findCell(data, termSlug)               "npokb_998" -> "npokb:998"
```

Both memos are module-level, so arriving from a grid tile costs **no network and no reparse**;
a cold deep-link pays a ~16MB fetch plus a 39,788-node parse before the first render.

**Context ontology travels as `?ontology=`**, written by the grid tile click. It is *not*
`DataContext.activeOntology` — that is an edit target shown as a chip in the header. Conflating them
would read the card's data from the wrong place. Tab navigation preserves the query string; without
that the param is lost on the first tab switch and the card blanks.

The ontology file itself is fetched at container start, not baked into the image — see
[scripts/README.md](../scripts/README.md).

---

## 3. Tab wiring

Cell Card is index 0, so **every previously hardcoded index shifted**. `CELL_CARD_TAB` and
`OVERVIEW_TAB` are named constants in `SingleTermView/index.jsx` for that reason. The five touch
points, all in that file:

- `tabMapping` / `tabNames` / `tabLabels`
- the `switch (tabValue)` content dispatch
- the default-tab redirect
- `if (tabValue !== OVERVIEW_TAB) return null` — gates the code/data-format toggle. It read `!== 0`,
  which would silently have followed the Cell Card instead of Overview.
- `handleChangeTabs`, which must carry `location.search`

**`hidden` and `disabled` are different states**, and `CustomTabs` takes both. A term that is not a
cell type has no Cell Card and never will, so that tab is **hidden** — the bar reads as a plain term
page instead of advertising a dead tab. A precision cell's term tabs *do* apply and are merely
unserved for now, so they stay **disabled** and visible. Hiding must not renumber anything: each
`Tab` carries its index as an explicit `value`, so `tabValue` keeps meaning "position in
`tabLabels`" whatever is hidden, and `isTabSelectable` treats both states as unreachable from the
URL. `SingleTermView`'s *initial* `tabValue` also refuses `CELL_CARD_TAB` when it is hidden: a value
with no Tab behind it leaves the bar with nothing selected — and MUI logging "the `value` provided
to the Tabs component is invalid" from its indicator effect — until the URL is rewritten.

**Cell-term detection has to be synchronous**, because it decides the default tab inside the mount
effect and cannot wait on a 16MB load. Two cheap URL-only signals: the slug is `npokb_*`, or
`?ontology=` is present. Revisit when Precision cells gain ILX ids — the slug shape stops being a
reliable signal then and the term's own `@type` should decide.

Verified behaviour:

| URL | Result |
|---|---|
| `/precision/npokb_1067` | redirects to `/cell-card`; Overview/Variants/History/Discussions **disabled**, because the record probe (§3.1) 404s |
| `/base/ilx_0101431/overview` | Cell Card **not rendered**, Overview active, code toggle on Overview |
| `…/overview?ontology=precision` | Cell Card becomes available |

### 3.1 Which tabs are enabled is a backend question, not a slug shape

The four term tabs read the InterLex term API, which can only serve a cell once curation maps its
`npokb` id to a record. **`/{group}/uris/{prefix}/{id}` is where the backend answers** —
`/base/uris/npokb/991` returns *"has not been mapped to an InterLex id"* (404) for all 161 today,
and the tabs light up on their own, with no front-end change, once it stops doing so.

- `hasInterLexRecord` (`apiService.ts`) probes it, once per group+slug, cached for the session.
  `redirect: 'manual'`, because a mapped id may answer with a cross-origin redirect to the record
  and following it would fail the CORS check and read as *unmapped*.
- It probes the page's group and falls back to `base`, exactly as `getSelectedTermLabel` does.
- `useTermRecordAvailability` is the one hook both the tab bar and the card's discussion link read,
  so they cannot drift. It answers **`undefined` while the probe is in flight** — `ilx_*`/`tmp_*`
  slugs skip it and answer `true` synchronously.
- Pending counts as *disabled* (what the bar shows today, so no flicker), but the default-tab
  redirect and the term panels both **wait** for it. Redirecting early would rewrite a deep link to
  `/overview` with `replace: true`; mounting `OverView` early would fire a request that 404s and
  raise the shared error dialog over a tab about to be redirected away.

The probe needs its own proxy rule in **both** `vite.config.js` and `nginx/default.conf`: the SPA
fallback is `try_files $uri /index.html`, so unproxied it would answer 200 + the app shell — read as
"mapped" for every cell, the exact opposite of the truth. The term-file rule next to it was widened
from `(ilx|tmp)_` to any `{prefix}_{id}` for the same reason: once mapped, Overview fetches
`/{group}/npokb_991.jsonld`, and that has to reach the backend too. (`/data/` is `location ^~` and
carries a `(?!data/)` in the vite key so neither rule can ever swallow the 16MB ontology — a regex
location outranks a plain prefix one, and today's hyphenated filename is the only thing that would
otherwise stand between them.)

**Two legs of "works as any other term" are still unverified**, both untestable until an id is
mapped: whether the backend serves `/{group}/npokb_991.jsonld` at all, and `toILX` in
`OverView.jsx` — `t.replace(/^ilx_/i, "ILX:")`, a no-op on `npokb_991`, so Overview's own calls
would go out with a raw npokb slug where every other term sends `ILX:0101431`. Look there first if
the tabs light up and Overview still comes back empty.

> Dev-only gotcha: a bare `/{group}/ilx_*` URL never reaches the SPA — `vite.config.js` proxies
> `^/[^/]+/(ilx|tmp)_[^/]+$` straight to the backend. Pre-existing, unrelated to the tab work. Use a
> URL with a tab segment.

---

## 4. Parser changes, and why they mattered

### 4.1 `@list` values were silently dropped — a real data-loss bug

`resolveValue` handled `{@id}`, `{@value}` and strings but not `{"@list":[…]}`. The union family
serialises members as a JSON-LD list, and `neurdf.eqv.uo:hasSomaLocatedIn` is the **only**
soma-location predicate on 61 of the 161 cells. Soma location rendered for 100/161; it now renders
for **161/161**, in the grid as well as the card.

The `.uo`/`.io` family segment is also preserved as `CellProperty.combinator` (`"or"`/`"and"`).
Without it, "soma in A **or** B" renders identically to asserting both — a different claim. A plain
family carries no combinator; merging a union with a plain key clears it, because mixed semantics
have no single reading.

### 4.2 The annotation allow-list, and why it stays off `properties`

`buildCell` kept only `neurdf.*` + two keys. It now also admits `TEMP:assertedSubClassOf` /
`TEMP:mapsTo` / `TEMP:subClassOf` (→ `CellTerm.mappings`, with evidence derived from *which*
relation carried it, since there is no evidence predicate) and the prose/id/link annotations
(→ `CellTerm.annotations`).

**Annotations must not land on `properties`.** `getFacets` derives the grid's filter sidebar from
that object, so a note or an id there becomes a junk facet. Verified: toggling "Displayed
properties" off shows 14 facets and none of them are annotations.

Deep links (`hasSPARCMap`, `hasNervoSensusLink`, `hasSPARCTranscriptomicsLink`) are matched by
**local name under any prefix** (`LINK_ANNOTATIONS`), because the spec's `ilx:` prefix is not in the
file's `@context` and the widgets originally looked them up as `properties["ilx:has…"]` — a key the
parser never writes, so they could not have lit up even with the triple present.

### 4.3 Row labels come from the ontology

70 `ilxtr:*` property nodes carry `ilxtr:displayLabel` and `ilxtr:shortDefinition`, covering **14 of
the 15** neurdf local names Precision cells use ("Soma location", "Observed in", "Marker genes"…).
`parsePredicateDisplay` reads them; `gridConfig`'s `PREDICATE_LABELS` / `PREDICATE_TOOLTIPS` are only
the fallback. Changing a `displayLabel` upstream changes the UI with no front-end edit — which
settles the spec's own "Proposed Approach for Property Labels" debate.

---

## 5. Where the spec is wrong, and what is blocked

### 5.1 Precision cells have no ILX id

All 161 are `npokb:*`; **0** carry `ilxtr:hasIlxId`. `GET /base/npokb_998.jsonld` → **404**. The 41
`ilxtr:hasIlxId` triples in the graph map *external* terms (UBERON, NIFSTD) to ILX, not cells.

Consequences: the H1 must come from the graph, not `termData`; Overview/Variants/Version
history/Discussions render **disabled** for these cells — not because of the slug shape but because
the backend says the id is unmapped, which is asked once and shared (§3.1); and the grid primes
`primeTermDataCache` before navigating so the doomed term-API request is skipped entirely.

`isIlxTermSlug` is now only the *synchronous shortcut* inside that rule (an `ilx_*` slug addresses a
record by construction). Gate anything term-API-backed on `useTermRecordAvailability`, not on the
slug, or it will stay dark after the mapping lands.

### 5.2 The spec's predicate names do not exist

Phenotypes are `neurdf.{eqv|ent}[.neg|.uo|.io]:*`, not `ilxtr:has*Phenotype`. Every
`ilxtr:has*Phenotype` in the spec is absent. Read its field tables through that translation.

### 5.3 `ilxtr:localLabel` as H1 is unimplementable

The spec says six times that `ilxtr:localLabel` is the display label and "rdfs:label is never shown".
**0 of 161** cells have `localLabel` (or `simpleLabel`, `origLabel`, `skos:prefLabel`). The only
human-readable label is `rdfs:label` — the one the spec forbids. `ilxtr:genLabel` is a
~300-character machine string. We use `rdfs:label`. **Worth raising with Sue/Tom.**

Related: **0 of 161** cells have any definition, so the Definition banner is assembled from the
structured properties rather than read from a field.

### 5.4 Blocked on backend / curation

| Item | Blocker (verified: zero occurrences) |
|---|---|
| SPARC Maps row | `hasSPARCMap` |
| Transcriptomic SPARC deep link | `hasSPARCTranscriptomicsLink`. The atlas-pill fallback **is** live (54/161) and is what the design shows. |
| Laminar shading / spinal-cord schematic | `hasLaminarTermination`. The design's explicit "Context image not available" state is what renders. |
| `determinedByMethod` method chips | No rdf-star, no `rdf:Statement`. Method exists only as 6 unused `ilxtr:hasConnectionDeterminedBy*` declarations — and when populated it arrives as a *separate predicate*, not a value qualifier, so the design's "chip next to the value" needs rework, not just data. |
| Definition tooltips (spec §2.4) | **Zero** definitions for UBERON / NCBIGene / CHEBI / NCBITaxon / npokb — labels and `NIFRID:synonym` only. Needs OLS/NCBI at runtime or new triples. |
| Comment posting | `/{group}/discussions/term/{id}` returns **404 for every id**, including a valid `ilx_*` term. The service is not deployed. The popover posts for real and surfaces the failure rather than faking success. |
| Gene labels | 74% of NCBIGene nodes have `rdfs:label`; the rest render as the CURIE. |

### 5.5 Superseded by the design

- **Tab set** is Cell Card / Overview / Variants / Version history / Discussions — *not* the spec's
  General / Referenced By / History / Discussion. No "Referenced By" tab.
- **No inline Discussion widget** in the centre column. The widget-header icon is a comment bubble
  opening an anchored popover, with "View all related discussions" → the Discussions tab.
- **Voting is out of scope**: no vote UI anywhere in the design, no fields on the `Discussion`
  model, no endpoint. Spec §2.8/§10.6 is stale.
- **Commenting is not login-gated** (spec §10.6 wins here): anonymous posts as `Anonymous` with a
  sign-in upgrade link.
- **No widget header bars, no card borders** — "more minimalistic and clean without the borders".
  Hence `CellCardWidget` is a `Stack`, *not* a `Card`, despite CLAUDE.md's general preference.
  Please don't "fix" that.

---

## 6. Decisions worth not re-litigating

**Layout** is measured from Figma `9239:67600`: `424 | 848 | 424` inside 1760px, 32px gutters,
expressed as `26.5rem minmax(0,1fr) 26.5rem` and stacking below `lg`. Dividers between widgets in
the left and centre columns, **none** in the right — that asymmetry is in the design.

**The card scrolls internally.** `PageContainer` fixes the page height (`calc(100vh - 7.5rem)`) and
expects each tab to own its scroll, as `OverView` does. Without the `Scroll` wrapper the card runs
under the site footer. `Scroll` is declared at module scope on purpose: inside the component body it
would be a new component *type* every render, remounting the whole card and losing an open popover,
the hierarchy query and the scroll offset.

**Relationship graph** uses `@dagrejs/dagre` for layout and our own SVG for drawing, so nodes keep
the designed rounded-rect style. It is a **new component, not** `GraphViewer/Graph.jsx`: that one is
a `d3.cluster()` dendrogram taking a single predicate group, and it resolves `d3.select("#tooltip")`
plus a global `d3.selectAll(".node--leaf-g")`, so two instances collide — and this widget needs two
(inline and in the expanded dialog). Two layout details that are not optional:

- parent edges run `parent → cell` so the parent lands on the rank *above*;
- dagre fixes the rank but **not the order within it**, so the soma-location and expression
  satellites are pinned by hand to the left and right of the current node.

Which predicates the graph may draw is `RELATION_PREDICATES` in `cellCardConfig.ts`, per Fahim's
request — adding a predicate there is the only way to get another edge kind.

**NervoSensus is a tool, not per-cell data**, so the Interactive Cell Grouping widget renders
unconditionally. Gating it on `hasNervoSensusLink` (zero occurrences) meant it never appeared at
all. `nervoSensusLink.js` builds the best available link by reading the app's *real* deep-link
vocabulary — which was checked against the deployed build, byte-identical to the copy vendored in
`nervosensus/`:

- `?atlasannotation=` opens the exact cell. Its keys are our `ilxtr:atlasAnnotation` values minus the
  `:U19_*` dataset suffix, which resolves **48 of the 161** cells.
- otherwise `species` / `location` / `axon` / `gene` map from our prose labels onto its filter slugs.
- The spec's "group by morphology · electrophysiology · markers" **does not exist** in the app; the
  real groupings are `view=synthesis&groupBy=axon-species|species-axon|source` and
  `view=tree&grouping=location`. Worth raising with design.
- Deliberately no copy of the app's 22 cell keys here: unknown values are ignored by its own
  `<select>` lookup, so passing them costs nothing while duplicating its vocabulary would rot.

**Publication metadata comes from CrossRef** at render time (`citationService.js`) — DOIs in the
graph are bare `@id` IRIs with no node. One promise per DOI is cached, since siblings share a
publication. Failure degrades to the bare DOI link; it never blocks a render.

**Custom looks go in the theme, not `sx`.** The NervoSensus tile is `MuiButton` `variant="tile"`;
`sx` at call sites is layout only. The tile is a `Button component="a"`, so the whole card is one
click target with real anchor semantics.

---

## 7. Running and verifying

```
yarn fetch-data          # local copy of the ontology (~16MB, gitignored)
yarn dev                 # http://localhost:5173
yarn check-parser        # 36 assertions over a trimmed fixture — runs in CI
yarn build-fixture       # regenerate the fixture from a fresh download
```

Useful cells:

| Cell | Why |
|---|---|
| `npokb:1067` | richest (24 predicates) — exercises every populated row |
| `npokb:934` | soma location **only** via `@list` — the regression guard; must read "dorsal root ganglion **or** trigeminal ganglion" |
| `npokb:1007` | mappings + atlas annotations + curator note |
| `npokb:998` | the cell in the Figma design; has a precise NervoSensus deep link |

Route: `/{group}/{npokb_slug}/cell-card?ontology=precision`.

`src/parsers/__fixtures__/` holds a 106-node trim of the real graph plus the assertions. The fixture
builder **asserts its own coverage** — if `npokb:934` ever gains a plain `hasSomaLocatedIn` it fails
rather than quietly producing a fixture that no longer isolates the `@list` case. Deep-link
behaviour uses a synthetic graph in the script, since those predicates have zero occurrences
upstream and a trim cannot cover them.

There is no unit-test runner in the root project (`test/` is a separate Puppeteer/Jest package).
`check-parser` runs via `scripts/run-ts.mjs`, which bundles the TypeScript with esbuild (already a
vite dependency) and runs it on plain Node — no new dependency, and it works on the `node:18-alpine`
build image. Adding `vite-node` or `tsx` instead **breaks the Docker build**: the maintained versions
require Node ≥20.

---

## 8. Known gaps — the obvious next tasks

1. **The page header is still the old InterLex one.** The design (`9533:71930`) wants: breadcrumb +
   **Grid View** / **Community hub** / **Active Ontology** chip; H1 + `Curated` badge; **Edit**
   button → Overview; a meta row of `npokb ID · ILX · full URI` each with a copy button; then type
   badges. Only the H1 and breadcrumb are wired. `HEADER_BADGES` / `BADGE_COLOR` already exist in
   `cellCardConfig.ts` for the badges. Render the ILX row only when an ILX id exists (§5.1).
2. **Atlas-annotation chips truncate uselessly.** All four read `A-PEP.SCGN/ADRA2C:U...` because the
   theme caps `MuiChip` labels at `20ch` — and the distinguishing part is the *suffix*
   (`U19_HMS`, `U19_WASHU`, …). Figma shows them in full, wrapping to two rows. Fix as a themed chip
   variant, not an `sx` override.
3. **`proposed` evidence badge has no colour.** The design uses Purple; the palette has no purple, so
   it falls back to an outlined chip. Add a token or get design to pick an existing one.
4. **Definition tooltips** (§5.4) — needs an OLS/NCBI resolver or new triples.
5. **The Discussions tab itself is still mock** (`SingleTermView/Discussion/`) and has a live bug:
   `const Discussion = (term) => {` takes the whole props object, so `getTermDiscussions` receives
   `{term: "ilx_…"}`. Worth fixing when the endpoint lands.
6. **Multi-replica ontology fetch** — each replica downloads its own copy at start, which multiplies
   load on the endpoint we are protecting. Fine at `replicas: 1`; wants a shared volume or an
   `initContainer` before scaling out.
