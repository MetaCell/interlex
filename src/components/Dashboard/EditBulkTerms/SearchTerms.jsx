import PropTypes from "prop-types";
import { useState } from "react";
import {
  Button,
  Grid,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Stack,
  FormControlLabel,
  RadioGroup
} from "@mui/material";
import DropDownConditions from "./DropDownConditions";
import CustomizedInput from "../../common/CustomizedInput";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CustomSingleSelect from "../../common/CustomSingleSelect";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchTermsData from "../../../static/SearchTermsData.json";
import CustomizedRadio from "../../common/CustomizedRadio";
import OntologySearch from "../../SingleTermView/OntologySearch";
import { vars } from "../../../theme/variables";

const { gray800, gray700 } = vars;

const Confirmation = {
  Yes: "Yes",
  No: "No"
}

const styles = {
  title: {
    color: gray800,
    fontWeight: 600
  },
  subtitle: {
    color: gray800,
    fontWeight: 500
  },
  radioLabel: {
    "& .MuiFormControlLabel-label": {
      color: gray700, 
      fontWeight: 500
    }
  },
}

const SearchTerms = ({ searchConditions, setSearchConditions, initialSearchConditions }) => {
  const [ontologyEditOption, setOntologyEditOption] = useState(Confirmation.No);

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

  const handleOntologyEditOptionChange = (event) => {
    setOntologyEditOption((event.target).value);
  }

  const updatedColumnsArray = SearchTermsData.termsColumns.map(item => ({
    ...item,
    value: item.id
  }));

  return (
    <Box sx={{ mt: 4.5 }}>
      <Typography sx={{ ...styles.title, fontSize: "1.125rem", mb: 4, ml: 6.5 }}>
        Search terms, selecting their attributes and values.
      </Typography>

      <Divider />

      <Box sx={{ 
        display: "flex", 
        flexDirection: "column", 
        mt: 4, 
        mb: 4, 
        ml: 6.5, 
        gap: 3, 
        maxWidth: "31.25rem" 
      }}>
        <Stack direction="row" spacing={5} sx={{ alignItems: "center" }}>
          <Typography sx={styles.subtitle}>Do you want to edit a specific ontology?</Typography>
          <RadioGroup
            row
            aria-labelledby="ontology-radio-buttons-group"
            name="ontology-radio-buttons-group"
            value={ontologyEditOption}
            onChange={handleOntologyEditOptionChange}
          >
            <FormControlLabel control={<CustomizedRadio />} value={Confirmation.Yes} label="Yes" sx={styles.radioLabel}/>
            <FormControlLabel control={<CustomizedRadio />} value={Confirmation.No} label="No" sx={styles.radioLabel} />
          </RadioGroup>
        </Stack>

        {ontologyEditOption === Confirmation.Yes && (
          <OntologySearch placeholder="Enter an Ontology URI" fullWidth />
        )}
      </Box>

      <Divider />

      <Box sx={{ mt: 4, mb: 4, ml: 6.5, mr: 6.5 }}>
        <Typography variant="body1" sx={styles.subtitle}>Add filters</Typography>

        {searchConditions.map((term, index) => (
          <Grid 
            container 
            spacing={1.5} 
            mt={3} 
            mb={3.5} 
            key={index} 
            alignItems='end'
          >
            <Grid item xs={12} lg={1}>
              {index === 0 ? (
                <Box height='2.5rem' display='flex' alignItems='center'>
                  <Typography variant="body2" sx={styles.title}>
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
              <Typography variant="body1" sx={{ ...styles.subtitle, mb: '.75rem' }}>
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
