import PropTypes from "prop-types";
import AddIcon from '@mui/icons-material/Add';
import Checkbox from "../common/CustomCheckbox";
import StatusDialog from "../common/StatusDialog";
import CustomFormField from "../common/CustomFormField";
import { Stack, Button, Grid, Box, TextField, InputAdornment, Typography } from "@mui/material";
import CustomizedDialog from "../common/CustomizedDialog";
import ImportFileTab from "./../TermEditor/ImportFileTab";
import BasicTabs from "../common/CustomTabs";
import { useState, useCallback } from "react";
import { createNewOntology } from "../../api/endpoints/apiService";
import { API_CONFIG } from "../../config";
import { GlobalDataContext } from "../../contexts/DataContext";
import { useContext } from "react";

const HeaderRightSideContent = ({ handleClose, onAddNewOntology, disabled }) => {
    return (
        <Box display='flex' alignItems='center' gap={1.5}>
            <Button sx={{ p: '0.625rem 0.875rem', minWidth: '0.0625rem' }} variant="outlined" onClick={handleClose}>Cancel</Button>
            <Button sx={{ p: '0.625rem 0.875rem', minWidth: '0.0625rem' }} variant='contained' onClick={onAddNewOntology} disabled={disabled}>
                <AddIcon />
                Add a new ontology
            </Button>
        </Box>
    )
}

HeaderRightSideContent.propTypes = {
    handleClose: PropTypes.func,
    onAddNewOntology: PropTypes.func,
    disabled: PropTypes.bool
}

