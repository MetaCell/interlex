import PropTypes from "prop-types";
import DropDownConditions from "./DropDownConditions";
import CustomizedInput from "../../common/CustomizedInput";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CustomSingleSelect from "../../common/CustomSingleSelect";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchTermsData from "../../../static/SearchTermsData.json";
import {Button, Grid, Typography, Box, ToggleButton, ToggleButtonGroup, Divider, Stack, FormControlLabel} from "@mui/material";
import CustomizedRadio from "../../common/CustomizedRadio";

import { vars } from "../../../theme/variables";
const { gray800 } = vars;

const SearchTerms = ({searchConditions, setSearchConditions, initialSearchConditions}) => {
  const handleTermChange = (index, field, value) => {
    const newTerms = [...searchConditions];
    newTerms[index][field] = value;
    setSearchConditions(newTerms);
  };

  const handleDeleteTerm = (index) => {
    const newTerms = searchConditions.filter((_, i) => i !== index);
    setSearchConditions(newTerms);
  };

  const handleAddTerm = () => {
    setSearchConditions([...searchConditions, { attribute: '', value: '', condition: 'and', relation: SearchTermsData.objectOptions[0].value }]);
  };

  const handleConditionChange = (event, newValue, index) => {
    const value = newValue;
    const newTerms = [...searchConditions];
    newTerms[index].condition = value;
    setSearchConditions(newTerms);
  };

  const handleClearAllConditions = () => {
    setSearchConditions([initialSearchConditions]);
  };

  const updatedColumnsArray = SearchTermsData.termsColumns.map(item => ({
    ...item,
    value: item.id
  }));

  return (
    <Box sx={{ mt: 4.5 }}>
      <Typography color={gray800} fontSize='1.125rem' fontWeight={600} mb={4} ml={6.5}>
        Search terms, selecting their attributes and values.
      </Typography>
      <Divider />
      <Box mt={4} mb={4} ml={6.5} sx={{ display: "flex", alignItems: "center" }}>
        <Typography sx={{ color: gray800, fontWeight: 500 }}>Do you want to edit a specific ontology?</Typography>
        <Stack direction="row" spacing={2.5} sx={{ ml: 5 }}>
          <FormControlLabel control={<CustomizedRadio />} label="Yes" sx={{ "& .MuiFormControlLabel-label": {color: "#313534", fontWeight: 500} }} />
          <FormControlLabel control={<CustomizedRadio />} label="No" sx={{ "& .MuiFormControlLabel-label": {color: "#313534", fontWeight: 500} }} />
        </Stack>
      </Box>
      <Divider />
      <Box mt={4} mb={4} ml={6.5} mr={6.5}>
        <Typography sx={{ color: gray800, fontWeight: 500 }}>Add filters</Typography>
        {searchConditions.map((term, index) => (
          <Grid container spacing={1.5} mt={3} mb={3.5} key={index} alignItems='end'>
            <Grid item xs={12} lg={1}>
              {index === 0 ? (
                <Box height='2.5rem' display='flex' alignItems='center'>
                  <Typography color={gray800} fontSize='.875rem' fontWeight={600}>
                    Where
                  </Typography>
                </Box>
              ) : (
                <ToggleButtonGroup
                  value={term.condition}
                  exclusive
                  onChange={(event, value) => handleConditionChange(event, value, index)}
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
                value={term.relation}
                onChange={(value) => handleTermChange(index, 'relation', value)}
                index={index}
                handleTermChange={handleTermChange}
              />
            </Grid>
            <Grid item xs={12} lg={searchConditions.length > 1 ? 3 : 4}>
              <CustomizedInput
                value={term.value}
                label='Value'
                placeholder='Type a value'
                onChange={(e) => handleTermChange(index, 'value', e.target.value)}
              />
            </Grid>
            {searchConditions.length > 1 && (
              <Grid item lg={searchConditions.length > 1 ? 1 : 0}>
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
        <Stack direction="row" spacing={1.5}>
          <Button
            startIcon={<AddOutlinedIcon />}
            variant="outlined"
            onClick={handleAddTerm}
          >
            Add Condition
          </Button>
          <Button
            variant="text"
            onClick={handleClearAllConditions}
          >
            Clear all
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

SearchTerms.propTypes = {
  searchConditions: PropTypes.array.isRequired,
  setSearchConditions: PropTypes.func.isRequired,
  initialSearchConditions: PropTypes.object.isRequired,
};

export default SearchTerms;
