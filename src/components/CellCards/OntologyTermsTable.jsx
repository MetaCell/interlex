import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, IconButton, Link, Stack, Tooltip, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ArrowOutwardOutlinedIcon from "@mui/icons-material/ArrowOutwardOutlined";
import GridSearchBar from "./GridSearchBar";
import { termPath } from "./config/gridConfig";
import { curieToSlug } from "./services/ontologyGridService";

// Most of these terms describe themselves in far more than the two lines the design's row
// allows, so the text is capped at two and the cell's title carries the whole thing.
//
// 2.5rem is exactly two 1.25rem lines, which is also the cell's content box (3.5rem row less
// its 0.5rem padding). Capping on a line boundary is what keeps the overflow clean: a third
// line falls entirely outside the box instead of being sliced through the middle. Layout only
// — the font and colour come from the theme's MuiDataGrid cell — and hoisted so Emotion
// serialises it once rather than per rendered cell.
const capToTwoLines = { minWidth: 0, maxHeight: "2.5rem", overflow: "hidden" };

// Generated text is labelled as such in the tooltip: these terms carry no curated definition,
// and silently presenting a machine-built phenotype string as one would misreport provenance.
const definitionTitle = (row) =>
  row.definitionCurated
    ? row.definition
    : `${row.definition}\n\nGenerated from this term's phenotypes — it has no curated definition.`;

// Column widths are the design's (280 / 176 / 176 / 448 / 72 of 1152) expressed as flex
// ratios, so the table keeps its proportions at any viewport.
//
// The term's name is the primary action, and it opens the term *without* naming a tab: which view
// a term opens on is the term page's decision, and only it knows whether there is a Cell Card to
// show (SingleTermView defaults a cell to the Cell Card and anything else to Overview). The action
// column is the same destination in a new tab, for reading a term without losing the browse.
const columns = [
  {
    field: "label",
    headerName: "Term",
    flex: 280,
    minWidth: 180,
    // The grid gives each *cell* a roving tabIndex but does not manage focusable children, so an
    // interactive cell has to take it or every row becomes a permanent tab stop — 100 rows a page,
    // two links each.
    renderCell: ({ row, tabIndex }) => (
      <Link
        component={RouterLink}
        to={row.href}
        tabIndex={tabIndex}
        variant="body2"
        color="text.primary"
        underline="hover"
        title={row.label}
      >
        {row.label}
      </Link>
    ),
  },
  { field: "curie", headerName: "ID", flex: 176, minWidth: 130 },
  { field: "rdfType", headerName: "rdf:type", flex: 176, minWidth: 130 },
  {
    field: "definition",
    headerName: "Definition",
    flex: 448,
    minWidth: 200,
    renderCell: ({ row }) =>
      row.definition ? (
        <Box sx={capToTwoLines} title={definitionTitle(row)}>
          {row.definition}
        </Box>
      ) : null,
  },
  {
    field: "actions",
    headerName: "",
    width: 72,
    sortable: false,
    align: "center",
    renderCell: ({ row, tabIndex }) => (
      <Tooltip title="Open term in new tab">
        <IconButton
          size="small"
          component="a"
          href={row.href}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={tabIndex}
          aria-label={`Open ${row.label} in a new tab`}
        >
          <ArrowOutwardOutlinedIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
    ),
  },
];

// Free-text filter over everything the table shows: partial match, case-insensitive, and the
// row order is preserved (design decision — the filter hides rows, it does not re-rank them).
const matches = (row, query) =>
  [row.label, row.curie, row.rdfType, row.definition]
    .join(" ")
    .toLowerCase()
    .includes(query);

// The "Terms" widget: the terms the hierarchy beside it has scoped to, named by `scopeDescription`
// so the table says why these rows and not others. The word filter narrows that further.
const OntologyTermsTable = ({ cells, entry, scopeDescription, emptyMessage }) => {
  const [word, setWord] = useState("");

  const rows = useMemo(
    () =>
      cells.map((cell) => ({
        id: cell.id,
        label: cell.label,
        curie: cell.curie,
        href: termPath(entry.org, entry.slug, curieToSlug(cell.curie)),
        rdfType: cell.rdfTypes.join(", "),
        definition: cell.definition || "",
        definitionCurated: cell.definitionCurated ?? true,
      })),
    [cells, entry]
  );

  const filteredRows = useMemo(() => {
    const query = word.trim().toLowerCase();
    return query ? rows.filter((row) => matches(row, query)) : rows;
  }, [rows, word]);

  return (
    <Stack sx={{ height: 1, minHeight: 0 }} gap={2}>
      <Stack gap={0.5}>
        <Typography variant="sectionTitle">Terms</Typography>
        <Typography variant="body2" color="text.secondary">
          {scopeDescription}
        </Typography>
      </Stack>
      <GridSearchBar value={word} onSubmit={setWord} />
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {filteredRows.length ? (
          <DataGrid
            rows={filteredRows}
            columns={columns}
            // The design's fixed 3.5rem row. Two wrapped lines fit it exactly; a longer
            // definition is clipped, with the full text on the cell's title attribute.
            rowHeight={56}
            columnHeaderHeight={44}
            disableColumnMenu
            disableRowSelectionOnClick
            // The design shows the terms as one scrolling list, but the community Data Grid
            // clamps a page to 100 rows, so anything past the 100th term is only reachable
            // through the pager. Hence the footer, which the design does not have.
            pageSizeOptions={[25, 50, 100]}
            initialState={{
              sorting: { sortModel: [{ field: "label", sort: "asc" }] },
              pagination: { paginationModel: { pageSize: 100, page: 0 } },
            }}
            sx={{ height: 1 }}
          />
        ) : (
          // The design calls for an empty state when the filter matches nothing, and rendering
          // one also keeps the grid from ever holding zero rows: DataGrid v7 dereferences a
          // null row node in useGridRowAriaAttributes when its last row is filtered away. The
          // scope can empty the table too (a leaf has no subclasses), hence the caller's message.
          <Stack alignItems="center" justifyContent="center" sx={{ height: 1, p: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {rows.length ? "No terms match this filter." : emptyMessage}
            </Typography>
          </Stack>
        )}
      </Box>
    </Stack>
  );
};

OntologyTermsTable.propTypes = {
  cells: PropTypes.array.isRequired,
  // The ontology every row's term page hangs off — /[org]/ontology/[slug]/[term].
  entry: PropTypes.shape({ org: PropTypes.string, slug: PropTypes.string }).isRequired,
  // What the rows are, in the hierarchy's own words ("sub class of X").
  scopeDescription: PropTypes.string.isRequired,
  // Shown when the scope holds no term at all, as opposed to the filter matching none of them.
  emptyMessage: PropTypes.string.isRequired,
};

export default OntologyTermsTable;
