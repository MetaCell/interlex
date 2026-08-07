import { useState, useEffect, useMemo, useCallback } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Box, Typography, Stack } from "@mui/material";
import GridFilterSidebar from "./GridFilterSidebar";
import GridSearchBar from "./GridSearchBar";
import CellTileGrid from "./CellTileGrid";
import CustomSingleSelect from "../common/CustomSingleSelect";
import CustomPagination from "../common/CustomPagination";
import { getFacets, curieToSlug } from "./services/ontologyGridService";
import { termPath } from "./config/gridConfig";
import { primeTermDataCache } from "../../hooks/useTermData";
import { vars } from "../../theme/variables";

const { gray200, gray600 } = vars;
const PAGE_SIZES = [12, 24, 48, 96];

// Serialised text for the free-text "Filter by word" (label + id + all values).
const cellText = (cell) => {
  const parts = [cell.label, cell.curie];
  Object.values(cell.properties).forEach((p) => p.values.forEach((v) => parts.push(v.label)));
  cell.sources.forEach((s) => parts.push(s.label));
  return parts.join(" ").toLowerCase();
};

// The value keys a cell exposes for a given facet.
const cellFacetKeys = (cell, localName) => {
  if (localName === "source") return cell.sources.map((s) => s.id);
  return (cell.properties[localName]?.values || []).map((v) => v.id);
};

// The "Grid View" tab. The ontology itself is loaded by the OntologyPage layout route and
// arrives through the outlet context, so switching tabs does not refetch it.
const OntologyGridPage = () => {
  const { data } = useOutletContext();
  const navigate = useNavigate();
  const [displayedOnly, setDisplayedOnly] = useState(true);
  const [checked, setChecked] = useState({}); // facet filter checks, keyed by facet localName
  const [selectedIds, setSelectedIds] = useState({}); // tiles picked via their checkbox
  const [word, setWord] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);

  useEffect(() => {
    // Reset all filter/paging/selection state so it never leaks across ontologies.
    setChecked({});
    setSelectedIds({});
    setWord("");
    setDisplayedOnly(true);
    setPage(1);
  }, [data]);

  const cells = useMemo(() => data?.cells || [], [data]);
  const facets = useMemo(() => getFacets(cells, displayedOnly), [cells, displayedOnly]);
  // Only currently-visible facets constrain results — a facet hidden by the
  // "Displayed properties" toggle must not silently filter (its checks are kept
  // but inert until it is shown again).
  const visibleFacets = useMemo(() => new Set(facets.map((f) => f.localName)), [facets]);

  const filteredCells = useMemo(() => {
    const q = word.trim().toLowerCase();
    return cells.filter((cell) => {
      for (const [localName, sel] of Object.entries(checked)) {
        if (!visibleFacets.has(localName)) continue; // hidden facet → no constraint
        const keys = Object.entries(sel)
          .filter(([, on]) => on)
          .map(([k]) => k);
        if (!keys.length) continue; // no constraint for this facet
        const cellKeys = cellFacetKeys(cell, localName);
        if (!keys.some((k) => cellKeys.includes(k))) return false; // AND across facets
      }
      if (q && !cellText(cell).includes(q)) return false;
      return true;
    });
  }, [cells, checked, word, visibleFacets]);

  const total = filteredCells.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageCells = useMemo(
    () => filteredCells.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredCells, currentPage, pageSize]
  );

  const onToggle = useCallback((localName, key) => {
    setChecked((prev) => ({
      ...prev,
      [localName]: { ...prev[localName], [key]: !prev[localName]?.[key] },
    }));
    setPage(1);
  }, []);

  const onClear = useCallback((localName) => {
    setChecked((prev) => {
      const next = { ...prev };
      delete next[localName];
      return next;
    });
    setPage(1);
  }, []);

  // Master checkbox in the filter header — drops every facet selection at once.
  const onClearAll = useCallback(() => {
    setChecked({});
    setPage(1);
  }, []);

  // Tile selection. Kept across paging and filtering — a tile scrolled out of view stays picked.
  const onToggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  }, []);

  const onWord = useCallback((value) => {
    setWord(value);
    setPage(1);
  }, []);

  // Tile click -> that cell's Cell Card (the tile's primary action, per the design).
  //
  // Two things travel with the navigation. The card is opened under this ontology's own path, which
  // is how it knows which graph to resolve the term against. And the label is pushed into the
  // term-data cache first: the term page would otherwise fetch `/{group}/npokb_998.jsonld`, which
  // 404s for every Precision cell, and a cache hit skips the request entirely and titles the page
  // at once.
  const openCellCard = useCallback(
    (cell) => {
      const slug = curieToSlug(cell.curie);
      primeTermDataCache(data.entry.org, slug, cell.label);
      navigate(termPath(data.entry.org, data.entry.slug, slug, "cell-card"));
    },
    [navigate, data]
  );

  return (
    // Body: filter sidebar | results
    <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
      <GridFilterSidebar
        facets={facets}
        checked={checked}
        onToggle={onToggle}
        onClear={onClear}
        onClearAll={onClearAll}
        displayedOnly={displayedOnly}
        onToggleDisplayedOnly={() => setDisplayedOnly((v) => !v)}
      />

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Box
          sx={{
            px: 4,
            py: 2,
            borderBottom: `1px solid ${gray200}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography variant="body2" sx={{ color: gray600 }}>
            Showing {pageCells.length} of {total} cells
          </Typography>
          <Stack direction="row" alignItems="center" gap={2}>
            <GridSearchBar value={word} onSubmit={onWord} />
            <Stack direction="row" alignItems="center" gap={1}>
              <Typography variant="caption" sx={{ fontSize: "0.875rem", color: gray600 }}>
                Show on page:
              </Typography>
              <CustomSingleSelect
                value={pageSize}
                onChange={(v) => {
                  setPageSize(Number(v));
                  setPage(1);
                }}
                options={PAGE_SIZES}
              />
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", px: 4, py: 3 }}>
          <CellTileGrid
            cells={pageCells}
            onSelect={openCellCard}
            selectedIds={selectedIds}
            onToggleSelect={onToggleSelect}
          />
        </Box>

        {total > pageSize && (
          <Box sx={{ borderTop: `1px solid ${gray200}` }}>
            <CustomPagination
              rowCount={total}
              rowsPerPage={pageSize}
              page={currentPage}
              onPageChange={(_, p) => setPage(p)}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default OntologyGridPage;
