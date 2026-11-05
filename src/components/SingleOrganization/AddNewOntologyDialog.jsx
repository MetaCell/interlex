import PropTypes from "prop-types";
import AddIcon from '@mui/icons-material/Add';
import Checkbox from "../common/CustomCheckbox";
import StatusDialog from "../common/StatusDialog";
import CustomFormField from "../common/CustomFormField";
import { Stack, Button, Grid, Box, TextField, InputAdornment, Typography } from "@mui/material";
import CustomizedDialog from "../common/CustomizedDialog";
import BasicTabs from "../common/CustomTabs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNewOntology, getOntologyTerms } from "../../api/endpoints/apiService";
import { ontologyEntry, ontologyPath, SPECIFICATION_TAB } from "../CellCards/config/gridConfig";
import { API_CONFIG } from "../../config";
import { GlobalDataContext } from "../../contexts/DataContext";
import { useContext } from "react";

const MANUAL_TAB = 0;

const HeaderRightSideContent = ({ handleClose, onAddNewOntology, disabled, ready }) => {
    return (
        <Box display='flex' alignItems='center' gap={1.5}>
            <Button sx={{ p: '0.625rem 0.875rem', minWidth: '0.0625rem' }} variant="outlined" onClick={handleClose}>Cancel</Button>
            <Button sx={{ p: '0.625rem 0.875rem', minWidth: '0.0625rem' }} variant='contained' onClick={onAddNewOntology} disabled={disabled}>
                {!ready && <AddIcon />}
                {ready ? "Create ontology" : "Add a new ontology"}
            </Button>
        </Box>
    )
}

HeaderRightSideContent.propTypes = {
    handleClose: PropTypes.func,
    onAddNewOntology: PropTypes.func,
    disabled: PropTypes.bool,
    ready: PropTypes.bool
}

