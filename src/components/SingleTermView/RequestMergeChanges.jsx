import React from "react";
import { useState, useEffect, useCallback } from "react";
import { Box, Button } from "@mui/material";
import CustomizedDialog from "../common/CustomizedDialog";
import MergePanel from "./MergePanel/MergePanel";
import StatusDialog from "../common/StatusDialog";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { EditNoteIcon } from "../../Icons";
import { getMatchTerms } from "../../api/endpoints";
import { getVariant } from "../../api/endpoints/swaggerMockMissingEndpoints";
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
                    setData(data?.results?.[0]);
                    setLoading(false);
                });
                getVariant("base", "ILX_....").then(data => { 
                    setModifiedData(data);
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
                sx={{ '& .MuiDialogContent-root': { padding: 0, overflowY: "hidden" } }}
            >
                <Box display="flex" width={1} height={1}>
                    <MergePanel data={data} compareData={modifiedData} status="delete" />
                    <MergePanel data={modifiedData} compareData={data} status="add" />
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