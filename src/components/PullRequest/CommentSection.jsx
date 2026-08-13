import PropTypes from "prop-types";
import { Box, Button, Card, CardContent, Stack, TextField, Tooltip, Typography } from "@mui/material";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

import { vars } from "../../theme/variables";
const { gray600, gray800 } = vars;

const NOT_IMPLEMENTED = "Commenting on merge requests is not implemented yet.";

/**
 * The review conversation from the design. There is no endpoint behind it yet — the backend
 * serves a merge request's log but takes no comments — so the whole section is inert and says
 * so on hover, rather than accepting text that would go nowhere.
 */
const CommentSection = ({ logs = [] }) => (
  <Box>
    <Typography color={gray800} fontWeight={600} fontSize="1.125rem" mb="0.75rem">
      Comments
    </Typography>

    {/* What the backend does record: who acted on the request and when. */}
    {logs.length > 0 && (
      <Stack spacing="0.5rem" mb="1rem">
        {logs.map((log, index) => (
          <Typography key={`${log?.datetime}-${index}`} fontSize=".875rem" color={gray600}>
            {log?.['acting-user']} set this request to {log?.status}
          </Typography>
        ))}
      </Stack>
    )}

    <Tooltip title={NOT_IMPLEMENTED} arrow>
      {/* Disabled controls swallow pointer events; the wrapper is what the tooltip listens on. */}
      <Box>
        <Card variant="outlined">
          <CardContent>
            <Stack spacing="1rem" alignItems="flex-start">
              <TextField
                fullWidth
                multiline
                minRows={3}
                disabled
                placeholder="Leave a comment or a suggestion about this merge request…"
              />
              <Button variant="contained" color="primary" disabled endIcon={<SendOutlinedIcon />}>
                Comment
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Tooltip>
  </Box>
);

CommentSection.propTypes = {
  logs: PropTypes.array,
};

export default CommentSection;