const AddNewOntologyDialog = ({ open, handleClose, onOntologyAdded, organizationName }) => {
    const [openStatusDialog, setOpenStatusDialog] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newOntology, setNewOntology] = useState({
        uri: "",
        title: "",
        description: ""
    });
    const [newOntologyResponse, setNewOntologyResponse] = useState({
        title: "",
        description: "",
        created: false,
        message: "Your ontology “Nervous system” has been added. Click 'Go to Ontology' to go see the result, or add a new ontology."
    });
    const [setAsActive, setSetAsActive] = useState(false);
    const { user, refreshOntologies, setOntologyData } = useContext(GlobalDataContext);
    const navigate = useNavigate();

    // group used both for the POST endpoint and the immutable URI prefix shown to the user
    const groupForUri = organizationName || user?.groupname || "base";
    const uriPrefix = `${API_CONFIG.INTERLEX_URL}/${groupForUri}/ontologies/uris/`;

    const resetComponentState = () => {
        setNewOntology({
            uri: "",
            title: "",
            description: ""
        });
        setSetAsActive(false);
        setOpenStatusDialog(false);
        setNewOntologyResponse({
            title: "",
            description: "",
            created: false,
            message: "Your ontology has been added. Click 'Go to Ontology' to go see the result, or add a new ontology."
        });
    };

    const handleDialogClose = () => {
        resetComponentState();
        handleClose();
    };

    const handleSubmit = async () => {
        // Guard against a second submission while the first request is in flight
        // (prevents the duplicate POST seen after the backend returns a 303).
        if (submitting) return;

        const groupname = groupForUri;

        // The URI suffix typed by the user IS the ontology name - no mangling / random suffix.
        const ontologyName = newOntology.uri.trim();
        if (!ontologyName) return;

        const title = newOntology.title.trim() || ontologyName;

        setSubmitting(true);
        try {
            const result = await createNewOntology({
                groupname,
                ontologyName,
                title,
            });

            if (!result.created) {
                const failureMessage = "Failed to create ontology";
                console.error('❌ Failed to create ontology:', result.error);
                setOpenStatusDialog(true);
                setNewOntologyResponse({ title: ontologyName, description: failureMessage, message: failureMessage, created: false });
                return;
            }

            refreshOntologies();

            // Honor the "Set as active ontology" checkbox: push the freshly
            // created ontology into global context so the active-ontology
            // selector reflects it. The object shape mirrors the transformed
            // ontologies produced in OntologySearch (label/badge/id/description/url).
            if (setAsActive) {
                const ontologyUri = `${API_CONFIG.INTERLEX_URL}/${groupname}/ontologies/uris/${ontologyName}/spec`;
                const activeOntology = {
                    label: title,
                    badge: groupname,
                    selected: true,
                    id: result.newOntologyID || ontologyUri,
                    description: ontologyUri,
                    url: result.location,
                };
                setOntologyData(activeOntology);
                // Enrich with member terms once fetched, same as OntologySearch.onSetActive.
                getOntologyTerms(ontologyUri)
                    .then((terms) => setOntologyData({ ...activeOntology, terms }))
                    .catch(() => setOntologyData({ ...activeOntology, terms: [] }));
            }

            if (onOntologyAdded) {
                onOntologyAdded();
            }

            // A new ontology is empty, so its header is the only thing there is to look at.
            handleDialogClose();
            navigate(ontologyPath(ontologyEntry(groupname, ontologyName), SPECIFICATION_TAB));
        } finally {
            setSubmitting(false);
        }
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
    };

    const handleCloseStatusDialog = () => {
        setOpenStatusDialog(false);
        resetComponentState();
        handleClose();
    }

    const handleFinishButtonClick = () => {
        resetComponentState();
        handleClose();
    }

    return (
        <>
            <CustomizedDialog
                title='Add a new ontology'
                open={open}
                handleClose={handleDialogClose}
                HeaderRightSideContent={
                    <HeaderRightSideContent
                        handleClose={handleDialogClose}
                        onAddNewOntology={handleAddNewOntology}
                        disabled={submitting || !newOntology.uri.trim()}
                        ready={!!newOntology.uri.trim()}
                    />
                }
            >
                <Box display="flex" height={1}>
                    <Box sx={{ px: '3.25rem', pt: '1.75rem', pb: '2.5rem', flex: 1, overflowY: 'auto' }}>
                        {/* Importing a file is a separate backend process that does not exist yet (sprint 28 Oct). */}
                        <BasicTabs tabValue={MANUAL_TAB} handleChange={() => {}} tabs={["Manually", { label: "Import", disabled: true }]} />
                        {(
                            <Grid container spacing={5.5} sx={{ marginTop: 0 }}>
                                <Grid item xs={12} lg={12}>
                                    <Stack direction="column" mb={1}>
                                        <Typography variant="body1" sx={{ fontWeight: 500, mb: '0.375rem' }}>
                                            Ontology uri
                                        </Typography>
                                        <TextField
                                            name="uri"
                                            value={newOntology.uri}
                                            onChange={handleNewOntologyChange}
                                            placeholder="my-ontology"
                                            fullWidth
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                                                            {uriPrefix}
                                                        </Typography>
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                    </Stack>
                                    <Checkbox
                                        label="Set as active ontology"
                                        name="setAsActive"
                                        checked={setAsActive}
                                        onChange={(e) => setSetAsActive(e.target.checked)}
                                    />
                                </Grid>
                                <Grid item xs={12} lg={12}>
                                    <CustomFormField
                                        name="title"
                                        value={newOntology.title}
                                        onChange={handleNewOntologyChange}
                                        label="Title"
                                        placeholder={"Human-readable title for this ontology"}
                                        textFontSize="body1"
                                    />
                                </Grid>
                                <Grid item xs={12} lg={12}>
                                    <CustomFormField
                                        name="description"
                                        value={newOntology.description}
                                        onChange={handleNewOntologyChange}
                                        label="Description"
                                        placeholder={"Write a description of your ontology"}
                                        multiline
                                        rows={4}
                                        textFontSize="body1"
                                    />
                                </Grid>
                            </Grid>
                        )}
                    </Box>
                </Box>
            </CustomizedDialog>
            <StatusDialog
                title={newOntologyResponse?.title}
                message={newOntologyResponse?.description}
                subMessage={newOntologyResponse?.message}
                addButtonTitle={"Add a new ontology"}
                finishButtonTitle={"Close"}
                open={openStatusDialog}
                handleClose={handleCloseStatusDialog}
                handleCloseandAdd={handleFinishButtonClick}
                errored={!newOntologyResponse.created}
            />
        </>
    )
}

AddNewOntologyDialog.propTypes = {
    open: PropTypes.bool,
    handleClose: PropTypes.func,
    onOntologyAdded: PropTypes.func,
    organizationName: PropTypes.string
}

export default AddNewOntologyDialog;
