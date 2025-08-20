import { useState, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
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

const { gray100, gray200, gray400, gray600 } = vars;

const HeaderRightSideContent = ({
    activeStep,
    onContinue,
    onClose,
    isCreateButtonDisabled
}) => {
    const [ontologyChecked, setOntologyChecked] = useState(false);

    const handleOntologyChange = (event) => {
        setOntologyChecked(event.target.checked);
    };

    return (
        <Box display='flex' alignItems='center'>
            {activeStep !== 2 ? (
                <>
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
                        <CustomButton onClick={onClose}>Cancel</CustomButton>
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
                            Create new
                        </Button>
                    </Stack>
                </>
            ) : (
                <Button variant="contained" onClick={onClose}>Finish</Button>
            )}
        </Box>
    )
};

HeaderRightSideContent.propTypes = {
    activeStep: PropTypes.number.isRequired,
    onContinue: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    isCreateButtonDisabled: PropTypes.bool.isRequired
};

const AddNewTermDialog = ({ open, handleClose, searchTerm }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [addTermResponse, setAddTermResponse] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [termValue, setTermValue] = useState("");
    const [exactSynonyms, setExactSynonyms] = useState([]);
    const [existingIds, setExistingIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasExactMatch, setHasExactMatch] = useState(false);
    const { user } = useContext(GlobalDataContext);
    const navigate = useNavigate();

    const isCreateButtonDisabled = hasExactMatch || termValue === "";
    const statusProps = getAddTermStatusProps(addTermResponse, termValue);

    const handleCancelBtnClick = () => {
        handleClose();
        setActiveStep(0);
    };

    const handleTermValueChange = (event) => {
        const value = event.target.value;
        setTermValue(value);
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

    const createNewTerm = useCallback(async () => {
        if (!termValue || !selectedType || hasExactMatch) return;

        setLoading(true);

        const token = localStorage.getItem("token");
        const groupName = user?.groupname || "base";
        const body = {
            'rdf-type': selectedType || 'owl:Class',
            label: termValue,
            exact: exactSynonyms,
            existingIds: existingIds
        };

        try {
            const response = await createNewEntity({
                group: groupName,
                data: body,
                session: token
            });
            navigate(`/terms/${response.term.id.split("/").pop()}`);
        } catch (error) {
            console.error("Creation failed:", error);
        } finally {
            setLoading(false);
        }
    }, [termValue, selectedType, exactSynonyms, existingIds, user, hasExactMatch, navigate]);

    if (loading) {
        return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <CircularProgress />
        </Box>
    }

    return (
        <CustomizedDialog
            title="Add new term"
            open={open}
            handleClose={handleClose}
            HeaderRightSideContent={
                <HeaderRightSideContent
                    activeStep={activeStep}
                    onClose={handleCancelBtnClick}
                    onContinue={createNewTerm}
                    isCreateButtonDisabled={isCreateButtonDisabled}
                />
            }
            sx={{ '& .MuiDialogContent-root': { padding: 0, overflowY: "hidden" } }}
        >
            {activeStep === 0 && <FirstStepContent
                term={termValue}
                type={selectedType}
                existingIds={existingIds}
                synonyms={exactSynonyms}
                handleTermChange={handleTermValueChange}
                handleTypeChange={handleTypeChange}
                handleSynonymChange={handleSynonymChange}
                handleExistingIdChange={handleExistingIdChange}
                handleDialogClose={handleClose}
            />}
            {activeStep === 1 && <SecondStepContent />}
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
