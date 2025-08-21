import PropTypes from "prop-types";
import {
    Box,
    ListItem,
    ListItemText,
    ListItemIcon,
    Stack,
    Typography,
    Tooltip
} from "@mui/material";
import { CreateForkHistoryIcon } from "../../../Icons";
// import CustomButton from "../../common/CustomButton";
// import RestoreIcon from '@mui/icons-material/Restore';
import { vars } from "../../../theme/variables";

const { gray200, gray600, gray700, brand600 } = vars;

const formatDate = (dateString, includeDayAndTime = false) => {
    const fixedDateString = dateString.replace(',', '.');
    try {
        const date = new Date(fixedDateString);
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const month = months[date.getUTCMonth()];
        const day = date.getUTCDate();
        const year = date.getUTCFullYear();

        if (!includeDayAndTime) {
            return `${month} ${day}, ${year}`;
        }

        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const weekday = weekdays[date.getUTCDay()];

        let hours = date.getUTCHours();
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');

        return `${month} ${day}, ${year} ${weekday} ${hours}:${minutes}${ampm}`;

    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return dateString.split('T')[0];
    }
};

// const visibilityHidden = {
//     display: 'none',
//     transition: 'opacity 0.3s ease-in-out'
// }

const HistoryItem = ({ entry }) => (
    <ListItem sx={{
        display: 'flex',
        alignItems: 'start',
        pt: '0.375rem',
        pb: 0,
        pl: '1.75rem',
        pr: '0.375rem',
        borderLeft: `0.125rem solid ${gray200}`,
        minHeight: '4.375rem',
        position: 'relative',
    }}>
        <ListItemIcon sx={{
            position: 'absolute',
            left: '-0.125rem',
            top: '0.375rem'
        }}>
            <CreateForkHistoryIcon />
        </ListItemIcon>
        <Stack direction="row" width={1} alignItems="center" height={40}>
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
                    <Box component="span" display="flex" alignItems="center" gap={0.5}>
                        <Typography variant="body2" component="span" sx={{ color: gray700, fontWeight: 500 }}>
                            A fork of this instance has been created:
                        </Typography>
                        <Typography variant="body2" component="span" sx={{ color: brand600, fontWeight: 600 }}>
                            {entry.fork}
                        </Typography>
                    </Box>
                }
                secondary={
                    <Box component="span" display="flex" alignItems="center" gap={1.5}>
                        <Tooltip title={formatDate(entry.date, true)}>
                            <Typography component="span" sx={{ color: gray600, fontSize: '0.75rem', cursor: 'default' }}>
                                {formatDate(entry.date)}
                            </Typography>
                        </Tooltip>
                        {/* <CustomButton sx={visibilityHidden}>
                            <RestoreIcon />
                            Restore version
                        </CustomButton> */}
                    </Box>
                }
            />
        </Stack>
    </ListItem>
);

HistoryItem.propTypes = {
    entry: PropTypes.object.isRequired
};

export default HistoryItem;