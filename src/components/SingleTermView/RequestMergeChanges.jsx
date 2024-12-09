import React from "react";
import { useState, useEffect, useCallback } from "react";
import { Box, Button } from "@mui/material";
import CustomizedDialog from "../common/CustomizedDialog";
import StatusDialog from "../common/StatusDialog";
import MergeChangesPanel from "./MergeChangesPanel";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { EditNoteIcon } from "../../Icons";
import { getMatchTerms } from "../../api/endpoints";
import termMockData from "../../static/modifiedTermMockData.json";
import { debounce } from 'lodash'


const HeaderRightSideContent = ({ handleClose, handleSubmit }) => {
    return (
        <Box display='flex' alignItems='center' gap='.75rem'>
            <Button variant="outlined" onClick={handleClose}>Cancel</Button>
            <Button variant='contained' color='primary' onClick={handleSubmit} startIcon={<EditNoteIcon />}>
                Request to merge changes to curated
            </Button>
        </Box>
    );
};


const RequestMergeChanges = ({ searchTerm, open, handleClose }) => {
    const [data, setData] = useState(null);
    const [modifiedData, setModifiedData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openStatusDialog, setOpenStatusDialog] = useState(false);

    const fetchTerms = useCallback(
        debounce((searchTerm) => {
            if (searchTerm) {
                getMatchTerms(searchTerm).then(data => {
                    setData(data?.results[0]);
                    setModifiedData(termMockData);
                    setLoading(false);
                });
            }
        }, 300),
        []
    );

    const handleOpenStatusDialog = () => {
        setOpenStatusDialog(true)
    }

    const handleCloseStatusDialog = () => {
        setOpenStatusDialog(false)
    }

    useEffect(() => {
        setLoading(true);
        fetchTerms(searchTerm);
        return () => {
            fetchTerms.cancel();
        };
    }, [searchTerm, fetchTerms]);

    return (
        <>
            <CustomizedDialog
                title={"Request to merge changes to curated"}
                open={open}
                handleClose={handleClose}
                HeaderRightSideContent={<HeaderRightSideContent handleClose={handleClose} handleSubmit={handleOpenStatusDialog} />}
                sx={{ '& .MuiDialogContent-root': { padding: 0 } }}
            >
                <Box display="flex">
                    <MergeChangesPanel data={data} comparingData={modifiedData} statusType="delete" />
                    <MergeChangesPanel data={modifiedData} comparingData={data} statusType="add" />
                </Box>
            </CustomizedDialog>
            <StatusDialog
                open={openStatusDialog}
                handleClose={handleCloseStatusDialog}
                title={"Request to merge changes to curated"}
                message={"Request to merge changes successfully sent"}
                subMessage={"Close or go to your fork."}
                finishButtonTitle={"Go to fork"}
                finishButtonEndIcon={<ArrowForwardIcon />}
            />
        </>
    )
}

export default RequestMergeChanges;