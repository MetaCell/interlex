import {Button, Grid, Typography, Box, Select, MenuItem, FormControl} from "@mui/material";
import { useState } from "react";
import { vars } from "../../theme/variables";
import CustomizedInput from "../common/CustomizedInput";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DropDownConditions from "./DropDownConditions";
import SearchTermsData from "../../static/SearchTermsData.json"
import CustomIconTabs from "../common/CustomIconTabs";

const { gray800, gray700, gray300 } = vars;

const SearchTerms = () => {
  const [terms, setTerms] = useState([{ attribute: '', value: '', logic: 'where', condition: SearchTermsData.objectOptions[0].value }]);
  
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
    const value = newValue === 0 ? 'and' : 'or'
    const newTerms = [...terms];
    newTerms[index].logic = value;
    setTerms(newTerms);
  };

  return (
    <Box padding={'2.25rem 3.25rem 2.5rem 3.25rem'}>
      <Typography color={gray800} fontSize='1.125rem' fontWeight={600} mb='2.75rem'>
        Search terms, selecting their attributes and values.
      </Typography>
      {terms.map((term, index) => (
        <Grid container spacing='1.75rem' mb='2rem' key={index} alignItems='end'>
          <Grid item xs={12} lg={1}>
            {index === 0 ? (
              <Typography color={gray800} fontSize='.875rem' fontWeight={600}>
                Where
              </Typography>
            ) : (
              <CustomIconTabs
                tabs={[
                  {
                    text: 'And',
                    value: 0
                  },
                  {
                    text: 'Or',
                    value: 1
                  }
                ]}
                value={term.logic === 'and' ? 0 : 1}
                handleChange={(event, value) => handleLogicChange(event, value, index)}
                sx={{
                  height: '2.5rem'
                }}
              />
            )}
          </Grid>
          <Grid item xs={12} lg={4}>
            <FormControl fullWidth>
              <Select
                value={term.attribute}
                displayEmpty
                placeholder='Search for attribute'
                onChange={(e) => handleTermChange(index, 'attribute', e.target.value)}
                sx={{
                  color: gray700,
                  borderRadius: '0.5rem !important',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  '& .MuiOutlinedInput-input': {
                    padding: '0.625rem 0.875rem'
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: gray300
                  },
                  '& .MuiSvgIcon-root': {
                    color: gray700,
                    fontSize: '1.25rem',
                    right: '0.875rem !important'
                  }
                }}
              >
                {SearchTermsData.termsColumns.map((attribute) => (
                  <MenuItem key={attribute.id} value={attribute.id}>{attribute.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
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
      <Button
        startIcon={<AddOutlinedIcon />}
        type="string"
        color="secondary"
        onClick={handleAddTerm}
      >
        Add Condition
      </Button>
    </Box>
  );
}

export default SearchTerms;
