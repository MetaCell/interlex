import {Box} from "@mui/material";
import { useState } from "react";
import EditBulkTermsDialog from "./EditBulkTerms/EditBulkTermsDialog";
import Variants from "./Variants";
import TermsChange from "./TermsChange";
import Organizations from "./Organizations";
import User from "./User";
const Dashboard = () => {
  const [openEditBulkTerms, setOpenEditBulkTerms] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  const handleCloseEditBulkTerms = () => {
    setOpenEditBulkTerms(false);
    setActiveStep(0);
  };
  const handleOpenEditBulkTerms = () => {
    setOpenEditBulkTerms(true);
  };
  
  return (
    <Box flex={1} display='flex' flexDirection='column'>
      <User />
      <Box flexGrow={1} overflow='auto'>
        <Variants handleOpenEditBulkTerms={handleOpenEditBulkTerms} />
        <TermsChange />
        <Organizations />
      </Box>
      <EditBulkTermsDialog handleClose={handleCloseEditBulkTerms} open={openEditBulkTerms} activeStep={activeStep} setActiveStep={setActiveStep} />
    </Box>
  );
};

export default Dashboard;
