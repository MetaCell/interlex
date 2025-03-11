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
import {formatDate} from "../../../helpers";
import CustomButton from "../../common/CustomButton";
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';

import { vars } from "../../../theme/variables";
const { gray600, gray700, brand600 } = vars;

const visibilityHidden = {
  display: 'none',
  transition: 'opacity 0.3s ease-in-out'
}

const getVariantsText = (entry) => {
  switch (entry.status) {
    case "requested":
      return `You asked to merged a fork:`;
    case "approved":
      return `Your request to merge:`;
    case "rejected":
      return `Your request to merge:`;
    default:
      return `performed an action`;
  }
};

const getVariantsIcon = (action) => {
  switch (action) {
    case "approved":
      return <ApproveHistoryIcon />;
    case "requested":
      return <MergeHistoryIcon />;
    case "rejected":
      return <RejectHistoryIcon />;
    default:
      return <div style={{ width: "0.375rem", height: "0.375rem", borderRadius: "0.875rem", border: `1px solid #313534` }} />;
  }
};
const ListTermItem = ({ entry, onRequestClick }) => {
  const handleForkClick = (url) => {
    const formattedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `http://${url}`;
    window.open(formattedUrl, '_blank');
  }
  return (
    <ListItem sx={{
      display: 'flex',
      alignItems: 'center',
      pt: '0.375rem',
      pb: 0,
      pl: '1.75rem',
      pr: '0.375rem',
      minHeight: '4.375rem',
      position: 'relative',
    }}>
      <ListItemIcon sx={{
        position: 'absolute',
        left: '-0.563rem',
        top: '1rem'
      }}>
        {getVariantsIcon(entry.status)}
      </ListItemIcon>
      <Stack direction="row" width={1} alignItems="center" height={40}>
        <Avatar sx={{width: 32, height: 32}}>{entry.name.slice(0, 2)}</Avatar>
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
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography variant="body2" sx={{color: gray700, fontWeight: 500}}>{getVariantsText(entry)}</Typography>
              <Typography variant="body2" sx={{ color: brand600, fontWeight: 600, cursor: 'pointer'}}
                          onClick={() => handleForkClick(entry?.origin?.url)}>{entry?.origin?.name}</Typography>
              <Typography variant="body2" sx={{color: gray700, fontWeight: 500}}>to</Typography>
              <Typography variant="body2" sx={{color: brand600, fontWeight: 600, cursor: 'pointer'}}
                          onClick={() => handleForkClick(entry?.destination?.url)}>{entry?.destination?.name}</Typography>
              <Chip label={entry?.name} className="greenChip" variant="outlined"/>
              {
                entry.action === 'approve' &&
                <Typography variant="body2" sx={{color: gray700, fontWeight: 500}}>has been approved</Typography>
              }
              {
                entry.action === 'reject' &&
                <Typography variant="body2" sx={{color: gray700, fontWeight: 500}}>has been rejected</Typography>
              }
            </Box>
          }
          secondary={
            <Box display="flex" alignItems="center" gap={1.5}>
              <Typography sx={{color: gray600, fontSize: '0.75rem'}}>{formatDate(entry.date)}</Typography>
              <CustomButton sx={visibilityHidden} onClick={(e) => onRequestClick(e, entry)}>
                View request
                <ArrowOutwardIcon/>
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
  onRequestClick: PropTypes.func.isRequired
};

export default ListTermItem;
