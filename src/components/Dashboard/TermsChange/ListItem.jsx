import {
  Box,
  ListItem,
  ListItemText,
  ListItemIcon,
  Stack,
  Avatar,
  Typography, Chip
} from "@mui/material";
import {
  ApproveHistoryIcon,
  MergeHistoryIcon,
  RejectHistoryIcon
} from "../../../Icons";
import PropTypes from "prop-types";
import { formatTimestamp } from "../../../utils";
import CustomButton from "../../common/CustomButton";
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import { PR_STATUS } from "./pullRequests";

import { vars } from "../../../theme/variables";
const { gray600, gray700, brand600 } = vars;

const visibilityHidden = {
  display: 'none',
  transition: 'opacity 0.3s ease-in-out'
}

// An admin's dashboard lists everybody's requests, so the sentence has to say whose it is
// rather than always addressing the reader as the author.
const getRequestText = (entry, viewerGroup) => {
  const mine = !!viewerGroup && entry.fromGroup === viewerGroup;
  switch (entry.status) {
    case PR_STATUS.REQUESTED:
      return mine ? `You asked to merge:` : `${entry.fromGroup} asked to merge:`;
    case PR_STATUS.APPROVED:
    case PR_STATUS.REJECTED:
      return mine ? `Your request to merge:` : `Request to merge:`;
    default:
      return `Merge request:`;
  }
};

const getRequestIcon = (status) => {
  switch (status) {
    case PR_STATUS.APPROVED:
      return <ApproveHistoryIcon />;
    case PR_STATUS.REQUESTED:
      return <MergeHistoryIcon />;
    case PR_STATUS.REJECTED:
      return <RejectHistoryIcon />;
    default:
      return <div style={{ width: "0.375rem", height: "0.375rem", borderRadius: "0.875rem", border: `1px solid #313534` }} />;
  }
};

const ListTermItem = ({ entry, onRequestClick, viewerGroup }) => {
  // The term page for one side of the request; absolute so window.open treats it as a URL
  // rather than prefixing a scheme onto a relative path.
  const termUrl = (group) => entry.termId
    ? `${window.location.origin}/${group}/${entry.termId}/overview`
    : null;

  const openTerm = (group) => {
    const url = termUrl(group);
    if (url) window.open(url, '_blank');
  };

  return (
    <ListItem sx={{
      display: 'flex',
      alignItems: 'center',
      pt: '0.375rem',
      pb: 0,
      pl: '1.75rem',
      // Right edge lines up with the pagination's "Next" (1rem root + 0.5rem item padding).
      pr: '1.5rem',
      minHeight: '4.375rem',
      position: 'relative',
    }}>
      <ListItemIcon sx={{
        position: 'absolute',
        left: '-0.563rem',
        top: '1rem'
      }}>
        {getRequestIcon(entry.status)}
      </ListItemIcon>
      <Stack direction="row" width={1} alignItems="center" height={40}>
        <Avatar sx={{ width: 32, height: 32 }}>{(entry.fromGroup || '').slice(0, 2)}</Avatar>
        <ListItemText
          sx={{
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            ml: '0.75rem',
            width: '100%',
            justifyContent: 'space-between'
          }}
          primary={
            <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
              <Typography variant="body2" sx={{ color: gray700, fontWeight: 500 }}>{getRequestText(entry, viewerGroup)}</Typography>
              <Typography variant="body2" sx={{ color: brand600, fontWeight: 600, cursor: 'pointer' }}
                          onClick={() => openTerm(entry.fromGroup)}>{entry.fromGroup}</Typography>
              <Typography variant="body2" sx={{ color: gray700, fontWeight: 500 }}>to</Typography>
              <Typography variant="body2" sx={{ color: brand600, fontWeight: 600, cursor: 'pointer' }}
                          onClick={() => openTerm(entry.toGroup)}>{entry.toGroup}</Typography>
              {entry.termId && <Chip label={entry.termId} className="greenChip" variant="outlined" />}
              {entry.status === PR_STATUS.APPROVED &&
                <Typography variant="body2" sx={{ color: gray700, fontWeight: 500 }}>has been approved</Typography>
              }
              {entry.status === PR_STATUS.REJECTED &&
                <Typography variant="body2" sx={{ color: gray700, fontWeight: 500 }}>has been rejected</Typography>
              }
              {/* The backend may report a state this UI does not name yet; show it verbatim
                  rather than let the bucket be the whole story. */}
              {entry.status === PR_STATUS.REQUESTED && entry.rawStatus && entry.rawStatus !== 'pending' &&
                <Typography variant="body2" sx={{ color: gray600, fontWeight: 500 }}>({entry.rawStatus})</Typography>
              }
            </Box>
          }
          secondary={
            <Box display="flex" alignItems="center" gap={1.5}>
              <Typography sx={{ color: gray600, fontSize: '0.75rem' }}>{formatTimestamp(entry.date)}</Typography>
              <CustomButton sx={visibilityHidden} onClick={(e) => onRequestClick(e, entry)}>
                View request
                <ArrowOutwardIcon />
              </CustomButton>
            </Box>
          }
        />
      </Stack>
    </ListItem>
  )
};

ListTermItem.propTypes = {
  entry: PropTypes.object.isRequired,
  onRequestClick: PropTypes.func.isRequired,
  viewerGroup: PropTypes.string
};

export default ListTermItem;
