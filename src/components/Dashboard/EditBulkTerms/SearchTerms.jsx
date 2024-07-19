import {Button, Grid, Typography, Box} from "@mui/material";
import { useState } from "react";
import { vars } from "../../../theme/variables";
import CustomizedInput from "../../common/CustomizedInput";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DropDownConditions from "./DropDownConditions";
import CustomSingleSelect from "../../common/CustomSingleSelect";
import {ToggleButton, ToggleButtonGroup} from "@mui/lab";
import SearchTermsData from "../../../static/SearchTermsData.json"

const { gray800 } = vars;

const SearchTerms = () => {
  const initialTermsCondition = { attribute: '', value: '', logic: 'where', condition: SearchTermsData.objectOptions[0].value }
  const [terms, setTerms] = useState([initialTermsCondition]);
  
  const handleTermChange = (index, field, value) => {
    const newTerms = [...terms];
    newTerms[index][field] = value;
    setTerms(newTerms);
  };
  
  const handleDeleteTerm = (index) => {
    const newTerms = terms.filter((_, i) => i !== index);
    setTerms(newTerms);
  };
  
  const handleAddTerm = () => {
    setTerms([...terms, { attribute: '', value: '', logic: 'and', condition: SearchTermsData.objectOptions[0].value }]);
  };
  const handleLogicChange = (event, newValue, index) => {
    const value = newValue
    const newTerms = [...terms];
    newTerms[index].logic = value;
    setTerms(newTerms);
  };
  
  const handleClearAllConditions = () => {
    setTerms([initialTermsCondition]);
  };
  
  const updatedColumnsArray = SearchTermsData.termsColumns.map(item => ({
    ...item,
    value: item.id
  }));

  return (
    <Box>
      <Typography color={gray800} fontSize='1.125rem' fontWeight={600} mb='2.75rem'>
        Search terms, selecting their attributes and values.
      </Typography>
      {terms.map((term, index) => (
        <Grid container spacing='1.75rem' mb='2rem' key={index} alignItems='end'>
          <Grid item xs={12} lg={1}>
            {index === 0 ? (
             <Box height='2.5rem' display='flex' alignItems='center'>
               <Typography color={gray800} fontSize='.875rem' fontWeight={600}>
                 Where
               </Typography>
             </Box>
            ) : (
              <ToggleButtonGroup
                value={term.logic}
                exclusive
                onChange={(event, value) =>handleLogicChange(event, value, index)}
                sx={{
                  height: '2.5rem',
                }}
              >
                <ToggleButton value={'and'}>
                  And
                </ToggleButton>
                <ToggleButton value={'or'}>
                  Or
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          </Grid>
          <Grid item xs={12} lg={4}>
            <Typography sx={{
              fontSize: '1rem',
              fontWeight: '500',
              color: gray800,
              mb: '.75rem'
            }}>
              Search for attribute
            </Typography>
            <CustomSingleSelect
              isFormControlFullWidth={true}
              value={term.attribute} onChange={(v) => handleTermChange(index, 'attribute', v)}
              options={updatedColumnsArray}
              placeholder='Choose an attribute'
            />
          </Grid>
          <Grid item xs={12} lg={3}>
            <DropDownConditions
              value={term.condition}
              onChange={(value) => handleTermChange(index, 'condition', value)}
              index={index}
              handleTermChange={handleTermChange}
            />
          </Grid>
          <Grid item xs={12} lg={terms.length > 1 ? 3 : 4}>
            <CustomizedInput
              value={term.value}
              label='Value'
              placeholder='Type a value'
              onChange={(e) => handleTermChange(index, 'value', e.target.value)}
            />
          </Grid>
          {terms.length > 1 && (
            <Grid item lg={terms.length > 1 ? 1 : 0}>
              <Button sx={{
                padding: '.625rem',
                minWidth: 'auto'
              }} variant='outlined' onClick={() => handleDeleteTerm(index)}>
                <DeleteOutlineIcon />
              </Button>
            </Grid>
          )}
        </Grid>
      ))}
      <Box display='flex' alignItems='center' justifyContent='space-between'>
        <Button
          startIcon={<AddOutlinedIcon />}
          type="string"
          color="secondary"
          onClick={handleAddTerm}
        >
          Add Condition
        </Button>
        <Button
          type="string"
          onClick={handleClearAllConditions}
        >
          Clear all
        </Button>
      </Box>
    </Box>
  );
}

export default SearchTerms;
