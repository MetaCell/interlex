import PropTypes from "prop-types";
import { Card, Chip, Grid, Stack, Typography } from "@mui/material";

// One entry of a dashboard listing (terms, ontologies), shared by the user and the organization
// dashboards so both list things the same way. `action` is revealed on hover.
const ListingCard = ({ title, badge, description, action, onClick }) => (
  <Grid item xs={12} lg={6}>
    <Card variant="listing" onClick={onClick}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" alignItems="center" spacing=".75rem">
          <Typography variant="h6" className="listingTitle">{title}</Typography>
          {badge && <Chip label={badge} className="greenChip" variant="outlined" />}
        </Stack>
        {action}
      </Stack>
      <Typography variant="body2" className="listingDescription">
        {description || "-"}
      </Typography>
    </Card>
  </Grid>
);

ListingCard.propTypes = {
  title: PropTypes.node,
  badge: PropTypes.node,
  description: PropTypes.node,
  action: PropTypes.node,
  onClick: PropTypes.func,
};

export default ListingCard;
