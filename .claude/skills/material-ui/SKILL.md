---
name: material-ui
description: Best practices for building UI with Material UI in this project — the customization ladder (sx vs styled vs theme), consuming the semantic palette instead of raw `vars`, picking the right component instead of Box, v5-vs-v7 API differences, and sx performance limits. Use whenever adding or restyling UI (cards, lists, tables, chips, dialogs, grids), touching src/theme/, choosing a color, reaching for `sx` with a color/radius/shadow/font in it, or copying a snippet from the MUI docs.
---

# Material UI in interlex

**MUI v5** (`@mui/material ^5.15.15`), React 18, `ThemeProvider` + `CssBaseline` in
[src/App.jsx:280](src/App.jsx#L280). UI components are `.jsx` with `prop-types`; TypeScript is
confined to the data layer (`src/model`, `src/api`, `src/parsers`), so MUI's TS-specific advice
(`SxProps<Theme>`, module augmentation) rarely applies in components.

**Read §6 before copying any snippet from mui.com** — the live docs are v7 and several APIs differ.

## 1. The customization ladder — use the narrowest rung that fits

MUI defines four scopes of customization. Picking the wrong rung is the most common design-system
failure: one-off `sx` where a theme override belongs means the next component looks different.

| Scope | Use | Rung |
| --- | --- | --- |
| One instance | `sx` prop | 1 — "the best option for a single instance in most cases" |
| A pattern reused across the app | `styled()` | 2 — already used in [CustomizedRadio](src/components/common/CustomizedRadio.jsx), [CustomFormField](src/components/common/CustomFormField.jsx) |
| *Every* instance of a component | theme `components.MuiX` | 3 — see §3 |
| Bare HTML elements | `CssBaseline` / `GlobalStyles` | 4 — hoist `GlobalStyles` out of the render so it isn't recalculated |

Two rules that follow from this:

- **`sx` beats theme `styleOverrides` on specificity.** So if you find yourself using `sx` to fight
  a style the theme already sets, you're on the wrong rung — fix the theme.
- **In this project `sx` is for layout only** (flex, grid, gap, padding, width). Colors come from
  the palette and typography/radii/shadows from the theme — see §4. This is the house rule in
  [CLAUDE.md](CLAUDE.md).

When overriding a state, **pair the state class with the component class** —
`& .MuiChip-root.Mui-disabled`, not `& .Mui-disabled` alone. State class names on their own are
documented as unstable selectors and leak into descendants.

## 2. Reach for the component, not the `div`

`Box` is a styled `div`. Reaching for it means opting out of the design system's semantics,
accessibility and theming.

| Concept | Use | Not |
| --- | --- | --- |
| Card / tile / panel | `Card` + `CardContent` (+ `CardHeader`, `CardActions`) | bordered `Box` |
| Spaced run of children | `Stack` | `Box` with `display:flex; gap` |
| List of records | `List` / `ListItem` / `ListItemText` | a `Box` per row |
| Tabular data | `Table` family | `Grid` |
| Label / tag / badge | `Chip` | styled `Typography` |
| Centred max-width page body | `Container` | `Box` with `margin: auto` |
| Any text | a `Typography` variant | raw tags + `fontSize` |

**Then check [src/components/common/](src/components/common/)** — breadcrumbs, selects, pagination,
buttons, checkboxes, dialogs and tree views already exist as project primitives.

**Prefer props over styles.** `variant`, `size`, `color`, `disableGutters`, `dense`, `gutterBottom`
express intent and stay themeable; the equivalent `sx` does not. And use `Typography`'s `component`
prop to keep semantics independent of looks: `<Typography variant="subtitle2" component="h3">`
renders an `<h3>` that *looks* like a subtitle — visual hierarchy and document outline shouldn't be
forced to agree.

## 3. Theme overrides: three keys

```js
MuiChip: {
  defaultProps:    { size: "small" },              // change defaults everywhere
  styleOverrides:  { root: {…}, label: {…} },      // per-slot styles; `root` is the outer element
  variants: [                                       // conditional on props
    { props: { variant: "dashed" }, style: {…} },   // later entries win
  ],
}
```

- `styleOverrides` keys are **slot names**, not CSS — check the component's API page for its slots
  (`root`, `label`, `icon`, …). Nested selectors are allowed inside a slot.
- `variants` accepts an object matcher or a callback (`(props) => props.variant === "dashed"`).
- `ownerState` callbacks in `styleOverrides` **are supported in v5** (deprecated only in v7).
  `variants` does the same job and is forward-compatible — prefer it for anything new.
- `theme.unstable_sx({ px: 1, borderRadius: 1 })` lets you write `sx` shorthand *inside* the theme.
  Experimental in v5, but it keeps theme code reading like call-site code.

## 4. Colors come from the palette

[src/theme/index.jsx](src/theme/index.jsx) defines a full semantic `palette`.
[src/theme/variables.js](src/theme/variables.js) (`vars`) remains the **source of truth** and feeds
it — but that's theme-layer plumbing. **Call sites consume the palette, not `vars`:**

```jsx
<Button color="primary">                          // ✅
<Typography sx={{ color: "text.secondary" }}>     // ✅
<Chip color="success">                            // ✅
sx={{ color: vars.gray500 }}                      // ❌ importing vars into a component
```

Two rules: don't put a color in the palette that isn't in `vars` first, and don't add a `vars` token
you can't point at in the design.

| Slot | Mapped to | Notes |
| --- | --- | --- |
| `primary` | `brand400` / `brand600` / `brand700` | `main`/`dark` reproduce `MuiButton.containedPrimary` exactly |
| `secondary`, `info` | `blue200` / `blue700` | the blue that was raw hex inside `MuiChip.colorSecondary` |
| `error`, `warning`, `success` | ramp `400` / `500` / `700` | MUI's `light` is a lighter *saturated* tone, not a pale tint — don't map it to `200` |
| `grey` | `gray50…gray900` | partial object; MUI merges its `A100`–`A700` defaults over the top |
| `text` | `gray900` / `gray500` / `gray400` | `CssBaseline` paints body from `text.primary` |
| `background` | `white` / `white` | matches the `body { background }` in `MuiCssBaseline` |
| `divider` | `gray200` | matches `MuiDivider`, so `variant="outlined"` borders are right by default |

**Let MUI compute `contrastText` — never hardcode it.** With `contrastThreshold: 3` it correctly
picks *dark* text on `warning.main` `#F79009` and `success.main` `#17B26A`, where white would fail
contrast. Same for `light`/`dark` where the design has no verified token at the tone MUI wants:
`secondary`/`info` supply only `main` and let `tonalOffset` derive the rest.

**Deliberately not in the palette:** `shape` (radii stay per-component — `MuiCard` is `0.75rem`
while `MuiButton` is `0.5rem`, so one global value would be wrong), and `action` (the rgba
hover/selected/disabled overlays drive many components; changing them is a separate visual decision).

**The ~30 per-component `styleOverrides` predate the palette.** They're legacy pins, and they still
win over it. Don't rewrite them in bulk — but when you touch one, check whether the palette has made
it redundant. Two proven cases: `MuiCard`'s `borderColor: gray200` is now exactly what
`variant="outlined"` reads from `palette.divider`, and `MuiButton.containedPrimary`'s
`background: brand600` / hover `brand700` is precisely `primary.main` / `primary.dark`. The palette
reproducing a hand-pinned value is the mapping validating itself.

**The palette lands on *unpinned* components — that's where to look.** Before assuming a component is
styled, check it against the pinned list in §3's neighbourhood (`grep -oE "^\t\tMui[A-Za-z]+"
src/theme/index.jsx`). `MuiSwitch` isn't in it, which is why the "Displayed properties" toggle
rendered MUI blue until the palette existed. Same for `MuiChip`'s `colorInfo`, `MuiButton`'s
`*Error` variants, and every `SvgIcon` `color=` — `SvgIcon` resolves straight to
`palette[color].main`.

`MuiPaper`'s override is scoped to `&.authPaper` and nothing else (verified: its
`styleOverrides.root` has exactly one child), so `Paper`, `Card`, `Menu` and `Dialog` get **no**
project-wide styling from it.

**When you introduce a new MUI component:** check which theme tokens its styles read → the palette
usually covers them now → add a `Mui<Component>` entry only for what it doesn't → leave only layout
in `sx`.

Worked example, `MuiCard`/`MuiCardContent` (added for [CellTile.jsx](src/components/CellCards/CellTile.jsx)):
`borderRadius: "0.75rem"` and `MuiCardContent` `padding: 1rem` with
`"&:last-child": { paddingBottom: "1rem" }` to cancel MUI's 24px bottom pad on the final
`CardContent`.

## 5. Performance: `sx` has a real cost, and it scales with element count

MUI's own benchmark, rendering 1,000 components:

| plain `<div>` | custom component | `styled()` | `Box` + `sx` |
| --- | --- | --- | --- |
| 100ms | 112ms | 181ms | **296ms** |

`sx` is ~1.6× `styled()` and ~3× a plain element — "fast enough" for most UI, and *not* worth
avoiding on a handful of elements. It matters on **repeated** ones. MUI's prescribed fix is a
**single style injection point**: put the `sx` on the wrapper and style the repeated children with a
plain child selector, or move the style into the theme.

Grids of records are where this shows up — a 24-tile grid with several chips per tile is ~100
sx-carrying elements. Two mitigations, in order: hoist the `sx` object to a module const so Emotion
serializes it once to a shared cached class (this is what the benchmark's per-element figure does
*not* account for), and move anything genuinely static into the theme, where it costs nothing per
element. Measure before treating this as a problem — the benchmark is 1,000 elements with distinct
`sx`, which is not the same shape as a handful of repeated identical ones.

**Imports:** top-level barrel imports (`from "@mui/material"`) tree-shake fine in production with
Vite — the cost is dev startup. For icons the gap is larger: named barrel imports from
`@mui/icons-material` can be **up to 6× slower** in dev than path imports. This project mostly gets
that right (`from "@mui/icons-material/ChevronRight"`);
[CustomButtonGroup.jsx:13](src/components/common/CustomButtonGroup.jsx#L13) is the exception. Note
many project icons are hand-rolled SVGs in [src/Icons/](src/Icons/) — check there first.

## 6. v5 ≠ v7 — the docs on mui.com will mislead you

| Topic | This project (v5.15) | v6 / v7 docs show |
| --- | --- | --- |
| Grid | `<Grid container>` / `<Grid item xs={12} sm={6}>` | `<Grid size={{ xs: 12 }}>`, no `item` |
| `ownerState` in `styleOverrides` | supported | deprecated → `variants` |
| CSS-variable theming | `experimental_extendTheme` only | stable `CssVarsProvider` |

`Grid2` does exist as `@mui/material/Unstable_Grid2` if you want the flex/gap model, but don't mix
it with `Grid` in one tree.

**`slotProps` vs `componentsProps`:** don't assume the v5/v6 split you'll read about elsewhere —
**26 of the installed v5.15 components already accept `slotProps`**, and where both exist
`slotProps` *wins* (`Autocomplete`: `slotProps.paper ?? componentsProps.paper`). `componentsProps`
is the older name, and it's what 4 files here still use. Coverage is per-component in v5, so check
`node_modules/@mui/material/<Component>/<Component>.d.ts` rather than guessing; prefer `slotProps`
where the component supports it. Version skew is also per-package: `@mui/x-tree-view` is on **v7**
([CustomizedTreeView.jsx](src/components/common/CustomizedTreeView.jsx)).

**`Stack` gotcha in v5:** spacing is applied as `margin` on children, which breaks as soon as
children wrap. Pass `useFlexGap` (v5.13+) to switch to real `gap` for any wrapping `Stack`.

## 7. Accessibility

- **Never nest interactive elements.** `CardActionArea` renders a `<button>`, so a card containing
  `<a>`/`Link` must not be wrapped in it — invalid HTML and broken a11y. Put the click on the
  wrapping grid item and `e.stopPropagation()` on inner links (see
  [CellTileGrid.jsx:39](src/components/CellCards/CellTileGrid.jsx#L39)).
- **A clickable container that isn't a button or link is invisible to keyboard and screen readers.**
  `onClick` on a `Grid item` or `div` is not finished work. Where a whole tile navigates, the
  accessible route is a real link on the tile's title (which also gives middle-click and
  open-in-new-tab for free), with the container click as a convenience on top. The CellCards grid
  currently has the container click only — a known gap, not a pattern to copy.
- Truncated/ellipsized text needs the full value available (`title` attribute at minimum).
- Icon-only controls need `aria-label`. Decorative SVGs should be `aria-hidden`.

## 8. Editing and verifying

- **[src/theme/index.jsx](src/theme/index.jsx) is CRLF + tab-indented.** LF-based string edits will
  not match — match `\r\n` (a small `python3` script is the reliable way) and indent with tabs.
  Files under `src/components` are LF + 2-space.
- **Equal-height tiles in a `Grid`** come from `display: flex` on the `Grid item` plus
  `height: 100%` on the child; add `minWidth: 0` so long labels wrap instead of widening the tile.
  `Card` is `display: block`, so a child relying on `mt: "auto"` needs
  `display: flex; flexDirection: column` on the Card. `Card` already sets `overflow: hidden`.
- **A refactor that claims "same look, better component" is only proven by a render.** App runs at
  **http://localhost:5173/** (`yarn dev`). Screenshot the route before and after at the same
  viewport and clip and `md5sum` both PNGs — identical hashes is the strongest check available.
- **For a change that is *meant* to alter pixels (a palette, a token), md5 equality is a failure
  signal** — it means the change reached nothing. Write down the expected-change set *first*, then
  diff with a **colour-transition histogram** (PIL: `ImageChops.difference`, then count
  `before_rgb → after_rgb` pairs) and group the changed rows into bands you can crop and eyeball.
  Every transition must map to an intended cause; anything unexplained means the change is
  over-reaching. Don't tune values to restore pixel equality — that defeats the change.
- **Isolating one theme change** when the working tree has other edits: back the file up, strip just
  that block programmatically, capture, restore, and assert the restore is byte-identical
  (`md5sum`) — all in one command so an interruption can't leave the repo half-reverted.
- **Most routes are auth-gated** and silently redirect to `/login`. `/cellcards/:slug` and the auth
  pages render without credentials; `/organizations`, `/term-activity`, dashboards and term views do
  not. Plan verification around that, and say which screens you could not render.
  Playwright isn't a project dependency; import it from the global install (`npm root -g`, then
  `…/@playwright/test/index.js`). Also assert computed `border`/`borderRadius`/`padding` and element
  heights: a footer no longer pinned by `mt: auto`, or a tile that only overflows at a narrow
  viewport, won't show up on uniform test data.
- **Run the check unfiltered** and confirm the only console warnings are the pre-existing
  `defaultProps` ones from `BreadcrumbBar` / `CustomButtonGroup`.
- **A global `styleOverrides` entry affects the whole app.** Grep all of `src` (not just
  `--include=*.jsx` — there are 106 `.ts`/`.tsx` files) for other consumers before assuming one
  route verified it.

For matching a screen against the Figma file, use the **`check-figma-design`** skill; its §4 states
the same theme-only styling rule from the design side.

## Sources

- [How to customize](https://mui.com/material-ui/customization/how-to-customize/) — the four rungs, state-class warning
- [Themed components](https://v5.mui.com/material-ui/customization/theme-components/) (v5) — `defaultProps` / `styleOverrides` / `variants`, `unstable_sx`
- [Usage § performance tradeoffs](https://mui.com/system/getting-started/usage/) — the benchmark table and injection-point fix
- [Minimizing bundle size](https://v5.mui.com/material-ui/guides/minimizing-bundle-size/) (v5) — import styles, the 6× icons figure
