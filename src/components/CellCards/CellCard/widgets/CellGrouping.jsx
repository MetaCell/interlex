import PropTypes from "prop-types";
import { Stack, Typography, Button, Box, Link, Divider } from "@mui/material";
import PolylineOutlinedIcon from "@mui/icons-material/PolylineOutlined";
import { ArrowOutwardIcon } from "../../../../Icons";
import CellCardWidget from "../CellCardWidget";
import { buildNervoSensusLink } from "../nervoSensusLink";
import { NERVOSENSUS_VIEWS } from "../../config/cellCardConfig";

export const TITLE = "Interactive Cell Grouping";

// Add the view's params to the cell's own link, so a grouping keeps the cell's filters.
const withParams = (href, params) => {
  try {
    const url = new URL(href);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    return url.toString();
  } catch {
    const query = new URLSearchParams(params).toString();
    return `${href}${href.includes("?") ? "&" : "?"}${query}`;
  }
};

/**
 * §4.3 Interactive Cell Grouping / NervoSensus (Figma 9239:67802).
 *
 * The tile is one `Button variant="tile"` rendering an `<a>`, so the **whole** card is a single
 * click target with real link semantics — focus ring, keyboard activation, middle-click and
 * open-in-new-tab all for free. It was previously an `Alert` with a link in its title and a
 * separate icon button, which gave three small targets and a tinted fill the design does not have.
 * The `tile` variant lives in the theme (`MuiButton.variants`) because it is a look, not layout.
 *
 * Icon is Material Symbols `polyline`, which is what the design uses (Figma 9239:67809).
 *
 * Always rendered: NervoSensus is a single application, not a per-cell resource, so there is always
 * somewhere to send the user — only the precision varies, which `buildNervoSensusLink` works out
 * from the cell.
 */
const CellGrouping = ({ cell, actions }) => {
  const { href, precise, filters } = buildNervoSensusLink(cell);

  return (
    <CellCardWidget title={TITLE} actions={actions}>
      <Button
        // A real anchor, so this is a link that looks like a button rather than a button that
        // navigates — external target, hence component="a" over a router Link.
        component="a"
        variant="tile"
        href={href}
        target="_blank"
        rel="noopener"
      >
        <Box component="span" className="tileIcon">
          <PolylineOutlinedIcon fontSize="small" />
        </Box>
        {/* minWidth:0 so a long subtitle can shrink instead of pushing the arrow off the tile. */}
        <Box component="span" sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Box component="span" className="tileTitle">
            Explore in NervoSensus
          </Box>
          <Box component="span" className="tileSupporting">
            Interactively group and compare cells by phenotype
          </Box>
        </Box>
        <Box component="span" className="tileAction">
          <ArrowOutwardIcon />
        </Box>
      </Button>

      <Divider />

      <Stack direction="row" alignItems="center" gap={0.5} flexWrap="wrap">
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {precise
            ? "Opens this cell."
            : filters.length
              ? `Pre-filtered for ${filters.join(", ")}.`
              : "Opens the full cell atlas."}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Group by
        </Typography>
        {NERVOSENSUS_VIEWS.map((view, i) => (
          <Stack key={view.label} direction="row" alignItems="center" gap={0.5}>
            {i > 0 && (
              <Typography variant="body2" sx={{ color: "text.disabled" }}>
                ·
              </Typography>
            )}
            <Link
              href={withParams(href, view.params)}
              target="_blank"
              rel="noopener"
              variant="body2"
            >
              {view.label}
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
