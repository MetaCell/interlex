import { Button, Grid, Radio, RadioGroup, FormControlLabel, Typography } from "@mui/material";
import { useState } from "react";
import { vars } from "../../theme/variables";
import CustomizedInput from "../common/CustomizedInput";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DropDownConditions from "./DropDownConditions";

const { gray800 } = vars;

const SearchTerms = () => {
  const [predicates, setPredicates] = useState([{ attribute: '', value: '', logic: 'where' }]);
  const handlePredicateChange = (index, field, value) => {
    const newPredicates = [...predicates];
    newPredicates[index][field] = value;
    setPredicates(newPredicates);
  };
  
  const handleDeletePredicate = (index) => {
    const newPredicates = predicates.filter((_, i) => i !== index);
    setPredicates(newPredicates);
  };
  
  const handleAddPredicate = () => {
    setPredicates([...predicates, { attribute: '', value: '', logic: 'and' }]);
  };
  
  const handleLogicChange = (index, value) => {
    const newPredicates = [...predicates];
    newPredicates[index].logic = value;
    setPredicates(newPredicates);
  };
  
  return (
    <>
      <Typography color={gray800} fontSize='1.125rem' fontWeight={600} mb='2.75rem'>
        Search terms, selecting their attributes and values.
      </Typography>
      {predicates.map((predicate, index) => (
        <Grid container spacing='2.75rem' mb='2rem' key={index} alignItems='end'>
          <Grid item xs={12} lg={1}>
            {index === 0 ? (
              <Typography color={gray800} fontSize='.875rem' fontWeight={600}>
                Where
              </Typography>
            ) : (
              <RadioGroup
                row
                value={predicate.logic}
                onChange={(e) => handleLogicChange(index, e.target.value)}
              >
                <FormControlLabel value="and" control={<Radio />} label="and" />
                <FormControlLabel value="or" control={<Radio />} label="or" />
              </RadioGroup>
            )}
          </Grid>
          <Grid item xs={12} lg={4}>
            <CustomizedInput
              value={predicate.attribute}
              label='Search for attribute'
              placeholder='Choose an attribute'
              onChange={(e) => handlePredicateChange(index, 'attribute', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} lg={2}>
            <DropDownConditions />
          </Grid>
          <Grid item xs={12} lg={4}>
            <CustomizedInput
              value={predicate.value}
              label='Value'
              placeholder='Type a value'
              onChange={(e) => handlePredicateChange(index, 'value', e.target.value)}
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
      <Button
        startIcon={<AddOutlinedIcon />}
        type="string"
        color="secondary"
        onClick={handleAddPredicate}
      >
        Add Condition
      </Button>
    </>
  );
}

export default SearchTerms;
