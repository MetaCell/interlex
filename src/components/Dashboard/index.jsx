import {Box} from "@mui/material";
import { useState } from "react";
import EditBulkTermsDialog from "./EditBulkTerms/EditBulkTermsDialog";
import Variants from "./Variants";
import Ontologies from "./Ontologies";
import TermsChange from "./TermsChange";
import Organizations from "./Organizations";
import User from "./User";
import SectionSideNav from "../common/SectionSideNav";

// Ids are set on the wrappers below; labels match each section's heading.
const SIDE_NAV_ITEMS = [
  { id: "dashboard-section-variants", label: "My term variants" },
  { id: "dashboard-section-ontologies", label: "My ontologies" },
  { id: "dashboard-section-pull-requests", label: "My Pull Requests" },
  { id: "dashboard-section-organizations", label: "My Organizations" },
];

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
        <SectionSideNav items={SIDE_NAV_ITEMS} />
        <Box id="dashboard-section-variants">
          <Variants handleOpenEditBulkTerms={handleOpenEditBulkTerms} />
        </Box>
        <Box id="dashboard-section-ontologies">
          <Ontologies />
        </Box>
        <Box id="dashboard-section-pull-requests">
          <TermsChange />
        </Box>
        <Box id="dashboard-section-organizations">
          <Organizations />
        </Box>
      </Box>
      <EditBulkTermsDialog handleClose={handleCloseEditBulkTerms} open={openEditBulkTerms} activeStep={activeStep} setActiveStep={setActiveStep} />
    </Box>
  );
};

export default Dashboard;
