import PropTypes from "prop-types";
import React, {useState} from "react";
import TermsTable from "./TermsTable";
import EditBulkAttributesForm from "./EditBulkAttributesForm";
import {Box, IconButton, Tooltip, Typography} from "@mui/material";
import SearchTermsData from "../../../static/SearchTermsData.json";
import {EditNoteOutlined, StartOutlined} from "@mui/icons-material";

import { vars } from "../../../theme/variables";
const { gray200, gray800,gray700 } = vars;

const EditTerms = ({searchConditions}) => {
  const initialAttributesValue = { attribute: '', condition: 'add', value: '' }
  const [open, setOpen] = React.useState(false);
  const [attributes, setAttributes] = useState([initialAttributesValue]);

  return (
    <Box className='edit-terms' display="flex" justifyContent="space-between" height={1}>
        <Box padding={'2.25rem 3.25rem 2.5rem 0'} sx={{
          width: open ? 'calc(100% - 42.0625rem)' : 'calc(100% - 5.75rem)',
          transition: 'all 0.5s ease',
        }}>
          <TermsTable
            columns={SearchTermsData.termsColumns}
            setOpenEditAttributes={setOpen}
            setAttributes={setAttributes}
            attributes={attributes}
            searchConditions={searchConditions}
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
              <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: gray800 }}>Edit bulk arrtibutes</Typography>
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
            <EditBulkAttributesForm columns={SearchTermsData.termsColumns} attributes={attributes} setAttributes={setAttributes} initialAttributesValue={initialAttributesValue} />
          )}
        </Box>
    </Box>
  );
};

EditTerms.propTypes = {
  searchConditions: PropTypes.array.isRequired
};

export default EditTerms;
