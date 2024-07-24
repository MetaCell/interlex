import React from "react";
import { Box, Typography, Grid, Button } from "@mui/material";
import PredicateGroupInput from "../SingleTermView/OverView/PredicateGroupInput";
import CustomizedInput from "../common/CustomizedInput";
import CustomSingleSelect from "../common/CustomSingleSelect";
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { vars } from "../../theme/variables";
const { gray800 } = vars;

const AddPredicatesStep = ({ termValue, predicatesOptions }) => {

    const [predicates, setPredicates] = React.useState([{ subject: termValue, predicate: '', object: { type: 'Object', value: '', isLink: false } }]);

    const handleAddPredicate = () => {
        setPredicates([...predicates, { subject: '', predicate: '', object: { type: 'Object', value: '', isLink: false } }]);
    };

    const handlePredicateChange = (index, field, value) => {
        const newPredicates = [...predicates];
        newPredicates[index][field] = value;
        setPredicates(newPredicates);
    };

    const handleDeletePredicate = (index) => {
        const newPredicates = predicates.filter((_, i) => i !== index);
        setPredicates(newPredicates);
    };

    return (
        <Box height={1} width={1} sx={{ padding: '2.25rem 3.25rem' }}>
            <Typography color={gray800} fontSize='1.125rem' fontWeight={600} mb='2.75rem'>
                Add Predicates to {termValue}
            </Typography>
            {predicates.map((predicate, index) => (
                <Grid container spacing='1.75rem' mb='2rem' key={index} alignItems='end'>
                    <Grid item xs={12} lg={3}>
                        <CustomizedInput
                            value={predicate.subject}
                            label='Subject'
                            placeholder='Subject term'
                            onChange={(e) => handlePredicateChange(index, 'subject', e.target.value)}
                            disabled={true}
                        />
                    </Grid>
                    <Grid item xs={12} lg={3}>
                        <Typography sx={{
                            fontSize: '1rem',
                            fontWeight: '500',
                            color: gray800,
                            mb: '.75rem'
                        }}>
                            Predicate
                        </Typography>
                        <CustomSingleSelect
                            value={predicate.predicate}
                            onChange={(v) => handlePredicateChange(index, 'predicate', v)}
                            options={predicatesOptions}
                            isFormControlFullWidth={true}
                        />
                    </Grid>
                    <Grid item xs={12} lg={predicates.length > 1 ? 5 : 6}>
                        <PredicateGroupInput
                            predicate={predicate}
                            onChange={(value) => handlePredicateChange(index, 'object', value)}
                        />
                    </Grid>
                    {predicates.length > 1 && (
                        <Grid item lg={predicates.length > 1 ? 1 : 0}>
                            <Button sx={{
                                padding: '.625rem',
                                minWidth: 'auto'
                            }} variant='outlined' onClick={() => handleDeletePredicate(index)}>
                                <DeleteOutlineIcon />
                            </Button>
                        </Grid>
                    )}
                </Grid>
            ))}
            <Button variant="outlined" onClick={handleAddPredicate} startIcon={<AddIcon />}>Add a new relationship</Button>
        </Box>
    )
}

export default AddPredicatesStep;