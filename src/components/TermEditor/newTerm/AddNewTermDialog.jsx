import { useState, useCallback, useContext, useMemo, useRef } from "react";
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
import { createNewEntity, addEntityToOntology, patchTermPredicates } from "../../../api/endpoints/apiService";
import { buildExpandContext } from "../../../configuration/predicateConfig";
import { expandIri } from "../../../parsers/predicateMutations";
import { getAddTermStatusProps } from '../termStatusProps';
import { CheckedIcon, UncheckedIcon } from '../../../Icons';
import { vars } from "../../../theme/variables";
import { DEFAULT_TYPE } from "../../../constants/types";

const { gray100, gray200, gray400, gray600 } = vars;

const STEP_BUTTON_LABEL = ['Create new', 'Continue', 'Continue'];

const HeaderRightSideContent = ({
    activeStep,
    onContinue,
    onClose,
    onFinish,
    isCreateButtonDisabled,
    isEditing,
    userGroupname,
    ontologyChecked,
    onOntologyChange,
}) => {
    const handleOntologyChange = (event) => {
        onOntologyChange(event.target.checked);
    };

    return (
        <Box display='flex' alignItems='center'>
            {activeStep !== 2 ? (
                <>
                    {activeStep === 0 && (
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
                            <OntologySearch disabled={!ontologyChecked} userGroupname={userGroupname} />
                            <Divider orientation="vertical" flexItem sx={{ m: '0 1rem' }} />
                        </>
                    )}
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
                            {activeStep === 0 && isEditing ? 'Edit term' : STEP_BUTTON_LABEL[activeStep]}
                        </Button>
                    </Stack>
                </>
            ) : (
                <Button variant="contained" onClick={onFinish}>Finish</Button>
            )}
        </Box>
    )
};

HeaderRightSideContent.propTypes = {
    activeStep: PropTypes.number.isRequired,
    onContinue: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onFinish: PropTypes.func.isRequired,
    isCreateButtonDisabled: PropTypes.bool.isRequired,
    isEditing: PropTypes.bool.isRequired,
    userGroupname: PropTypes.string,
    ontologyChecked: PropTypes.bool.isRequired,
    onOntologyChange: PropTypes.func.isRequired,
};

