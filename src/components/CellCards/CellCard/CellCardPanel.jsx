import { useCallback } from "react";
import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Container, Stack, Skeleton, Alert, AlertTitle, Button, Typography } from "@mui/material";
import CellCard from "./CellCard";
import EmptyState from "../../common/EmptyState";
import { useContextTerm } from "../../../hooks/useContextOntology";
import { curieToSlug } from "../services/ontologyGridService";
import {
  termLink,
  ontologyPath,
  termPath,
  ONTOLOGY_CATALOG,
} from "../config/gridConfig";
import { useTermRecordAvailability } from "../../../hooks/useTermRecordAvailability";

// A three-column skeleton, so the (unavoidable) whole-ontology load reads as the page arriving
// rather than as a blank panel. Cold entry pays a ~16MB fetch + a 39,788-node parse before the
// first cell can render; navigating from the grid hits the memoized parse and skips both.
// PageContainer fixes the page height and expects each tab to scroll internally (OverView does the
// same). Without this the card runs on underneath the site footer.
//
// Module scope, not the component body: declared inside, it would be a new component *type* on
// every render, so React would unmount and remount the whole card — losing an open comment
// popover, the hierarchy widget's query and the container's scroll offset on every location change.
const Scroll = ({ children }) => (
  <Box sx={{ overflow: "auto", width: "100%", minWidth: 0 }}>{children}</Box>
);

Scroll.propTypes = { children: PropTypes.node };

const LoadingSkeleton = () => (
  <Container
    sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", lg: "26.5rem minmax(0, 1fr) 26.5rem" },
      gap: 4,
      py: 3,
    }}
  >
    {[0, 1, 2].map((col) => (
      <Stack key={col} gap={1}>
        <Skeleton variant="text" width="45%" height={28} />
        {Array.from({ length: col === 1 ? 8 : 6 }).map((_, i) => (
          <Skeleton key={i} variant="text" />
        ))}
      </Stack>
    ))}
  </Container>
);

/**
 * The Cell Card tab: resolves the term against the context ontology and renders the card.
 *
 * The card's data never comes from the InterLex term API — Precision cells are npokb-only and
 * that endpoint 404s on every one of them. The context ontology is the `/ontology/{slug}/` the term
 * is read under, written by the grid tile click; it is *not* `DataContext.activeOntology`, which is
 * an edit target.
 */
const CellCardPanel = ({ term, group }) => {
  const navigate = useNavigate();
  const location = useLocation();
  // Same hook the page shell and the Overview read, so the card cannot end up on a different
  // ontology than the tab bar thinks it is.
  const { ontologySlug, cell, ontology: data, loading, error } = useContextTerm(term);
  // Same answer the page shell gates the Discussions tab on — one probe, shared through the
  // module-level cache, so the link and the tab cannot disagree.
  const termRecordAvailable = useTermRecordAvailability(term, group);

  // Navigating between cells keeps the context ontology — it stays in the path — so the card the
  // user lands on can still populate its hierarchy and sibling widgets (Sue: "you're staying in
  // that context ontology").
  const search = location.search;

  const goToCell = useCallback(
    (target) =>
      navigate(`${termPath(group, ontologySlug, curieToSlug(target.curie), "cell-card")}${search}`),
    [navigate, group, ontologySlug, search]
  );

  // A graph node may be a cell (stay in the card) or an external term (open its own page).
  const goToRef = useCallback(
    (ref) => {
      const sibling = data?.cells?.find((c) => c.id === ref.id);
      if (sibling) {
        goToCell(sibling);
        return;
      }
      const href = termLink(ref);
      if (href) window.open(href, "_blank", "noopener");
    },
    [data, goToCell]
  );

  if (loading) {
    return (
      <Scroll>
        <LoadingSkeleton />
      </Scroll>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 3 }}>
        <Alert severity="error">
          <AlertTitle>Could not load the ontology</AlertTitle>
          <Stack gap={1} alignItems="flex-start">
            <Typography variant="body2">{error.message}</Typography>
            <Button variant="outlined" onClick={() => navigate(0)}>
              Try again
            </Button>
          </Stack>
        </Alert>
      </Container>
    );
  }

  if (!cell) {
    const entry = ONTOLOGY_CATALOG[ontologySlug] || ONTOLOGY_CATALOG.precision;
    return (
      <EmptyState
        sx={{ width: "100%" }}
        message="This term is not a cell type in the loaded ontology."
        supportingText="The Cell Card shows neuron cell types from a precision ontology."
        actions={
          <Button variant="outlined" onClick={() => navigate(ontologyPath(entry))}>
            Browse the ontology
          </Button>
        }
      />
    );
  }

  return (
    <Scroll>
      <CellCard
        cell={cell}
        data={data}
        group={group}
        termSlug={term}
        // Only when the Discussions tab can actually serve this term. While the cell's id is not
        // mapped to an InterLex record that tab is disabled (SingleTermView gates it on the same
        // probe), so the link would land on a tab the bar shows as unselectable.
        discussionHref={
          termRecordAvailable
            ? `${termPath(group, ontologySlug, term, "discussions")}${search}`
            : undefined
        }
        onNavigateToCell={goToCell}
        onNavigateToRef={goToRef}
      />
    </Scroll>
  );
};

CellCardPanel.propTypes = {
  term: PropTypes.string.isRequired,
  group: PropTypes.string.isRequired,
};

export default CellCardPanel;
