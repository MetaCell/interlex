# Interlex UI

This project implements a web interface to visualize existing ontology data.

The backend is served on https://uri.olympiangods.org, and it's maintained separately.

For the cellcards features, refer to documents in the `cellcard-spec` directory

## UI conventions

**Always consider the most adequate Material UI component before assembling something out of `Box`
+ `sx`.** If MUI ships a component for the concept, use it — `Card`/`CardContent` for a card,
`List`/`ListItem` for a list, `Table` for tabular data, `Stack` for a spaced run of children — and
reuse the shared primitives in [src/components/common/](src/components/common/) before writing a
new one.

Styling belongs in the theme ([src/theme/index.jsx](src/theme/index.jsx)), not at the call site:
`sx` is for **layout only** (flex, grid, gap, padding, width), never colors, typography, radii or
shadows.

The `material-ui` skill covers how this project's theme is put together and which MUI defaults it
does *not* define (the ones that bite when you introduce a new component). The
`check-figma-design` skill covers working from the Figma file.

## Coding best practices
- Avoid redundant comments: make the code the source of truth with proper naming and functions refactorings. Only use comments about the why some code is written, not the what nor the how. Clean comments that do not comply at the end of each session.