import { useState, useContext, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { debounce } from 'lodash';
import {
    Box,
    Divider,
    MobileStepper,
    Stack,
    Button,
    FormControlLabel,
    Checkbox
} from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CustomButton from '../../common/CustomButton';
import CustomizedDialog from "../../common/CustomizedDialog";
import OntologySearch from '../../SingleTermView/OntologySearch';
import FirstStepContent from "./FirstStepContent";
import SecondStepContent from "./SecondStepContent";
import StatusStep from "../../common/StatusStep";
import { GlobalDataContext } from '../../../contexts/DataContext';
import { getAddTermStatusProps } from '../termStatusProps';
import { getEndpointsIlx, elasticSearch } from '../../../api/endpoints/index';
import { CheckedIcon, UncheckedIcon } from '../../../Icons';
import { vars } from "../../../theme/variables";

const { gray100, gray200, gray400 } = vars;

const INITIAL_FORM_STATE = {
    label: "",
    synonyms: [],
    superClass: "",
    existingIDs: [],
    isDefinedBy: "",
    description: "",
    comment: ""
};

const HeaderRightSideContent = ({
    activeStep,
    onContinue,
    onClose,
    isContinueButtonDisabled
}) => (
    <Box display='flex' alignItems='center'>
        {activeStep !== 2 ? (
            <>
                <FormControlLabel
                    control={
                        <Checkbox
                            size="small"
                            icon={<UncheckedIcon />}
                            checkedIcon={<CheckedIcon />}
                        />
                    }
                    sx={{ color: "#515252" }}
                    label="Add to ontology"
                />
                <OntologySearch />
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
                        // disabled={isContinueButtonDisabled}
                        variant="contained"
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                            padding: '0.625rem 0.875rem',
                            '&.Mui-disabled': {
                                border: `1px solid ${gray200}`,
                                color: gray400,
                                backgroundColor: gray100
                            }
                        }}
                    >
                        Continue
                    </Button>
                </Stack>
            </>
        ) : (
            <Button variant="contained" onClick={onClose}>Finish</Button>
        )}
    </Box>
);

HeaderRightSideContent.propTypes = {
    activeStep: PropTypes.number.isRequired,
    onContinue: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    isContinueButtonDisabled: PropTypes.bool.isRequired
};

const AddNewTermDialog = ({
    open,
    handleClose,
    searchTerm,
    forwardPredicateStep
}) => {
    const [activeStep, setActiveStep] = useState(0);
    const [areMatchesChecked, setAreMatchesChecked] = useState(false);
    const [openSidebar, setOpenSidebar] = useState(true);
    const [loading, setLoading] = useState(true);
    const [termResults, setTermResults] = useState([]);
    const [addTermResponse, setAddTermResponse] = useState(null);
    const [termValue, setTermValue] = useState('');
    const [formState, setFormState] = useState(INITIAL_FORM_STATE);
    const [newTermId, setNewTermId] = useState("");
    const [selectedType, setSelectedType] = useState(null);

    const navigate = useNavigate();
    const { user } = useContext(GlobalDataContext);
    const [data] = useState(null);
    const memoData = useMemo(() => data, [data]);

    const isSearchTermAvailable = Boolean(searchTerm);
    const isContinueButtonDisabled = !isSearchTermAvailable && !areMatchesChecked;
    const isResultsEmpty = termResults?.length === 0;
    const statusProps = getAddTermStatusProps(addTermResponse, termValue);

    const handleContinueClick = () => setActiveStep(activeStep + 1);

    const handleCancelBtnClick = () => {
        handleClose();
        setActiveStep(0);
        setAreMatchesChecked(false);
    };

    const handleSidebarToggle = () => setOpenSidebar(!openSidebar);


    const handleGoToTermClick = () => {
        const groupName = user?.groupname || 'base';
        navigate(`/${groupName}/${newTermId}/overview`);
        onClose();
    };

    const handleTypeChange = (newType) => {
        setSelectedType(newType)
    }


    const fetchTerms = useCallback(
        debounce((termValue) => {
            setLoading(true);
            elasticSearch(termValue).then(data => {
                setTermResults(data.results?.results);
                setLoading(false);
            });
        }, 300),
        [getEndpointsIlx, elasticSearch]
    );

    const addTermRequest = useCallback(async (group, term) => {
        const token = localStorage.getItem("token");
        const groupName = user?.groupname || group;
        const body = {
            'rdf-type': term.superClass || 'owl:Class',
            label: term.label,
            exact: term.synonyms?.map(s => s.label),
        };

        try {
            const response = await createNewEntity({
                group: groupName,
                data: body,
                session: token
            });
            setAddTermResponse(response);
            setNewTermId(response.term.id.split("/").pop());
        } catch (error) {
            setAddTermResponse(error);
        }
    }, [user]);


    useEffect(() => {
        elasticSearch(termValue, 20, 0).then(data => {
            setTermResults(data.results?.results);
            setLoading(false);
        });
    }, [termValue]);

    useEffect(() => {
        fetchTerms(termValue);
        return () => {
            fetchTerms.cancel();
        };
    }, [termValue, fetchTerms]);

    useEffect(() => {
        if (memoData?.predicates) {
            setPredicates(memoData.predicates);
        }
    }, [memoData]);

    useEffect(() => {
        if (activeStep === 2) {
            addTermRequest("base", formState);
        }
    }, [addTermRequest, formState, activeStep]);

    useEffect(() => {
        if (forwardPredicateStep) {
            setActiveStep(1);
        }
    }, [forwardPredicateStep]);

    return (
        <CustomizedDialog
            title="Add new term"
            open={open}
            handleClose={handleClose}
            HeaderRightSideContent={
                <HeaderRightSideContent
                    activeStep={activeStep}
                    onContinue={handleContinueClick}
                    onClose={handleCancelBtnClick}
                    isContinueButtonDisabled={isContinueButtonDisabled}
                />
            }
            sx={{ '& .MuiDialogContent-root': { padding: 0, overflowY: "hidden" } }}
        >
            {activeStep === 0 && (
                <FirstStepContent
                    openSidebar={openSidebar}
                    loading={loading}
                    onToggle={handleSidebarToggle}
                    termResults={termResults}
                    isResultsEmpty={isResultsEmpty}
                    selectedType={selectedType}
                    onTypeChange={handleTypeChange}
                />
            )}
            {activeStep === 1 && <SecondStepContent />}
            {activeStep === 2 && addTermResponse != null && (
                <StatusStep statusProps={statusProps} onClose={handleGoToTermClick} />
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
