import PropTypes from "prop-types";
import AddIcon from '@mui/icons-material/Add';
import Checkbox from "../common/CustomCheckbox";
import StatusDialog from "../common/StatusDialog";
import CustomInputBox from "../common/CustomInputBox";
import { Stack, Button, Grid, Box } from "@mui/material";
import CustomizedDialog from "../common/CustomizedDialog";
import ImportFileTab from "./../TermEditor/ImportFileTab";
import BasicTabs from "../common/CustomTabs";
import { useState } from "react";
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

const AddNewOntologyDialog = ({ open, handleClose }) => {
    const [openStatusDialog, setOpenStatusDialog] = useState(false);
    const [newOntology, setNewOntology] = useState({
        title: "",
        description: ""
    });
    const [newOntologyResponse, setNewOntologyResponse] = useState({
        title: "",
        description: "",
        created : false,
        message : "Your ontology “Nervous system” has been added. Click 'Go to Ontology' to go see the result, or add a new ontology."
    });
    const [files, setFiles] = useState([]);
    const [url, setUrl] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const { user } = useContext(GlobalDataContext);

    const handleSubmit = async() => {
        const groupname = user?.groupname

        const retrieved_tokens = await retrieveTokenApi({groupname})
        let token =  null;
        if ( retrieved_tokens?.length > 0 ){
            token = retrieved_tokens?.[retrieved_tokens?.length - 1]?.key;
        }
        
        if ( token === undefined || token === null) {
            const newToken = await getNewTokenApi({groupname});
            token = newToken?.key;
        }
        const ontologyName = newOntology?.title + "_" + Math.random().toString(36).substring(2, 10);
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
          console.log('Ontology details:', result.data);
      
          if (result.jsonResponse) {
            console.log('Retrieved JSON:', result.jsonResponse);
          }
      
          if (result.htmlAvailable !== undefined) {
            console.log('HTML version available:', result.htmlAvailable);
          }
        } else {
            ontologyResponseMessage = "Failed to create ontology"
            console.error('❌ Failed to create ontology:', result.error);
        }

        setOpenStatusDialog(true);
        setNewOntologyResponse({title : newOntology?.title, description : ontologyResponseMessage, message : ontologyResponseMessage, created : result.created})
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

    const handleChangeUrl = (event) => {
        setUrl(event.target.value);
    }

    const handleFilesSelected = async (newFiles) => {
        const fileArray = Array.from(newFiles);
    
        const readFileContents = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
    
                reader.onload = () => {
                    let content = reader.result;
    
                    // Try parsing JSON if it's a JSON file
                    if (file.name.endsWith('.json')) {
                        try {
                            content = JSON.parse(content);
                        } catch (e) {
                            console.error(`Invalid JSON in file ${file.name}`, e);
                            content = null;
                        }
                    }
    
                    resolve({
                        name: file.name,
                        size: (file.size / 1024).toFixed(2),
                        progress: 100,
                        data: content
                    });
                };
    
                reader.onerror = () => reject(reader.error);
                reader.readAsText(file);
            });
        };
    
        const updatedFiles = await Promise.all(fileArray.map(readFileContents));
    
        setFiles(prevFiles => {
            const prevString = JSON.stringify(prevFiles);
            const newString = JSON.stringify(updatedFiles);
            return prevString !== newString ? updatedFiles : prevFiles;
        });
    };      

    const handleChangeTabs = (_, newValue) => setTabValue(newValue);

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
                )}
                {tabValue === 1 && <ImportFileTab files={files} url={url} onFilesChange={handleFilesSelected} onChangeUrl={handleChangeUrl} />}
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
    handleClose: PropTypes.func
}

export default AddNewOntologyDialog;
