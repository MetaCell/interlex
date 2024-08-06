import * as React from "react";
import { Stack, Button, Grid, Box, Typography } from "@mui/material";
import CustomizedDialog from "../common/CustomizedDialog";
import CustomInputBox from "../common/CustomInputBox";
import CustomSelectBox from "../common/CustomSelectBox";
import ForkRightIcon from '@mui/icons-material/ForkRight';
import CustomAutocompleteBox from "../common/CustomAutocompleteBox";
import { vars } from "../../theme/variables";

const { gray800, gray500, gray600 } = vars;

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

const options = [
    { value: "1", label: "SPARC Anatomical Working Group" },
    { value: "2", label: "SPARC" },
    { value: "3", label: "Working Group" }
]

const CreateForkDialog = ({ open, handleClose, onSubmit }) => {
    const [newFork, setNewFork] = React.useState({
        term: null,
        owner: "1",
        name: ""
    });

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
                    <Typography variant="h6" sx={{ color: gray800, fontSize: "1.125rem", fontWeight: 600, marginBottom: "2rem" }}>Add a fork</Typography>
                    <Stack direction="column" mb={1}>
                        <CustomAutocompleteBox
                            label="Select term"
                            placeholder="Search for a term to add"
                            isEndAdornmentVisible={true}
                            value={newFork.term}
                            helperText="Type what term you’d like to add, then select the term in the dropdown or hit enter."
                            onChange={handleTermChange}
                        />
                    </Stack>
                </Grid>
                <Grid item xs={12} lg={6}>
                    <Typography variant="h6" sx={{ color: gray800, fontSize: "1.125rem", fontWeight: 600, marginBottom: "2rem" }}>To the organization</Typography>
                    <Box display="flex" alignItems="flex-end" justifyContent="space-between">
                        <Stack direction="column">
                            <CustomSelectBox
                                value={newFork.owner}
                                onChange={handleOwnerChange}
                                options={options}
                                sx={{ minWidth: "15.5rem" }}
                            />
                        </Stack>
                        <Typography sx={{ color: gray500, fontSize: "1.875rem" }}>/</Typography>
                        <Stack direction="column">
                            <CustomInputBox
                                id="fork-name-field"
                                name="name"
                                label="Fork name"
                                placeholder="Type a value"
                                isRequired={true}
                                isEndAdornmentVisible={true}
                                value={newFork.name}
                                onInputChange={handleNameChange}
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
export default CreateForkDialog;
