import PropTypes from "prop-types";
import { Stack, Typography, Alert, AlertTitle, IconButton, Link, Divider } from "@mui/material";
import ScatterPlotOutlinedIcon from "@mui/icons-material/ScatterPlotOutlined";
import { ArrowOutwardIcon } from "../../../../Icons";
import CellCardWidget from "../CellCardWidget";
import { NERVOSENSUS_GROUP_BY, MARKER_GENE_PREDICATE } from "../../config/cellCardConfig";

export const TITLE = "Interactive Cell Grouping";

const withGroupBy = (url, groupBy) => {
  try {
    const u = new URL(url);
    u.searchParams.set("groupBy", groupBy);
    return u.toString();
  } catch {
    // Not an absolute URL — fall back to naive appending rather than dropping the link.
    return `${url}${url.includes("?") ? "&" : "?"}groupBy=${groupBy}`;
  }
};

/**
 * §4.3 Interactive Cell Grouping / NervoSensus (Figma 9239:67802).
 *
 * Entirely conditional on `ilx:hasNervoSensusLink`, which has **zero occurrences** in the shipped
 * graph — so in practice this widget is hidden today (see `hasCellGrouping`). It is built anyway
 * because the shape is fully specified and it lights up with no code change once the triple lands.
 *
 * The tile is a MUI `Alert`, which is what the design itself reuses for this pattern (an icon, a
 * title, supporting text and a trailing action) rather than a bespoke frame.
 */
const CellGrouping = ({ cell, actions }) => {
  // A deep link, not a phenotype, so the parser puts it on `annotations` (matched by local
  // name under any prefix) rather than on `properties`.
  const link = cell.annotations?.nervoSensusLinks?.[0];
  const url = link?.iri || link?.id;
  if (!url) return null;

  const genes = cell.properties[MARKER_GENE_PREDICATE]?.values || [];

  return (
    <CellCardWidget title={TITLE} actions={actions}>
      <Alert
        severity="info"
        icon={<ScatterPlotOutlinedIcon />}
        action={
          <IconButton
            component="a"
            href={url}
            target="_blank"
            rel="noopener"
            aria-label="Open NervoSensus"
          >
            <ArrowOutwardIcon />
          </IconButton>
        }
      >
        <AlertTitle>Explore in NervoSensus</AlertTitle>
        Interactively group and compare cells by phenotype
      </Alert>

      <Divider />

      <Stack direction="row" alignItems="center" gap={0.5} flexWrap="wrap">
        {genes.length > 0 && (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {`View pre-filtered for ${genes.map((g) => g.label || g.curie).join(", ")}.`}
          </Typography>
        )}
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Group by
        </Typography>
        {NERVOSENSUS_GROUP_BY.map((groupBy, i) => (
          <Stack key={groupBy} direction="row" alignItems="center" gap={0.5}>
            {i > 0 && (
              <Typography variant="body2" sx={{ color: "text.disabled" }}>
                ·
              </Typography>
            )}
            <Link href={withGroupBy(url, groupBy)} target="_blank" rel="noopener" variant="body2">
              {groupBy}
            </Link>
          </Stack>
        ))}
      </Stack>
    </CellCardWidget>
  );
};

CellGrouping.propTypes = {
  cell: PropTypes.object.isRequired,
  actions: PropTypes.node,
};


export default CellGrouping;
