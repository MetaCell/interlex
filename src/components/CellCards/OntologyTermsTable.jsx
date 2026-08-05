import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import GridSearchBar from "./GridSearchBar";
import { termLink } from "./config/gridConfig";

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
const columns = [
  {
    field: "label",
    headerName: "Term",
    flex: 280,
    minWidth: 180,
    renderCell: ({ row }) => (
      <Typography variant="body2" color="text.primary" title={row.label}>
        {row.label}
      </Typography>
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
    renderCell: ({ row }) =>
      row.href ? (
        <Tooltip title="Open term in new tab">
          <IconButton
            size="small"
            component="a"
            href={row.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${row.label} in a new tab`}
          >
            <OpenInNewOutlinedIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      ) : null,
  },
];

// Free-text filter over everything the table shows: partial match, case-insensitive, and the
// row order is preserved (design decision — the filter hides rows, it does not re-rank them).
const matches = (row, query) =>
  [row.label, row.curie, row.rdfType, row.definition]
    .join(" ")
    .toLowerCase()
    .includes(query);

// The "Terms" widget: every term in the ontology, whatever the hierarchy beside it is showing.
// The two widgets deliberately do not interact in this MVP.
const OntologyTermsTable = ({ cells }) => {
  const [word, setWord] = useState("");

  const rows = useMemo(
    () =>
      cells.map((cell) => ({
        id: cell.id,
        label: cell.label,
        curie: cell.curie,
        href: termLink(cell),
        rdfType: cell.rdfTypes.join(", "),
        definition: cell.definition || "",
        definitionCurated: cell.definitionCurated ?? true,
      })),
    [cells]
  );

  const filteredRows = useMemo(() => {
    const query = word.trim().toLowerCase();
    return query ? rows.filter((row) => matches(row, query)) : rows;
  }, [rows, word]);

  return (
    <Stack sx={{ height: 1, minHeight: 0 }} gap={2}>
      <Typography variant="sectionTitle">Terms</Typography>
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
          // null row node in useGridRowAriaAttributes when its last row is filtered away.
          <Stack alignItems="center" justifyContent="center" sx={{ height: 1, p: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {rows.length
                ? "No terms match this filter."
                : "This ontology has no terms."}
            </Typography>
          </Stack>
        )}
      </Box>
    </Stack>
  );
};

OntologyTermsTable.propTypes = {
  cells: PropTypes.array.isRequired,
};

export default OntologyTermsTable;
