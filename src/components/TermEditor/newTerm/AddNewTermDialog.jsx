import { useState, useCallback, useContext, useMemo } from "react";
import PropTypes from "prop-types";
import {
    Box,
    Divider,
    MobileStepper,
    Stack,
    Button,
    FormControlLabel,
    Checkbox,
    CircularProgress
} from "@mui/material";
import CustomButton from '../../common/CustomButton';
import CustomizedDialog from "../../common/CustomizedDialog";
import OntologySearch from '../../SingleTermView/OntologySearch';
import FirstStepContent from "./FirstStepContent";
import SecondStepContent from "./SecondStepContent";
import StatusStep from "../../common/StatusStep";
import { GlobalDataContext } from "../../../contexts/DataContext";
import { createNewEntity } from "../../../api/endpoints/apiService";
import { getAddTermStatusProps } from '../termStatusProps';
import { CheckedIcon, UncheckedIcon } from '../../../Icons';
import { vars } from "../../../theme/variables";
import { DEFAULT_TYPE } from "../../../constants/types";

const { gray100, gray200, gray400, gray600 } = vars;

const HeaderRightSideContent = ({
    activeStep,
    onContinue,
    onClose,
    isCreateButtonDisabled,
    isEditing,
    hasExactMatch,
    hasAnySynonymMatch,
    userGroupname
}) => {
    const [ontologyChecked, setOntologyChecked] = useState(false);

    const handleOntologyChange = (event) => {
        setOntologyChecked(event.target.checked);
    };

    const getButtonText = () => {
        if (isEditing) return 'Edit term';
        if (hasExactMatch || hasAnySynonymMatch) return 'Add to existing';
        return 'Create new';
    };

    if (activeStep === 2) {
        return (
            <Button variant="contained" onClick={onClose}>
                Finish
            </Button>
        );
    }

    return (
        <Box display='flex' alignItems='center'>
            <FormControlLabel
                control={
                    <Checkbox
                        size="small"
                        icon={<UncheckedIcon />}
                        checkedIcon={<CheckedIcon />}
                        checked={ontologyChecked}
                        onChange={handleOntologyChange}
                    />
                }
                sx={{ color: gray600 }}
                label="Add to ontology"
            />
            <OntologySearch disabled={!ontologyChecked} />

            <Divider orientation="vertical" flexItem sx={{ m: '0 1rem' }} />

            <MobileStepper
                variant="dots"
                steps={3}
                position="static"
                activeStep={activeStep}
                sx={{ maxWidth: 64, flexGrow: 1 }}
            />

            <Divider orientation="vertical" flexItem sx={{ m: '0 1rem' }} />

            <Stack direction="row" spacing={1.5}>
                <CustomButton onClick={onClose}>
                    Cancel
                </CustomButton>
                <Button
                    onClick={onContinue}
                    disabled={isCreateButtonDisabled}
                    variant="contained"
                    sx={{
                        padding: '0.625rem 0.875rem',
                        '&.Mui-disabled': {
                            border: `1px solid ${gray200}`,
                            color: gray400,
                            backgroundColor: gray100
                        }
                    }}
                >
                    {getButtonText()}
                </Button>
            </Stack>
        </Box>
    );
};

HeaderRightSideContent.propTypes = {
    activeStep: PropTypes.number.isRequired,
    onContinue: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    isCreateButtonDisabled: PropTypes.bool.isRequired,
    isEditing: PropTypes.bool.isRequired,
    hasExactMatch: PropTypes.bool.isRequired,
    hasAnySynonymMatch: PropTypes.bool.isRequired,
    userGroupname: PropTypes.string
};

