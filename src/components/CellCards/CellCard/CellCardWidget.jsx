import PropTypes from "prop-types";
import { Stack, Typography, Box } from "@mui/material";

/**
 * The shell every Cell Card widget shares: a title row with optional action icons, then the
 * widget body (Figma component "Widget header", 9535:96275).
 *
 * Intentionally NOT a `Card`. CLAUDE.md prefers Card/CardContent for a card, but this design
 * is deliberately border-less and shadow-less — Sara, design review: "more minimalistic and
 * clean without the borders". Widgets are separated by the column's Dividers, not by their own
 * frames. This follows the existing OntologyHierarchyPanel pattern (Stack + sectionTitle), so
 * please don't "fix" it into a Card.
 */
const CellCardWidget = ({ title, description, count, actions, children, id }) => (
  <Stack id={id} gap={2} sx={{ minWidth: 0 }}>
    <Stack gap={0.5}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ minHeight: "1.75rem" }}>
        <Typography variant="sectionTitle">{title}</Typography>
        {count != null && (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {count}
          </Typography>
        )}
        {/* Actions sit hard right; `mr: -1` pulls the icon button's hit area back so the glyph
            lines up with the column edge rather than the padding. */}
        {actions && (
          <Box sx={{ ml: "auto", mr: -1, display: "flex", alignItems: "center", gap: 0.5 }}>
            {actions}
          </Box>
        )}
      </Stack>
      {description && (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {description}
        </Typography>
      )}
    </Stack>
    {children}
  </Stack>
);

CellCardWidget.propTypes = {
  title: PropTypes.string.isRequired,
  // Helper text under the title, e.g. Cross-Nomenclature's "Provisional mapping…" subheader.
  description: PropTypes.string,
  // Secondary count beside the title, e.g. "21 cells" on Other cells from this source.
  count: PropTypes.string,
  actions: PropTypes.node,
  children: PropTypes.node,
  id: PropTypes.string,
};

export default CellCardWidget;
