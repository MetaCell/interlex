import * as React from "react";
import { useContext } from "react";
import { debounce } from 'lodash';
import PropTypes from "prop-types";
import CustomFormField from "../common/CustomFormField";
import CustomSelectBox from "../common/CustomSelectBox";
import { useState, useEffect, useCallback } from "react";
import CustomizedDialog from "../common/CustomizedDialog";
import ForkRightIcon from '@mui/icons-material/ForkRight';
import CustomAutocompleteBox from "../common/CustomAutocompleteBox";
import { Stack, Button, Grid, Box, Typography } from "@mui/material";
import { GlobalDataContext } from "../../contexts/DataContext";
import * as mockApi from "../../api/endpoints/swaggerMockMissingEndpoints";
import { useOrganizations } from "../../helpers/useOrganizations";

import { vars } from "../../theme/variables";
const { gray800, gray500, gray600 } = vars;

const useMockApi = () => mockApi;

const HeaderRightSideContent = ({ handleClose, onCreateFork }) => {
    return (
        <Box display='flex' alignItems='center' gap={1.5}>
            <Button sx={{ p: '0.625rem 0.875rem', minWidth: '0.0625rem' }} variant="outlined" onClick={handleClose}>Cancel</Button>
            {/*Create fork button temporarily disabled. Can be changed */}
            <Button sx={{ p: '0.625rem 0.875rem', minWidth: '0.0625rem' }} variant='contained' onClick={onCreateFork} disabled>
                <ForkRightIcon />
                Create fork
            </Button>
        </Box>
    )
}

HeaderRightSideContent.propTypes = {
    handleClose: PropTypes.func.isRequired,
    onCreateFork: PropTypes.func.isRequired
};

const CreateForkDialog = ({ open, handleClose, onSubmit }) => {
    const { getMatchTerms } = useMockApi();
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(true);
    const [termResults] = useState([]);
    const [newFork, setNewFork] = React.useState({
        term: null,
        owner: "",
        name: ""
    });
    const { user } = useContext(GlobalDataContext);
    const groupname = user?.groupname || "base";
    const {
        organizations,
    } = useOrganizations(groupname);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchTerms = useCallback(
        debounce(() => {
            setLoading(true);

        }, 300),
        [getMatchTerms]
    );

    const handleCreateFork = () => {
        onSubmit(newFork);
    };

    const handleOwnerChange = (event) => {
        setNewFork({ ...newFork, owner: event.target.value });
    };

    const handleTermChange = (term) => {
        setNewFork({ ...newFork, term });
    };

    const handleNameChange = (event) => {
        setNewFork({ ...newFork, name: event.target.value });
    };

    useEffect(() => {
        fetchTerms(newFork.term);
        return () => {
            fetchTerms.cancel();
        };
    }, [newFork.term, fetchTerms]);

    useEffect(() => {
        setLoading(true)
    }, []);


    return (
        <CustomizedDialog
            title='Create a fork'
            open={open}
            handleClose={handleClose}
            HeaderRightSideContent={
                <HeaderRightSideContent
                    handleClose={handleClose}
                    onCreateFork={handleCreateFork}
                />
            }
        >
            <Grid container spacing={8} flexDirection="column">
                <Grid item xs={12} lg={6}>
                    <Typography variant="h6" sx={{ color: gray800, marginBottom: "2rem" }}>Add a fork</Typography>
                    <Stack direction="column" mb={1}>
                        <CustomAutocompleteBox
                            label="Select term"
                            placeholder="Search for a term to add"
                            isEndAdornmentVisible={true}
                            value={newFork.term}
                            helperText="Type what term you’d like to add, then select the term in the dropdown or hit enter."
                            onChange={handleTermChange}
                            options={termResults}
                        />
                    </Stack>
                </Grid>
                <Grid item xs={12} lg={6}>
                    <Typography variant="h6" sx={{ color: gray800, marginBottom: "2rem" }}>To the organization</Typography>
                    <Box display="flex" alignItems="flex-end" justifyContent="space-between">
                        <Stack direction="column">
                            <CustomSelectBox
                                value={newFork.owner}
                                onChange={handleOwnerChange}
                                options={organizations}
                                sx={{ minWidth: "15.5rem" }}
                                placeholder="Select fork owner"
                            />
                        </Stack>
                        <Typography sx={{ color: gray500, fontSize: "1.875rem" }}>/</Typography>
                        <Stack direction="column">
                            <CustomFormField
                                name="name"
                                label="Fork name"
                                placeholder="Type a value"
                                isRequired={true}
                                isEndAdornmentVisible={true}
                                value={newFork.name}
                                onChange={handleNameChange}
                            />
                        </Stack>
                    </Box>
                    <Typography sx={{ color: gray600, marginTop: "2.75rem" }}>
                        By default, the fork name is the same as the curated. It’s possible to personalise it.
                    </Typography>
                </Grid>
            </Grid>
        </CustomizedDialog>
    )
}

CreateForkDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired
};

export default CreateForkDialog;
