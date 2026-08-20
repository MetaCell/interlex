import PropTypes from "prop-types";
import { Box, Container } from "@mui/material";
import CustomBreadcrumbs from "./CustomBreadcrumbs";
import CopyPathLink from "./CopyPathLink";
import { vars } from "../../theme/variables";

const { gray200 } = vars;

// App-wide breadcrumb container: the breadcrumb lives in its own top bar (never
// nested in a page's title block), with an optional "copy path" permalink control
// and optional right-aligned content (e.g. an active-ontology selector).
const BreadcrumbBar = ({ breadcrumbItems, copyPath, permalink, copyLabel, rightContent }) => (
  <Container
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 2,
      py: 2,
      borderBottom: `1px solid ${gray200}`,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
      <CustomBreadcrumbs breadcrumbItems={breadcrumbItems} />
      {copyPath && <CopyPathLink permalink={permalink} label={copyLabel} />}
    </Box>
    {rightContent}
  </Container>
);

BreadcrumbBar.propTypes = {
  breadcrumbItems: PropTypes.array.isRequired,
  copyPath: PropTypes.bool,
  permalink: PropTypes.string,
  copyLabel: PropTypes.string,
  rightContent: PropTypes.node,
};

BreadcrumbBar.defaultProps = {
  copyPath: false,
  permalink: undefined,
  copyLabel: "Copy link",
  rightContent: null,
};

export default BreadcrumbBar;
