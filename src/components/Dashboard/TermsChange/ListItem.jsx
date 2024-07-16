import {
  Box,
  ListItem,
  ListItemText,
  ListItemIcon,
  Stack,
  Avatar,
  Typography, Chip
} from "@mui/material";
import CustomButton from "../../common/CustomButton";
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import { vars } from "../../../theme/variables";
import {
  ApproveHistoryIcon,
  MergeHistoryIcon,
  RejectHistoryIcon
} from "../../../Icons";

const { gray600, gray700, brand600 } = vars;

const visibilityHidden = {
  display: 'none',
  transition: 'opacity 0.3s ease-in-out'
}

const getVariantsText = (entry) => {
  switch (entry.action) {
    case "request":
      return `You asked to merged a fork:`;
    case "approve":
      return `Your request to merge:`;
    case "reject":
      return `Your request to merge:`;
    default:
      return `performed an action`;
  }
};

const getVariantsIcon = (action) => {
  switch (action) {
    case "approve":
      return <ApproveHistoryIcon />;
    case "request":
      return <MergeHistoryIcon />;
    case "reject":
      return <RejectHistoryIcon />;
    default:
      return <div style={{ width: "0.375rem", height: "0.375rem", borderRadius: "0.875rem", border: `1px solid #313534` }} />;
  }
};
const ListTermItem = ({ entry, onRequestClick }) => (
  <ListItem sx={{
    display: 'flex',
    alignItems: 'start',
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
      top: '0.375rem'
    }}>
      {getVariantsIcon(entry.action)}
    </ListItemIcon>
    <Stack direction="row" width={1} alignItems="center" height={40}>
      <Avatar sx={{ width: 32, height: 32 }}>{entry.author.slice(0, 2)}</Avatar>
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
            <Typography variant="body2" sx={{ color: gray700, fontWeight: 500 }}>{getVariantsText(entry)}</Typography>
            <Typography variant="body2" sx={{ color: brand600, fontWeight: 600 }}>{entry?.fork}</Typography>
            <Typography variant="body2" sx={{ color: gray700, fontWeight: 500 }}>to</Typography>
            <Typography variant="body2" sx={{ color: brand600, fontWeight: 600 }}>{entry?.base}</Typography>
            <Chip label={entry?.tag} className="greenChip" variant="outlined" />
            {
              entry.action === 'approve' &&  <Typography variant="body2" sx={{ color: gray700, fontWeight: 500 }}>has been approved</Typography>
            }
            {
              entry.action === 'reject' &&  <Typography variant="body2" sx={{ color: gray700, fontWeight: 500 }}>has been rejected</Typography>
            }
           
          </Box>
        }
        secondary={
          <Box display="flex" alignItems="center" gap={1.5}>
            <Typography sx={{ color: gray600, fontSize: '0.75rem' }}>{entry.date}</Typography>
            <CustomButton sx={visibilityHidden} onClick={(e) => onRequestClick(e, entry)}>
              View request
              <ArrowOutwardIcon />
            </CustomButton>
          </Box>
        }
      />
    </Stack>
  </ListItem>
);

export default ListTermItem;