import React from "react";
import { Box, List } from "@mui/material";
import HistoryItem from "./HistoryItem";
import { vars } from "../../../theme/variables";

const { gray50 } = vars;

const historyEntries = [
    { author: "Phoenix Baker", action: "merge", date: "Friday 2:05pm", fork: "ForkPB-2" },
    { author: "Phoenix Baker", action: "create", date: "Friday 2:05pm", fork: "ForkPB-2" },
    { author: "Phoenix Baker", action: "suggest", date: "Friday 2:05pm" },
    { author: "Phoenix Baker", action: "request", date: "Friday 2:05pm" },
];

const HistoryPanel = () => (
    <Box width={1} sx={{ maxWidth: '50rem' }}>
        <List disablePadding>
            {historyEntries.map((entry, index) => (
                <Box key={`${entry.author}_${index}`} sx={{
                    paddingLeft: '1rem',
                    borderRadius: '0.375rem',
                    '&:hover': {
                        backgroundColor: gray50,
                        '& .MuiIconButton-root': {
                            display: 'flex'
                        }
                    }
                }}>
                    <HistoryItem entry={entry} />
                </Box>
            ))}
        </List>
    </Box>
);

export default HistoryPanel;
