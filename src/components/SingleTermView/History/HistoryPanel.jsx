import React from "react";
import { Box, List } from "@mui/material";
import HistoryItem from "./HistoryItem";
import { vars } from "../../../theme/variables";
import * as mockApi from './../../../api/endpoints/swaggerMockMissingEndpoints';
import { versionsParser } from './../../../parsers/versionsParser'

const useMockApi = () => mockApi;

const { gray50 } = vars;

const historyEntries = [
    { author: "Phoenix Baker", action: "merge", date: "Friday 2:05pm", fork: "ForkPB-2" },
    { author: "Phoenix Baker", action: "create", date: "Friday 2:05pm", fork: "ForkPB-2" },
    { author: "Phoenix Baker", action: "suggest", date: "Friday 2:05pm" },
    { author: "Phoenix Baker", action: "request", date: "Friday 2:05pm" },
];

const HistoryPanel = () => {
    const { getVersions } = useMockApi();
  
    const [versions, setVersions] = React.useState([]);
    
    React.useEffect(() => {
        getVersions("base", "ILX_....").then( data => {
            const parsedData = versionsParser(data);
            setVersions(parsedData);
        })
    }, []);

    return <Box p="2.5rem 5rem" sx={{
        overflow: 'auto',
      }}>
        <List disablePadding width={1} sx={{ maxWidth: '50rem' }}>
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
};

export default HistoryPanel;
