import React from "react";
import {
    Box,
    ListItem,
    ListItemText,
    ListItemIcon,
    Stack,
    Avatar,
    Typography
} from "@mui/material";
import {
    CreateForkHistoryIcon,
    MergeForkHistoryIcon,
    MergeHistoryIcon,
} from "../../../Icons";
import CustomButton from "../../common/CustomButton";
import RestoreIcon from '@mui/icons-material/Restore';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import { vars } from "../../../theme/variables";

const { gray200, gray600, gray700, brand600 } = vars;

const getText = (entry) => {
    switch (entry.action) {
        case "create":
            return `${entry.author} created a fork:`;
        case "merge":
            return `${entry.author} merged a fork:`;
        case "suggest":
            return `${entry.author} suggested some changes`;
        case "request":
            return `${entry.author} requested to merge`;
        default:
            return `${entry.author} performed an action`;
    }
};

const getIcon = (action) => {
    switch (action) {
        case "create":
            return <CreateForkHistoryIcon />;
        case "merge":
            return <MergeForkHistoryIcon />;
        case "request":
            return <MergeHistoryIcon />;
        default:
            return <div style={{ width: "0.375rem", height: "0.375rem", borderRadius: "0.875rem", border: `1px solid ${gray700}` }} />;
    }
};

const visibilityHidden = {
    display: 'none',
    transition: 'opacity 0.3s ease-in-out'
}

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
            left: entry.action === 'create' ? '-0.125rem' : entry.action === 'suggest' ? '-0.238rem' : '-0.563rem',
            top: entry.action === 'suggest' ? '1.5rem' : '0.375rem'
        }}>
            {getIcon(entry.action)}
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
                        <Typography variant="body2" sx={{ color: gray700, fontWeight: 500 }}>{getText(entry)}</Typography>
                        <Typography variant="body2" sx={{ color: brand600, fontWeight: 600 }}>{entry?.fork}</Typography>
                    </Box>
                }
                secondary={
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Typography sx={{ color: gray600, fontSize: '0.75rem' }}>{entry.date}</Typography>
                        {entry.action === 'request' ? (
                            <CustomButton sx={visibilityHidden}>
                                Go to
                                <ArrowOutwardIcon />
                            </CustomButton>) : (
                            <CustomButton sx={visibilityHidden}>
                                <RestoreIcon />
                                Restore version
                            </CustomButton>)}
                    </Box>
                }
            />
        </Stack>
    </ListItem>
);

export default HistoryItem;