const AddNewOntologyDialog = ({ open, handleClose, onOntologyAdded, organizationName }) => {
    const [openStatusDialog, setOpenStatusDialog] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newOntology, setNewOntology] = useState({
        uri: "",
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

    // group used both for the POST endpoint and the immutable URI prefix shown to the user
    const groupForUri = organizationName || user?.groupname || "base";
    const uriPrefix = `${API_CONFIG.INTERLEX_URL}/${groupForUri}/ontologies/uris/`;

    const resetComponentState = () => {
        setNewOntology({
            uri: "",
            description: ""
        });
        setFiles([]);
        setUrl('');
        setTabValue(0);
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
        const ontologyName = (newOntology?.uri || files?.[0]?.data?.title || "").trim();
        if (!ontologyName) return;

        const title = ontologyName;
        const subjects = files?.[0]?.data?.subjects;

        setSubmitting(true);
        try {
            const result = await createNewOntology({
                groupname,
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
            setNewOntologyResponse({ title: ontologyName, description: ontologyResponseMessage, message: ontologyResponseMessage, created: result.created });

            // If ontology was created successfully, trigger refresh
            if (result.created && onOntologyAdded) {
                onOntologyAdded();
            }
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
                        name: file.name, // Explicitly preserve name
                        size: file.size, // Explicitly preserve size  
                        type: file.type, // Explicitly preserve type
                        progress: 100, // Assume upload is complete
                        data: null
                    };

                    // Process JSON, JSON-LD, CSV, and TTL files
                    if (file.name.endsWith('.json') || file.name.endsWith('.jsonld') || file.name.endsWith('.csv') || file.name.endsWith('.ttl')) {
                        try {
                            const text = await new Promise((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onload = (e) => resolve(e.target.result);
                                reader.onerror = reject;
                                reader.readAsText(file);
                            });

                            let subjects = [];
                            let title = '';

                            if (file.name.endsWith('.csv')) {
                                // Handle CSV format
                                const lines = text.split('\n').filter(line => line.trim());
                                if (lines.length > 0) {
                                    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                                    
                                    // Look for title in first line if it's not headers
                                    if (!headers.includes('subject') && !headers.includes('subjects')) {
                                        title = lines[0].split(',')[0]?.trim() || '';
                                        // Extract subjects from remaining lines
                                        subjects = lines.slice(1)
                                            .map(line => line.split(',')[0]?.trim())
                                            .filter(Boolean);
                                    } else {
                                        // Extract data based on headers
                                        const titleIndex = headers.findIndex(h => h.includes('title') || h.includes('name'));
                                        const subjectIndex = headers.findIndex(h => h.includes('subject'));
                                        
                                        lines.slice(1).forEach(line => {
                                            const values = line.split(',').map(v => v.trim());
                                            if (titleIndex >= 0 && !title && values[titleIndex]) {
                                                title = values[titleIndex];
                                            }
                                            if (subjectIndex >= 0 && values[subjectIndex]) {
                                                subjects.push(values[subjectIndex]);
                                            }
                                        });
                                    }
                                }
                            } else if (file.name.endsWith('.ttl')) {
                                // Handle TTL (Turtle) format
                                const lines = text.split('\n').filter(line => line.trim());
                                
                                // Extract title from comments or @base/@prefix declarations
                                for (const line of lines) {
                                    const trimmedLine = line.trim();
                                    
                                    // Look for title in comments
                                    if (trimmedLine.startsWith('#') && 
                                        (trimmedLine.toLowerCase().includes('title:') || 
                                         trimmedLine.toLowerCase().includes('name:'))) {
                                        const match = trimmedLine.match(/(?:title|name):\s*(.+)/i);
                                        if (match && !title) {
                                            title = match[1].trim();
                                        }
                                    }
                                    
                                    // Look for rdfs:label or dc:title
                                    if (trimmedLine.includes('rdfs:label') || trimmedLine.includes('dc:title')) {
                                        const match = trimmedLine.match(/(?:rdfs:label|dc:title)\s+["']([^"']+)["']/);
                                        if (match && !title) {
                                            title = match[1].trim();
                                        }
                                    }
                                }
                                
                                // Extract subjects from RDF type declarations
                                for (const line of lines) {
                                    const trimmedLine = line.trim();
                                    
                                    // Look for 'a' (rdf:type) declarations
                                    if (trimmedLine.includes(' a ') && !trimmedLine.startsWith('#')) {
                                        const match = trimmedLine.match(/\s+a\s+([^;\s.]+)/);
                                        if (match) {
                                            const subject = match[1].trim();
                                            if (subject && !subjects.includes(subject)) {
                                                subjects.push(subject);
                                            }
                                        }
                                    }
                                    
                                    // Look for rdf:type declarations
                                    if (trimmedLine.includes('rdf:type') && !trimmedLine.startsWith('#')) {
                                        const match = trimmedLine.match(/rdf:type\s+([^;\s.]+)/);
                                        if (match) {
                                            const subject = match[1].trim();
                                            if (subject && !subjects.includes(subject)) {
                                                subjects.push(subject);
                                            }
                                        }
                                    }
                                }
                                
                                // If no title found, try to extract from filename
                                if (!title) {
                                    title = file.name.replace('.ttl', '').replace(/[-_]/g, ' ');
                                }
                            } else {
                                // Handle JSON and JSON-LD formats
                                const jsonData = JSON.parse(text);
                                
                                // Extract title
                                title = jsonData.title || jsonData.name || jsonData['@title'] || 
                                       jsonData.ontology?.title || jsonData.ontology?.name || '';
                                
                                // Handle JSON-LD format
                                if (jsonData['@graph'] && Array.isArray(jsonData['@graph'])) {
                                    // Extract subjects from @graph array
                                    subjects = jsonData['@graph']
                                        .filter(item => item['@type'])
                                        .map(item => item['@type'])
                                        .flat()
                                        .filter((subject, index, array) => array.indexOf(subject) === index); // Remove duplicates
                                    
                                    // Also try to get title from @graph if not found
                                    if (!title) {
                                        const ontologyItem = jsonData['@graph'].find(item => 
                                            item['@type'] === 'owl:Ontology' || 
                                            item['rdfs:label'] || 
                                            item['dc:title']
                                        );
                                        if (ontologyItem) {
                                            title = ontologyItem['rdfs:label'] || ontologyItem['dc:title'] || '';
                                        }
                                    }
                                }
                                // Handle simple JSON format
                                else if (jsonData.subjects && Array.isArray(jsonData.subjects)) {
                                    subjects = jsonData.subjects;
                                }
                                // Try to extract from other common structures
                                else if (jsonData.data && jsonData.data.subjects) {
                                    subjects = jsonData.data.subjects;
                                }
                                // Handle array of objects with @type
                                else if (Array.isArray(jsonData)) {
                                    subjects = jsonData
                                        .filter(item => item['@type'])
                                        .map(item => item['@type'])
                                        .flat()
                                        .filter((subject, index, array) => array.indexOf(subject) === index);
                                }
                            }

                            fileWithId.data = { subjects: subjects || [], title: title || '' };
                        } catch (error) {
                            console.error('Error processing file:', file.name, error);
                            fileWithId.data = { subjects: [], title: '' };
                        }
                    }

                    return fileWithId;
                })
            );

            // Replace any existing files with the new one (single file only)
            setFiles(processedFiles.slice(0, 1)); // Only keep the first file
        };

        processFiles();
    }, []);

    const handleChangeTabs = useCallback((_, newValue) => setTabValue(newValue), []);

    const handleFileDelete = useCallback((index) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    }, []);

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