const AddNewTermDialog = ({ open, handleClose }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [addTermResponse, setAddTermResponse] = useState(null);
    const [selectedType, setSelectedType] = useState(DEFAULT_TYPE);
    const [termValue, setTermValue] = useState("");
    const [selectedTermValue, setSelectedTermValue] = useState("");
    const [exactSynonyms, setExactSynonyms] = useState([]);
    const [existingIds, setExistingIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasExactMatch, setHasExactMatch] = useState(false);
    const [hasAnySynonymMatch, setHasAnySynonymMatch] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const { user } = useContext(GlobalDataContext);

    const isCreateButtonDisabled = useMemo(() => {
        if (termValue === "") return true;
        if (isEditing && termValue === selectedTermValue) return true;
        return false;
    }, [termValue, isEditing, selectedTermValue]);

    const statusProps = getAddTermStatusProps(addTermResponse, termValue);

    const handleCancelBtnClick = () => {
        handleClose();
        setActiveStep(0);
    };

    const handleTermValueChange = (value) => {
        const isEventObject = value && typeof value === 'object' && 'target' in value;
        const newValue = isEventObject ? value.target.value : value;
        setTermValue(newValue);

        if (isEventObject && isEditing) {
            setIsEditing(newValue !== selectedTermValue);
        } else if (isEventObject) {
            setIsEditing(false);
        }
    };

    const handleTypeChange = (newType) => {
        setSelectedType(newType);
    };

    const handleSynonymChange = (event, newValue) => {
        setExactSynonyms(newValue);
    };

    const handleExistingIdChange = (event, newValue) => {
        setExistingIds(newValue);
    };

    const handleExactMatchChange = useCallback((value) => {
        setHasExactMatch(value);
    }, []);

    const handleTermSelection = (result) => {
        if (result?.label) {
            setSelectedTermValue(result.label);
            handleTermValueChange(result.label);
            setIsEditing(true); // Set editing state when a term is selected from sidebar
        }
    };

    const editTerm = useCallback(() => {
        console.log("Edit term");
    }, []);

    const createNewTerm = useCallback(async () => {
        if (!termValue || !selectedType) return;

        setLoading(true);

        const token = localStorage.getItem("token");
        const groupName = user?.groupname || "base";
        const body = {
            'rdf-type': selectedType || 'owl:Class',
            label: termValue
        };

        try {
            if (hasExactMatch || hasAnySynonymMatch) {
                setActiveStep(1);
                setAddTermResponse(termValue);
            } else {
                const response = await createNewEntity({
                    group: groupName,
                    data: body,
                    session: token
                });

                if (response.term && response.term.id) {
                    setActiveStep(1);
                    setAddTermResponse(response.term.id);
                }
            }
        } catch (error) {
            console.error("Action failed:", error);
        } finally {
            setLoading(false);
        }
    }, [termValue, selectedType, user, hasExactMatch, hasAnySynonymMatch]);

    const handleAction = useCallback(() => {
        if (isEditing) {
            editTerm();
        } else {
            createNewTerm();
        }
    }, [isEditing, editTerm, createNewTerm]);

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%'
            }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <CustomizedDialog
            title={isEditing ? "Edit term" : "Add new term"}
            open={open}
            handleClose={handleClose}
            HeaderRightSideContent={
                <HeaderRightSideContent
                    activeStep={activeStep}
                    onClose={handleCancelBtnClick}
                    onContinue={handleAction}
                    isCreateButtonDisabled={isCreateButtonDisabled}
                    isEditing={isEditing}
                    hasExactMatch={hasExactMatch}
                    hasAnySynonymMatch={hasAnySynonymMatch}
                    userGroupname={user?.groupname}
                />
            }
            sx={{ '& .MuiDialogContent-root': { padding: 0, overflowY: "hidden" } }}
        >
            {activeStep === 0 && (
                <FirstStepContent
                    term={termValue}
                    type={selectedType}
                    hasExactMatch={hasExactMatch}
                    existingIds={existingIds}
                    synonyms={exactSynonyms}
                    isEditing={isEditing}
                    handleTermChange={handleTermValueChange}
                    handleTypeChange={handleTypeChange}
                    handleExactMatchChange={handleExactMatchChange}
                    handleSynonymChange={handleSynonymChange}
                    onAnySynonymMatchChange={setHasAnySynonymMatch}
                    handleExistingIdChange={handleExistingIdChange}
                    onTermSelect={handleTermSelection}
                />
            )}

            {activeStep === 1 && (
                <SecondStepContent searchTerm={addTermResponse} />
            )}

            {activeStep === 2 && addTermResponse != null && (
                <StatusStep statusProps={statusProps} />
            )}
        </CustomizedDialog>
    );
};

AddNewTermDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    searchTerm: PropTypes.string,
    forwardPredicateStep: PropTypes.bool
};

export default AddNewTermDialog;
