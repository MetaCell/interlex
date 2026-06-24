import PropTypes from "prop-types";
import React, {useState} from "react";
import TermsTable from "./TermsTable";
import EditBulkAttributesForm from "./EditBulkAttributesForm";
import {Box, IconButton, Tooltip, Typography} from "@mui/material";
import SearchTermsData from "../../../static/SearchTermsData.json";
import {EditNoteOutlined, StartOutlined} from "@mui/icons-material";

import { vars } from "../../../theme/variables";
const { gray200, gray800,gray700 } = vars;

const EditTerms = ({searchConditions, ontologyTerms, ontologyAttributes, onTermsUpdate}) => {
  const initialAttributesValue = { attribute: '', condition: 'add', value: '' }
  const [open, setOpen] = React.useState(false);
  const [attributes, setAttributes] = useState([initialAttributesValue]);
  const [undoHistory, setUndoHistory] = useState([]);

  // Filter ontology terms based on search conditions
  const filteredTerms = React.useMemo(() => {
    // If no search conditions or all conditions are empty, return all terms
    const hasValidConditions = searchConditions.some(condition => 
      condition.attribute && condition.value
    );
    
    if (!hasValidConditions) {
      return ontologyTerms;
    }

    // Apply filters
    return ontologyTerms.filter(term => {
      return searchConditions.every(condition => {
        if (!condition.attribute || !condition.value) {
          return true; // Skip empty conditions
        }

        const termValue = term[condition.attribute];
        if (!termValue) {
          return false; // Term doesn't have this attribute
        }

        // Convert to string for comparison
        const termValueStr = String(termValue).toLowerCase();
        const searchValue = condition.value.toLowerCase();

        // Apply different relations (contains, equals, etc.)
        switch (condition.relation) {
          case 'contains':
            return termValueStr.includes(searchValue);
          case 'equals':
            return termValueStr === searchValue;
          case 'starts_with':
            return termValueStr.startsWith(searchValue);
          case 'ends_with':
            return termValueStr.endsWith(searchValue);
          default:
            return termValueStr.includes(searchValue);
        }
      });
    });
  }, [searchConditions, ontologyTerms]);

  // Handle applying bulk changes to the table
  const handleApplyChanges = React.useCallback(() => {
    // Store current state for undo
    const currentSnapshot = {
      terms: [...ontologyTerms],
      timestamp: Date.now(),
      changes: attributes.filter(attr => attr.attribute && attr.value)
    };
    setUndoHistory(prev => [...prev, currentSnapshot]);
    
    // Apply changes directly to all ontology terms that match the filter criteria
    const updatedTerms = ontologyTerms.map((term) => {
      // Check if this term should be included in the bulk edit
      const shouldApplyChanges = filteredTerms.some(filteredTerm => {
        return filteredTerm.id === term.id || 
               filteredTerm.interlex_id === term.interlex_id ||
               filteredTerm['@id'] === term['@id'];
      });
      
      if (!shouldApplyChanges) {
        return term; // Return unchanged if not in filtered terms
      }
      
      // Apply changes to this term
      const updatedTerm = { ...term };
      
      attributes.forEach((attr) => {
        if (attr.attribute && attr.value) {
          // Apply the change based on the condition
          if (attr.condition === 'add') {
            // For add operation, append to existing value or set new value
            const currentValue = updatedTerm[attr.attribute] || '';
            updatedTerm[attr.attribute] = currentValue ? `${currentValue}, ${attr.value}` : attr.value;
          } else if (attr.condition === 'delete') {
            // For delete operation, remove the value
            const currentValue = updatedTerm[attr.attribute] || '';
            updatedTerm[attr.attribute] = currentValue.replace(attr.value, '').replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '');
          } else if (attr.condition === 'replace') {
            // For replace operation, set the new value
            updatedTerm[attr.attribute] = attr.value;
          }
        }
      });
      
      return updatedTerm;
    });
    
    // Update the ontology terms with the new values
    console.log('Applying changes to', filteredTerms.length, 'filtered terms');
    console.log('Updated terms count:', updatedTerms.length);
    
    if (onTermsUpdate) {
      onTermsUpdate(updatedTerms);
      console.log('Terms updated via onTermsUpdate');
    } else {
      console.warn('onTermsUpdate function not available');
    }
  }, [attributes, filteredTerms, ontologyTerms, onTermsUpdate]);

  // Handle undo last changes
  const handleUndo = React.useCallback(() => {
    if (undoHistory.length === 0) {
      console.log('No undo history available');
      return;
    }
    
    const lastSnapshot = undoHistory[undoHistory.length - 1];
    console.log('Undoing changes, restoring:', lastSnapshot.terms.length, 'terms');
    
    if (onTermsUpdate) {
      onTermsUpdate(lastSnapshot.terms);
      console.log('Terms updated via onTermsUpdate');
    } else {
      console.warn('onTermsUpdate function not available');
    }
    
    // Remove the last snapshot from history
    setUndoHistory(prev => prev.slice(0, -1));
  }, [undoHistory, onTermsUpdate]);

  return (
    <Box className='edit-terms' display="flex" justifyContent="space-between" height={1}>
        <Box padding={'2.25rem 3.25rem 2.5rem 2rem'} sx={{
          width: open ? 'calc(100% - 42.0625rem)' : 'calc(100% - 5.75rem)',
          transition: 'all 0.5s ease',
          overflowX: 'auto',
          overflowY: 'auto',
          minWidth: 0, // Allow flex child to shrink
          height: '100%', // Take full height of parent
          display: 'flex',
          flexDirection: 'column',
        }}>
          <TermsTable
            setOpenEditAttributes={setOpen}
            setAttributes={setAttributes}
            attributes={attributes}
            ontologyTerms={filteredTerms}
            dynamicColumns={ontologyAttributes}
            onTermsUpdate={(updatedFiltered) => {
              if (!onTermsUpdate) return;
              const byIri = {};
              updatedFiltered.forEach(t => { byIri[t['@id']] = t; });
              onTermsUpdate(ontologyTerms.map(t => byIri[t['@id']] || t));
            }}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            borderLeft: `1px solid ${gray200}`,
            transition: 'all 0.5s ease',
            p: '1.5rem',
            width: open ? '42.0625rem' : '5.75rem',
            '::-webkit-scrollbar': {
              display: 'none',
            },
            scrollbarWidth: 'none',
          }}
        >
          {open ? (
            <Box width={1} display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: gray800 }}>Edit bulk attributes</Typography>
              <Tooltip title='Close edit bulk attributes'>
                <IconButton onClick={() => setOpen(!open)} sx={{ border: `1px solid ${gray200}`, color: gray700 }}>
                  <StartOutlined />
                </IconButton>
              </Tooltip>
            </Box>
          ) : (
            <Box display="flex" justifyContent="flex-end">
              <Tooltip title='Open edit bulk attributes'>
                <IconButton onClick={() => setOpen(!open)} sx={{ border: `1px solid ${gray200}`, color: gray700 }}>
                  <EditNoteOutlined />
                </IconButton>
              </Tooltip>
              
            </Box>
          )}
          {open && (
            <EditBulkAttributesForm 
              columns={ontologyAttributes.length > 0 ? ontologyAttributes : SearchTermsData.termsColumns} 
              attributes={attributes} 
              setAttributes={setAttributes} 
              initialAttributesValue={initialAttributesValue}
              onApplyChanges={handleApplyChanges}
              onUndo={handleUndo}
              canUndo={undoHistory.length > 0}
            />
          )}
        </Box>
    </Box>
  );
};

EditTerms.propTypes = {
  searchConditions: PropTypes.array.isRequired,
  ontologyTerms: PropTypes.array.isRequired,
  ontologyAttributes: PropTypes.array.isRequired,
  onTermsUpdate: PropTypes.func
};

export default EditTerms;
