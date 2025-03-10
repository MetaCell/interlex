import PropTypes from 'prop-types';
import { vars } from "../../../theme/variables";
import DropDownConditions from "./DropDownConditions";
import CustomizedInput from "../../common/CustomizedInput";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CustomSingleSelect from "../../common/CustomSingleSelect";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchTermsData from "../../../static/SearchTermsData.json"
import {Button, Grid, Typography, Box, ToggleButton, ToggleButtonGroup} from "@mui/material";

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
    <Box>
      <Typography color={gray800} fontSize='1.125rem' fontWeight={600} mb='2.75rem'>
        Search terms, selecting their attributes and values.
      </Typography>
      {searchConditions.map((term, index) => (
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

SearchTerms.propTypes = {
  searchConditions: PropTypes.arrayOf(PropTypes.shape({
    attribute: PropTypes.string,
    value: PropTypes.string,
    condition: PropTypes.string,
    relation: PropTypes.string,
  })).isRequired,
  setSearchConditions: PropTypes.func.isRequired,
  initialSearchConditions: PropTypes.shape({
    attribute: PropTypes.string,
    value: PropTypes.string,
    condition: PropTypes.string,
    relation: PropTypes.string,
  }).isRequired,
};

export default SearchTerms;
