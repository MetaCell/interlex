import {Box, IconButton, Typography} from "@mui/material";
import { vars } from "../../theme/variables";
import TermsTable from "./TermsTable";
import React, {useState} from "react";
import {EditNoteOutlined, StartOutlined} from "@mui/icons-material";
import EditBulkAttributesForm from "./EditBulkAttributesForm";
import SearchTermsData from "../../static/SearchTermsData.json";
const { gray200, gray800,gray700 } = vars;
const EditTerms = () => {
  const [open, setOpen] = React.useState(false);
  const [attributes, setAttributes] = useState([{ attribute: '', condition: 'add', value: '' }]);

  return (
    <Box className='edit-terms' display="flex" justifyContent="space-between" height={1}>
       <Box padding={'2.25rem 3.25rem 2.5rem 3.25rem'} sx={{
         width: open ? 'calc(100% - 42.0625rem)' : 'calc(100% - 5.75rem)',
         transition: 'all 0.5s ease',
       }}>
         <Typography color={gray800} fontSize='1.125rem' fontWeight={600} mb='2.75rem'>
           Edit your terms or select an header to bulk edit that property
         </Typography>
         <TermsTable
           columns={SearchTermsData.termsColumns}
           setOpenEditAttributes={setOpen}
           setAttributes={setAttributes}
           attributes={attributes}
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
              <IconButton onClick={() => setOpen(!open)} sx={{ border: `1px solid ${gray200}`, color: gray700 }}>
                <StartOutlined />
              </IconButton>
            </Box>
          ) : (
            <Box display="flex" justifyContent="flex-end">
              <IconButton onClick={() => setOpen(!open)} sx={{ border: `1px solid ${gray200}`, color: gray700 }}>
                <EditNoteOutlined />
              </IconButton>
            </Box>
          )}
          {open && (
            <EditBulkAttributesForm columns={SearchTermsData.termsColumns} attributes={attributes} setAttributes={setAttributes} />
          )}
        </Box>
    </Box>
  );
};

export default EditTerms;
