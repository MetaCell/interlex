import PropTypes from "prop-types";
import AddIcon from '@mui/icons-material/Add';
import Checkbox from "../common/CustomCheckbox";
import StatusDialog from "../common/StatusDialog";
import CustomFormField from "../common/CustomFormField";
import { Stack, Button, Grid, Box } from "@mui/material";
import CustomizedDialog from "../common/CustomizedDialog";
import ImportFileTab from "./../TermEditor/ImportFileTab";
import BasicTabs from "../common/CustomTabs";
import { useState, useCallback } from "react";
import { createNewOntology, getNewTokenApi, retrieveTokenApi } from "../../api/endpoints/apiService";
import { GlobalDataContext } from "../../contexts/DataContext";
import { useContext } from "react";

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

HeaderRightSideContent.propTypes = {
    handleClose: PropTypes.func,
    onAddNewOntology: PropTypes.func
}

const AddNewOntologyDialog = ({ open, handleClose, onOntologyAdded }) => {
    const [openStatusDialog, setOpenStatusDialog] = useState(false);
    const [newOntology, setNewOntology] = useState({
        title: "",
        description: ""
    });
    const [newOntologyResponse, setNewOntologyResponse] = useState({
        title: "",
        description: "",
        created: false,
        message: "Your ontology “Nervous system” has been added. Click 'Go to Ontology' to go see the result, or add a new ontology."
    });
    const [files, setFiles] = useState([]);
    const [url, setUrl] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const { user } = useContext(GlobalDataContext);

    const handleSubmit = async () => {
        const groupname = user?.groupname

        const retrieved_tokens = await retrieveTokenApi({ groupname })
        let token = null;
        if (retrieved_tokens?.length > 0) {
            token = retrieved_tokens?.[retrieved_tokens?.length - 1]?.key;
        }

        if (token === undefined || token === null) {
            const newToken = await getNewTokenApi({ groupname });
            token = newToken?.key;
        }
        const ontologyName = newOntology?.title.replace(/\s+/g, '_') + "_" + Math.random().toString(36).substring(2, 10);
        const title = newOntology?.title;
        const subjects = files?.[0]?.data?.subjects;

        const result = await createNewOntology({
            groupname,
            token,
            ontologyName,
            title,
            subjects,
        });

        let ontologyResponseMessage = "Ontology created successfully!"
        
        if (result.created) {
            if (result.jsonldAvailable === false) {
                ontologyResponseMessage += " Note: Ontology viewing is currently disabled as the backend implementation is not yet available."
            }
        } else {
            ontologyResponseMessage = "Failed to create ontology"
            console.error('❌ Failed to create ontology:', result.error);
        }

        setOpenStatusDialog(true);
        setNewOntologyResponse({ title: newOntology?.title, description: ontologyResponseMessage, message: ontologyResponseMessage, created: result.created });
        
        // If ontology was created successfully, trigger refresh
        if (result.created && onOntologyAdded) {
            onOntologyAdded();
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
        setOpenStatusDialog(false)
    }

    const handleFinishButtonClick = () => {
        handleClose();
        setOpenStatusDialog(false);
    }

    const handleChangeUrl = useCallback((event) => {
        setUrl(event.target.value);
    }, []);

    const handleFilesSelected = useCallback((newFiles) => {
        // Process each file to extract data
        const processFiles = async () => {
            const processedFiles = await Promise.all(
                newFiles.map(async (file) => {
                    const fileWithId = {
                        ...file,
                        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2)}`,
                        progress: 100, // Assume upload is complete
                        data: null
                    };

                    // Only process JSON and JSON-LD files
                    if (file.name.endsWith('.json') || file.name.endsWith('.jsonld')) {
                        try {
                            // TODO: TEMPORARY TEST - File reading commented out for testing
                            // const text = await new Promise((resolve, reject) => {
                            //     const reader = new FileReader();
                            //     reader.onload = (e) => resolve(e.target.result);
                            //     reader.onerror = reject;
                            //     reader.readAsText(file);
                            // });

                            // const jsonData = JSON.parse(text); // Commented out for testing
                            
                            // Extract subjects from JSON-LD or JSON structure
                            let subjects = [];
                            
                            // TODO: TEMPORARY TEST - Using hardcoded subjects for testing
                            subjects = [
                                'http://uri.interlex.org/base/ilx_0101431',
                                'http://uri.interlex.org/base/ilx_0101432'
                            ];
                            
                            // ORIGINAL LOGIC (commented out for testing):
                            // // Handle JSON-LD format
                            // if (jsonData['@graph'] && Array.isArray(jsonData['@graph'])) {
                            //     // Extract subjects from @graph array
                            //     subjects = jsonData['@graph']
                            //         .filter(item => item['@type'])
                            //         .map(item => item['@type'])
                            //         .flat()
                            //         .filter((subject, index, array) => array.indexOf(subject) === index); // Remove duplicates
                            // }
                            // // Handle simple JSON format
                            // else if (jsonData.subjects && Array.isArray(jsonData.subjects)) {
                            //     subjects = jsonData.subjects;
                            // }
                            // // Try to extract from other common structures
                            // else if (jsonData.data && jsonData.data.subjects) {
                            //     subjects = jsonData.data.subjects;
                            // }

                            fileWithId.data = { subjects };
                        } catch (error) {
                            console.error('Error processing file:', file.name, error);
                            fileWithId.data = { subjects: [] };
                        }
                    }

                    return fileWithId;
                })
            );

            // Add processed files to existing files
            setFiles(prevFiles => [...prevFiles, ...processedFiles]);
        };

        processFiles();
    }, []);    const handleChangeTabs = useCallback((_, newValue) => setTabValue(newValue), []);

    const handleFileDelete = useCallback((index) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    }, []);

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
                <Box display="flex" height={1}>
                    <Box sx={{ px: '3.25rem', pt: '1.75rem', pb: '2.5rem', flex: 1, overflowY: 'auto' }}>
                        <BasicTabs tabValue={tabValue} handleChange={handleChangeTabs} tabs={["Manually", "Import"]} />
                        {tabValue === 0 && (
                            <Grid container spacing={5.5} sx={{ marginTop: 0 }}>
                                <Grid item xs={12} lg={12}>
                                    <Stack direction="column" mb={1}>
                                        <CustomFormField
                                            name="title"
                                            value={newOntology.title}
                                            onChange={handleNewOntologyChange}
                                            label="Ontology title"
                                            isRequired
                                            placeholder={"Type your Ontology title"}
                                            isEndAdornmentVisible
                                            textFontSize="body1"
                                        />
                                    </Stack>
                                    <Checkbox label="Set as active ontology" />
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
                        {tabValue === 1 && <ImportFileTab files={files} url={url} onFilesChange={handleFilesSelected} onChangeUrl={handleChangeUrl} onFileDelete={handleFileDelete} />}
                    </Box>
                </Box>
            </CustomizedDialog>
            <StatusDialog
                title={newOntologyResponse?.title}
                message={newOntologyResponse?.description}
                subMessage={newOntologyResponse?.message}
                addButtonTitle={"Add a new ontology"}
                finishButtonTitle={"Go to ontology"}
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
    onOntologyAdded: PropTypes.func
}

export default AddNewOntologyDialog;