const AddNewTermDialog = ({ open, handleClose }) => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [addTermResponse, setAddTermResponse] = useState(null); // termId string (e.g. tmp_000000146)
    const [addTermStatus, setAddTermStatus] = useState(null);    // synthetic { status } for StatusStep
    const [selectedType, setSelectedType] = useState(DEFAULT_TYPE);
    const [termValue, setTermValue] = useState("");
    const [selectedTermValue, setSelectedTermValue] = useState("");
    const [exactSynonyms, setExactSynonyms] = useState([]);
    const [existingIds, setExistingIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasExactMatch, setHasExactMatch] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [ontologyChecked, setOntologyChecked] = useState(false);
    const secondStepRef = useRef(null);
    const { user, activeOntology, curies } = useContext(GlobalDataContext);

    const isCreateButtonDisabled = useMemo(() => {
        if (hasExactMatch) return true;

        if (termValue === "") return true;

        if (isEditing && termValue === selectedTermValue) return true;

        return false;
    }, [hasExactMatch, termValue, isEditing, selectedTermValue]);

    const statusProps = getAddTermStatusProps(addTermStatus, termValue);

    const handleCancelBtnClick = () => {
        handleClose();
        setActiveStep(0);
        setAddTermResponse(null);
        setAddTermStatus(null);
    };

    const handleTermValueChange = (value) => {
        const isEventObject = value && typeof value === 'object' && 'target' in value;
        const newValue = isEventObject ? value.target.value : value;
        setTermValue(newValue);

        if (isEventObject && isEditing) {
            if (newValue !== selectedTermValue) {
                setIsEditing(true);
            }
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

    const handleExactMatchChange = (value) => {
        setHasExactMatch(value)
    }

    const handleTermSelection = (result) => {
        if (result?.label) {
            setSelectedTermValue(result.label);
            handleTermValueChange(result.label);
        }
    }

    const editTerm = useCallback(() => {
        console.log("Edit term");
    }, []);

    const createNewTerm = useCallback(async () => {
        if (!termValue || !selectedType || hasExactMatch) return;

        setLoading(true);

        const groupName = user?.groupname || "base";
        const body = {
            'rdf-type': selectedType || 'owl:Class',
            label: termValue
        };

        try {
            const response = await createNewEntity({ group: groupName, data: body });

            if (!response.termId) {
                console.error("Creation failed: no term ID in response", response.raw);
                return;
            }

            if (ontologyChecked && activeOntology?.description) {
                await addEntityToOntology({
                    group: groupName,
                    ontologyUri: activeOntology.description,
                    termId: response.termId,
                });
            }

            setAddTermResponse(response.termId);
            setAddTermStatus({ status: 200 });
            setActiveStep(1);
        } catch (error) {
            console.error("Creation failed:", error);
        } finally {
            setLoading(false);
        }
    }, [termValue, selectedType, user, hasExactMatch, ontologyChecked, activeOntology]);

    const handleFinish = useCallback(() => {
        const groupName = user?.groupname || "base";
        handleClose();
        setActiveStep(0);
        setAddTermResponse(null);
        setAddTermStatus(null);
        if (addTermResponse) {
            navigate(`/${groupName}/${addTermResponse}`);
        }
    }, [user, addTermResponse, handleClose, navigate]);

    const patchNewTerm = useCallback(async () => {
        const groupName = user?.groupname || "base";
        const termId = addTermResponse;
        const formData = secondStepRef.current?.getFormData?.();

        const termIri = `http://uri.interlex.org/${groupName}/${termId}`;
        const ctx = buildExpandContext(curies?.base ?? []);
        const triples = [];

        if (formData?.definition) {
            triples.push([termIri, expandIri('definition', ctx), { type: 'literal', value: formData.definition }]);
        }
        if (formData?.comment) {
            triples.push([termIri, expandIri('rdfs:comment', ctx), { type: 'literal', value: formData.comment }]);
        }
        for (const p of formData?.predicates ?? []) {
            if (p.predicate && p.object?.value) {
                const subject = p.subject || termIri;
                const pred = expandIri(p.predicate, ctx);
                triples.push([subject, pred, { type: p.object.isLink ? 'uri' : 'literal', value: p.object.value }]);
            }
        }

        if (triples.length > 0) {
            setLoading(true);
            try {
                await patchTermPredicates({ group: groupName, termId, add: triples });
            } catch (error) {
                console.error("PATCH failed:", error);
            } finally {
                setLoading(false);
            }
        }

        setActiveStep(2);
    }, [user, addTermResponse, curies]);

    const handleAction = useCallback(() => {
        if (activeStep === 1) {
            patchNewTerm();
        } else if (isEditing) {
            editTerm();
        } else {
            createNewTerm();
        }
    }, [activeStep, isEditing, editTerm, createNewTerm, patchNewTerm]);

    return (
        <CustomizedDialog
            title="Add new term"
            open={open}
            handleClose={handleClose}
            HeaderRightSideContent={
                <HeaderRightSideContent
                    activeStep={activeStep}
                    onClose={handleCancelBtnClick}
                    onContinue={handleAction}
                    onFinish={handleFinish}
                    isCreateButtonDisabled={isCreateButtonDisabled || loading}
                    isEditing={isEditing}
                    userGroupname={user?.groupname}
                    ontologyChecked={ontologyChecked}
                    onOntologyChange={setOntologyChecked}
                />
            }
            sx={{ '& .MuiDialogContent-root': { padding: 0, overflowY: "hidden" } }}
        >
            {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: '3rem' }}>
                    <CircularProgress />
                </Box>
            ) : activeStep === 0 ? (
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
                    handleExistingIdChange={handleExistingIdChange}
                    onTermSelect={handleTermSelection}
                    handleDialogClose={handleClose}
                />
            ) : activeStep === 1 ? (
                <SecondStepContent ref={secondStepRef} searchTerm={addTermResponse} />
            ) : (
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
