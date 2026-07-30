import { useMemo, Fragment } from "react";
import PropTypes from "prop-types";
import { Box, Stack, Divider } from "@mui/material";
import DefinitionBanner from "./DefinitionBanner";
import WidgetCommentButton from "./WidgetCommentButton";
import BiologicalProperties, { TITLE as BIO_TITLE } from "./widgets/BiologicalProperties";
import OntologyHierarchy, { TITLE as HIERARCHY_TITLE } from "./widgets/OntologyHierarchy";
import AnatomicalContext, { TITLE as ANATOMY_TITLE } from "./widgets/AnatomicalContext";
import RelationshipGraph, { TITLE as GRAPH_TITLE } from "./widgets/RelationshipGraph";
import TranscriptomicProfile, { TITLE as TRANSCRIPTOMIC_TITLE } from "./widgets/TranscriptomicProfile";
import CellGrouping, { TITLE as GROUPING_TITLE } from "./widgets/CellGrouping";
import CrossNomenclature, { TITLE as MAPPING_TITLE } from "./widgets/CrossNomenclature";
import SourcePublication, { TITLE as PUBLICATION_TITLE } from "./widgets/SourcePublication";
import RelatedCells, { TITLE as RELATED_TITLE } from "./widgets/RelatedCells";
import { relatedBySource, hierarchyNeighbours } from "../services/ontologyGridService";
import {
  hasDefinition,
  hasTranscriptomicProfile,
  hasCrossNomenclature,
  hasSourcePublication,
} from "./widgetVisibility";

// Column widths measured from Figma (9239:67600): 424 | 848 | 424 with 32px gutters inside a
// 1760px content width. Expressed as fr so the centre absorbs a narrower viewport while the two
// side columns keep the width their content was designed for, then stacking below `lg`.
const COLUMNS = { xs: "1fr", lg: "26.5rem minmax(0, 1fr) 26.5rem" };

/**
 * The Cell Card body: a definition banner over three columns of widgets.
 *
 * Widgets are separated by Dividers in the left and centre columns and by plain spacing in the
 * right one — that asymmetry is in the design, not an oversight. Each widget is a border-less
 * `CellCardWidget` rather than a Card; see that component for why.
 *
 * Every conditional widget decides for itself whether it has anything to show, so a sparse cell
 * renders a clean, collapsed card instead of a grid of empty frames.
 */
const CellCard = ({ cell, data, group, termSlug, discussionHref, onNavigateToCell, onNavigateToRef }) => {
  const neighbours = useMemo(() => hierarchyNeighbours(data, cell), [data, cell]);
  const related = useMemo(() => relatedBySource(data, cell), [data, cell]);

  // One comment affordance per widget, prefilled with that widget's name (design 9272:85572).
  const commentFor = (widgetTitle) => (
    <WidgetCommentButton
      widgetTitle={widgetTitle}
      cellLabel={cell.label}
      termId={termSlug}
      group={group}
      discussionHref={discussionHref}
    />
  );

  const left = [
    <BiologicalProperties
      key="bio"
      cell={cell}
      predicateDisplay={data.predicateDisplay}
      actions={commentFor(BIO_TITLE)}
    />,
    <OntologyHierarchy
      key="hierarchy"
      cell={cell}
      hierarchy={data.hierarchy}
      rootLabel={data.entry?.rootClass?.split(":").pop() || "root"}
      // Same resolver the graph uses: a cell stays in the card, anything else opens its own page.
      onNavigate={onNavigateToRef}
      actions={commentFor(HIERARCHY_TITLE)}
    />,
    <AnatomicalContext
      key="anatomy"
      cell={cell}
      predicateDisplay={data.predicateDisplay}
      actions={commentFor(ANATOMY_TITLE)}
    />,
  ];

  const centre = [
    <RelationshipGraph
      key="graph"
      cell={cell}
      neighbours={neighbours}
      onNavigate={onNavigateToRef}
      actions={commentFor(GRAPH_TITLE)}
    />,
    hasTranscriptomicProfile(cell) && (
      <TranscriptomicProfile key="transcriptomic" cell={cell} actions={commentFor(TRANSCRIPTOMIC_TITLE)} />
    ),
    // Unconditional: NervoSensus is a tool, not per-cell data (see the widget).
    <CellGrouping key="grouping" cell={cell} actions={commentFor(GROUPING_TITLE)} />,
    hasCrossNomenclature(cell) && (
      <CrossNomenclature key="mapping" cell={cell} actions={commentFor(MAPPING_TITLE)} />
    ),
  ].filter(Boolean);

  const right = [
    hasSourcePublication(cell) && (
      <SourcePublication key="publication" cell={cell} actions={commentFor(PUBLICATION_TITLE)} />
    ),
    related.length > 0 && (
      <RelatedCells
        key="related"
        cell={cell}
        related={related}
        onSelect={onNavigateToCell}
        actions={commentFor(RELATED_TITLE)}
      />
    ),
  ].filter(Boolean);

  // Left and centre columns put a Divider between widgets; the right column does not.
  const withDividers = (widgets) =>
    widgets.map((widget, i) => (
      <Fragment key={widget.key}>
        {i > 0 && <Divider />}
        {widget}
      </Fragment>
    ));

  return (
    <Stack gap={3} sx={{ px: 4, py: 3 }}>
      {hasDefinition(cell) && <DefinitionBanner cell={cell} />}

      <Box sx={{ display: "grid", gridTemplateColumns: COLUMNS, gap: 4, alignItems: "start" }}>
        <Stack gap={4} sx={{ minWidth: 0 }}>
          {withDividers(left)}
        </Stack>
        <Stack gap={4} sx={{ minWidth: 0 }}>
          {withDividers(centre)}
        </Stack>
        <Stack gap={4} sx={{ minWidth: 0 }}>
          {right}
        </Stack>
      </Box>
    </Stack>
  );
};

CellCard.propTypes = {
  cell: PropTypes.object.isRequired,
  // The loaded ontology (cells, hierarchy, predicateDisplay, entry).
  data: PropTypes.object.isRequired,
  group: PropTypes.string,
  termSlug: PropTypes.string,
  discussionHref: PropTypes.string,
  // Navigate to another cell's Cell Card, keeping the context ontology.
  onNavigateToCell: PropTypes.func,
  // Navigate to an arbitrary resolved reference (a graph node that may not be a cell).
  onNavigateToRef: PropTypes.func,
};

export default CellCard;
