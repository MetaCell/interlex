import PropTypes from "prop-types";
import { useState, useContext, useMemo, useCallback } from "react";
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
import CustomFormField from "../../common/CustomFormField";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CustomSingleSelect from "../../common/CustomSingleSelect";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchTermsData from "../../../static/SearchTermsData.json";
import CustomizedRadio from "../../common/CustomizedRadio";
import OntologySearch from "../../SingleTermView/OntologySearch";
import { vars } from "../../../theme/variables";
import { GlobalDataContext } from "../../../contexts/DataContext";
import { API_CONFIG } from "../../../config";

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

const SearchTerms = ({ searchConditions, setSearchConditions, initialSearchConditions, ontologyTerms, setOntologyTerms, ontologyAttributes, setOntologyAttributes, selectedOntology, setSelectedOntology, setOriginalTerms, setJsonLdContext }) => {
  const [ontologyEditOption, setOntologyEditOption] = useState(Confirmation.Yes);
  const [attributesLoading, setAttributesLoading] = useState(false);
  const { user } = useContext(GlobalDataContext);
  
  const ontologySearchExtraStyles = useMemo(() => ({
    width: '500px !important'
  }), []);

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
    const newValue = (event.target).value;
    setOntologyEditOption(newValue);
    
    // Reset ontology selection when switching options
    if (newValue === Confirmation.No) {
      setSelectedOntology(null);
      setOntologyAttributes([]);
      setOntologyTerms([]);
    }
  }

  const handleOntologySelect = useCallback(async (ontology) => {
    setSelectedOntology(ontology);
    
    if (!ontology || !ontology.description) {
      setOntologyAttributes([]);
      setOntologyTerms([]);
      return;
    }

    setAttributesLoading(true);
    try {
      // Convert the ontology URI from /spec to .jsonld
      const jsonldUri = ontology.description.replace(/\/spec$/, '.jsonld').replace(API_CONFIG.INTERLEX_URL, API_CONFIG.BASE_URL);
      
      // Fetch the JSON-LD data
      const response = await fetch(jsonldUri);
      if (!response.ok) {
        throw new Error(`Failed to fetch ontology data: ${response.status}`);
      }
      
      const jsonldData = await response.json();
      
      // Extract unique attributes from all terms in the ontology
      const attributes = new Set();
      
      // Process the @graph array which contains all the terms
      if (jsonldData['@graph'] && Array.isArray(jsonldData['@graph'])) {
        jsonldData['@graph'].forEach(term => {
          // Skip ontology metadata entries
          if (term['@type'] === 'owl:Ontology') return;
          
          // Extract all properties/attributes from each term
          Object.keys(term).forEach(key => {
            // Skip JSON-LD control keys (@id, @type, etc.)
            if (!key.startsWith('@')) {
              attributes.add(key);
            }
          });
        });
      } else {
        // Fallback: if no @graph, process the data directly
        const processObject = (obj) => {
          if (!obj || typeof obj !== 'object') return;
          
          Object.keys(obj).forEach(key => {
            if (!key.startsWith('@') && key !== 'id' && key !== 'type' && key !== 'context') {
              attributes.add(key);
            }
          });
        };
        
        if (Array.isArray(jsonldData)) {
          jsonldData.forEach(processObject);
        } else {
          processObject(jsonldData);
        }
      }
      
      // Convert to the expected format for the dropdown
      const attributeOptions = Array.from(attributes).sort().map(attr => {
        // Create a user-friendly label from the URI
        let label = attr;
        
        // If it's a URI, extract the meaningful part
        if (attr.includes('/')) {
          const parts = attr.split('/');
          label = parts[parts.length - 1];
        }
        
        // Handle common prefixes and create readable labels
        if (attr.startsWith('rdfs:')) {
          label = attr.replace('rdfs:', 'RDFS ').replace(/([A-Z])/g, '$1');
        } else if (attr.startsWith('http://purl.obolibrary.org/obo/IAO_')) {
          label = `Definition (IAO_${attr.split('_').pop()})`;
        } else if (attr.includes('readable/synonym')) {
          label = 'Synonym';
        } else if (attr.includes('hasExternalId')) {
          label = 'External ID';
        } else if (attr === 'rdfs:label') {
          label = 'Label';
        } else if (attr === 'rdfs:subClassOf') {
          label = 'Parent Class';
        } else {
          // For other URIs, try to make them more readable
          label = label.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        }
        
        return {
          id: attr,
          label: label.trim(),
          value: attr,
          minWidth: 200,
          visibility: true
        };
      });
      
      setOntologyAttributes(attributeOptions);
      
      // Extract terms for the table
      const termsData = [];
      if (jsonldData['@graph'] && Array.isArray(jsonldData['@graph'])) {
        jsonldData['@graph'].forEach(term => {
          // Skip ontology metadata entries
          if (term['@type'] === 'owl:Ontology') return;
          
          // Create a term object with all its properties
          const termObj = { '@id': term['@id'], '_rawNode': term };
          
          // Process each property
          Object.keys(term).forEach(key => {
            if (!key.startsWith('@') || key === '@id') {
              let value = term[key];
              
              // Handle different value types
              if (Array.isArray(value)) {
                // For arrays, extract meaningful values
                termObj[key] = value.map(item => {
                  if (typeof item === 'object' && item !== null) {
                    return JSON.stringify(item);
                  }
                  return item;
                }).join(', ');
              } else if (typeof value === 'object' && value['@id']) {
                // For objects with @id, use the @id value
                termObj[key] = value['@id'];
              } else {
                // For simple values, use directly
                termObj[key] = value;
              }
            }
          });
          
          termsData.push(termObj);
        });
      }
      
      setOntologyTerms(termsData);
      setOriginalTerms([...termsData]);
      if (setJsonLdContext) setJsonLdContext(jsonldData['@context'] || {});
    } catch (error) {
      console.error('Error fetching ontology attributes:', error);
      setOntologyAttributes([]);
      setOntologyTerms([]);
    } finally {
      setAttributesLoading(false);
    }
  }, [setOntologyAttributes, setOntologyTerms, setSelectedOntology, setOriginalTerms, setJsonLdContext]);

  const updatedColumnsArray = useMemo(() => {
    // If an ontology is selected and we have attributes, use those
    if (ontologyEditOption === Confirmation.Yes && ontologyAttributes.length > 0) {
      return ontologyAttributes;
    }
    
    // If ontology is selected but no attributes yet (or loading), return empty array
    if (ontologyEditOption === Confirmation.Yes) {
      return [];
    }
    
    // Default to static columns when no ontology is selected
    return SearchTermsData.termsColumns.map(item => ({
      ...item,
      value: item.id
    }));
  }, [ontologyEditOption, ontologyAttributes]);

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
            <FormControlLabel control={<CustomizedRadio />} value={Confirmation.Yes} label="Yes" sx={styles.radioLabel} />
            <FormControlLabel control={<CustomizedRadio />} value={Confirmation.No} label="No" sx={styles.radioLabel} />
          </RadioGroup>
        </Stack>

        {ontologyEditOption === Confirmation.Yes && (
          <>
            <OntologySearch 
              placeholder="Enter an Ontology URI" 
              fullWidth 
              extra={ontologySearchExtraStyles} 
              userGroupname={user?.groupname}
              onOntologySelect={handleOntologySelect}
              disableGlobalUpdate={true}
            />
            {selectedOntology && ontologyTerms.length === 0 && !attributesLoading && (
              <Typography variant="body2" sx={{ mt: 2, color: 'warning.main', fontWeight: 500 }}>
                ⚠️ The selected ontology &quot;{selectedOntology.label}&quot; contains no terms to edit.
              </Typography>
            )}
          </>
        )}
      </Box>

      <Divider />

      <Box sx={{ mt: 4, mb: 4, ml: 6.5, mr: 6.5 }}>
        {(ontologyEditOption === Confirmation.No) 
        ? (
          <Typography variant="body1" sx={styles.subtitle}>
            Please select an ontology to edit. The functionality to filters terms without selecting an ontology is not yet available.
          </Typography>
        ) : (
          <>
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
                    value={term.attribute} 
                    onChange={(v) => handleTermChange(index, 'attribute', v)}
                    options={updatedColumnsArray}
                    placeholder={
                      ontologyEditOption === Confirmation.Yes && !selectedOntology 
                        ? 'Select an ontology first'
                        : attributesLoading 
                        ? 'Loading attributes...'
                        : 'Choose an attribute'
                    }
                    disabled={
                      (ontologyEditOption === Confirmation.Yes && !selectedOntology) || 
                      attributesLoading
                    }
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
                  <CustomFormField
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
          </>
        )}
      </Box>
    </Box>
  );
}

SearchTerms.propTypes = {
  searchConditions: PropTypes.array.isRequired,
  setSearchConditions: PropTypes.func.isRequired,
  initialSearchConditions: PropTypes.object.isRequired,
  ontologyTerms: PropTypes.array.isRequired,
  setOntologyTerms: PropTypes.func.isRequired,
  ontologyAttributes: PropTypes.array.isRequired,
  setOntologyAttributes: PropTypes.func.isRequired,
  selectedOntology: PropTypes.object,
  setSelectedOntology: PropTypes.func.isRequired,
  setOriginalTerms: PropTypes.func.isRequired,
  setJsonLdContext: PropTypes.func,
};

export default SearchTerms;
