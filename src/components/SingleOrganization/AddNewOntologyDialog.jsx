import * as React from "react";
import { Stack, Button, Grid, Box } from "@mui/material";
import CustomizedDialog from "../common/CustomizedDialog";
import CustomInputBox from "../common/CustomInputBox";
import StatusDialog from "../common/StatusDialog";
import Checkbox from "../common/CustomCheckbox";
import AddIcon from '@mui/icons-material/Add';

const HeaderRightSideContent = ({ handleClose, onAddNewOntology }) => {
    return (
        <Box display='flex' alignItems='center' gap={1.5}>
            <Button sx={{ p: '0.625rem 0.875rem', minWidth: '0.0625rem' }} variant="outlined" onClick={handleClose}>Cancel</Button>
            <Button sx={{ p: '0.625rem 0.875rem', minWidth: '0.0625rem' }} variant='contained' onClick={onAddNewOntology}>
                <AddIcon />
                Add a new ontology
            </Button>
        </Box>
    )
}

const AddNewOntologyDialog = ({ open, handleClose }) => {
    const [openStatusDialog, setOpenStatusDialog] = React.useState(false);
    const [newOntology, setNewOntology] = React.useState({
        title: "",
        description: ""
    });

    const handleSubmit = () => {
        console.log("Submit new ontology data!");
    }

    const handleNewOntologyChange = (e) => {
        const { name, value } = e.target;
        setNewOntology(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleAddNewOntology = () => {
        handleSubmit();
        setOpenStatusDialog(true);
        setNewOntology({ title: "", description: "" })
    };

    const handleCloseStatusDialog = () => {
        setOpenStatusDialog(false)
    }

    const handleFinishButtonClick = () => {
        handleClose();
        setOpenStatusDialog(false);
        setNewOntology({ title: "", description: "" })
    }

    return (
        <>
            <CustomizedDialog
                title='Add a new ontology'
                open={open}
                handleClose={handleClose}
                HeaderRightSideContent={
                    <HeaderRightSideContent
                        handleClose={handleClose}
                        onAddNewOntology={handleAddNewOntology}
                    />
                }
            >
                <Grid container spacing={5.5}>
                    <Grid item xs={12} lg={12}>
                        <Stack direction="column" mb={1}>
                            <CustomInputBox
                                id="ontology-title-field"
                                name="title"
                                value={newOntology.title}
                                onInputChange={handleNewOntologyChange}
                                label="Ontology title"
                                isRequired
                                placeholder={"Type your Ontology title"}
                                isEndAdornmentVisible
                            />
                        </Stack>
                        <Checkbox label="Set as active ontology" />
                    </Grid>
                    <Grid item xs={12} lg={12}>
                        <CustomInputBox
                            id="ontology-description-field"
                            name="description"
                            value={newOntology.description}
                            onInputChange={handleNewOntologyChange}
                            label="Description"
                            placeholder={"Write a description of your ontology"}
                            multiline
                            rows={4}
                        />
                    </Grid>
                </Grid>
            </CustomizedDialog>
            <StatusDialog
                title={"Add a new ontology"}
                message={"Ontology successfully created"}
                subMessage={"Your ontology “Nervous system” has been added. Click finish to go see the result, or add a new ontology."}
                addButtonTitle={"Add a new ontology"}
                finishButtonTitle={"Go to ontology"}
                open={openStatusDialog}
                handleClose={handleCloseStatusDialog}
                handleCloseandAdd={handleFinishButtonClick}
            />
        </>
    )
}
export default AddNewOntologyDialog;