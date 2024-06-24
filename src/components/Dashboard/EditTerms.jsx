import {Box, IconButton, Typography} from "@mui/material";
import {vars} from "../../theme/variables";
import TermsTable from "./TermsTable";
import {CollapseIcon, ExpandIcon} from "../../Icons";
import React from "react";

const { gray200, gray600, gray800, brand700, brand800 } = vars;

const EditTerms = () => {
  const [open, setOpen] = React.useState(false);
  
  return (
    <Box display="flex">
      <Box flexGrow={1}>
        <Typography color={gray800} fontSize='1.125rem' fontWeight={600} mb='2.75rem'>
          Edit your terms or select an header to bulk edit that property
        </Typography>
        <TermsTable />
      </Box>
    </Box>
  )
}

export default EditTerms
