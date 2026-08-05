---
name: check-figma-design
description: Read/verify a UI against its Figma design (read-only) using the Figma MCP tools — extract the node tree, screenshots, and design tokens, then map them to the interlex theme. Use whenever a task references Figma, a figma.com URL, or asks to match/verify a screen, header, component, spacing, or tokens against the design.
---

# Checking a design in Figma (read-only)

This is the **inspect** workflow (design → verify/implement), not the authoring one. Do **not**
guess layout or tokens — read them from Figma. Every UI decision "per the design" must trace to a
node you actually fetched.

## 0. Prerequisites

The Figma tools are exposed as `mcp__claude_ai_Figma__*` (they are deferred — load with
`ToolSearch` query `figma` if not already visible). Confirm access with
`mcp__claude_ai_Figma__whoami`. If it fails, the connector isn't attached — tell the user to
authorize the Figma connector; do not try to run an auth flow.

A local Figma **Dev Mode MCP server** (`127.0.0.1:3845`) may also be available and exposes the same
`get_metadata` / `get_screenshot` / `get_variable_defs` tools with no auth. Either works.

## 1. Get `fileKey` and `nodeId` from the URL

Every call needs **both** `fileKey` and `nodeId`. Omitting `fileKey` fails with
`MCP error -32602: Tool argument fileKey is required`.

From a URL like
`figma.com/design/vjQBZc9IbwGcC0VxViBNp0/Interlex-UI?node-id=9236-61323&m=dev`:
- **fileKey** = the segment after `/design/` → `vjQBZc9IbwGcC0VxViBNp0`
- **nodeId** = the `node-id` value, converting the dash to a colon → `9236-61323` becomes `9236:61323`

**Interlex file:** `vjQBZc9IbwGcC0VxViBNp0` ("Interlex-UI"). The CellCards grid screen (nav + header +
sidebar + grid) is the frame **`9236:58969`** ("Ontology Grid View").

## 2. The tools, in the order you use them

1. **`get_metadata`** — the node tree: child frames with `id`, `name`, `x/y/width/height`, and
   `hidden="true"` on hidden variants. This is your map. Read it first to find the sub-node you care
   about (walk the named frames: "Updated header" → "header" → "Frame 362" …).
2. **`get_screenshot`** — a rendered PNG of a node. Returns JSON with `image_url` (short-lived —
   treat like a secret). Download then view:
   ```
   curl -sL -o /tmp/.../shot.png "<image_url>"
   ```
   then `Read` the PNG. The screenshot is **cropped to the requested node** — request a parent node
   to see surrounding context.
3. **`get_variable_defs`** — design tokens for a node (colors like `Gray/600 #515252`, fonts like
   `Text sm/Medium`, spacing, shadows). Use these to match styling.
4. **`get_design_context`** — only when implementing; call it **after** `get_metadata` (the metadata
   tool result will remind you). Returns richer implementation detail for a subtree.

## 3. Gotchas learned the hard way

- **A node id is often only PART of a screen.** Check the `x/y` in the metadata: if a "Container"
  starts at `y=354`, the header/breadcrumb lives in a **sibling frame above it**, not inside. Fetch
  the **parent screen frame** (e.g. `9236:58969`) to see the whole thing, then drill down.
- **`hidden="true"` = a hidden variant/state** (copy-link states, alternate button groups, deferred
  features). Ignore these for the default view unless you're implementing that state.
- **Node names are layer names, not guaranteed content.** A text node named `NPOprecisionCellType`
  may render different (or stale) text. Confirm real strings from a screenshot and from the actual
  data source, never from the layer name alone.
- **Coordinates are in the parent's space**, so nesting matters when reasoning about position.
- The screenshot JSON also gives `original_width/height` vs returned `width/height` — use the ratio
  if you need pixel-accurate measurements off the image.

## 4. Turn design into interlex code — theme only, no custom styling

**Standing rule: do not add custom styling.** Build the UI from **existing Material UI components**
and the **interlex theme**. Do not introduce new colors, borders, radii, shadows, font sizes/weights,
or bespoke CSS — *unless the user explicitly asks for it*. If the design seems to need something the
theme doesn't have, prefer the closest existing token/variant/component, and surface the gap to the
user rather than inventing a style.

Map what `get_variable_defs` returns onto the theme:
- Figma `Gray/*`, `Brand/*`, `Success/*` → `vars` in [src/theme/variables.js](src/theme/variables.js).
- Chips/badges → the `MuiChip` variants in [src/theme/index.jsx](src/theme/index.jsx)
  (`color="secondary"` ≈ blue, `color="success"` ≈ green, `variant="outlined"` ≈ gray).
- Fonts (`Display sm/Semibold`, `Text sm/*`) → the nearest MUI `Typography` variant.
- Reuse the shared primitives in [src/components/common/](src/components/common/) (breadcrumbs,
  selects, pagination, buttons…) before writing anything new.
- The **only** thing `sx` is for is **layout** — flex, grid, gap, padding, width. Never colors/type in `sx`.

## 5. Iterate on the running app until it matches

The app runs at **http://localhost:5173/** (start with `yarn dev` if it isn't up — check with a
`curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/`). **Getting the design right is a
loop, not a single pass:** navigate to the real route (e.g. `/cellcards/precision`), render it,
compare against the Figma node, adjust, and repeat until they line up.

Do this against the live page, not from memory:
- Screenshot the running route (headless Playwright is set up in the scratchpad scripts) using the
  **same crop region** as the Figma screenshot, and view them side by side — don't trust that the
  code "looks right".
- Check both light/dark and both states of any toggle, and re-render after every change.
- Only call the design done once the live page and the Figma frame agree on structure, labels,
  spacing, and tokens.
