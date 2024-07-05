import {Box, Button} from "@mui/material";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import {useState} from "react";
import EditBulkTermsDialog from "./EditBulkTermsDialog";

const Dashboard = () => {
  const [openEditBulkTerms, setOpenEditBulkTerms] = useState(false)
  const [activeStep, setActiveStep] = useState(0);
  const handleCloseEditBulkTerms = () => {
    setOpenEditBulkTerms(false)
    setActiveStep(0)
  }
  const handleOpenEditBulkTerms = () => {
    setOpenEditBulkTerms(true)
  }
  return (
    <Box p="1.5rem 5rem 0rem 5rem">
      <Button type="string" color="secondary" startIcon={<ModeEditOutlineOutlinedIcon />} onClick={handleOpenEditBulkTerms}>
        Edit bulk terms
      </Button>
      <EditBulkTermsDialog handleClose={handleCloseEditBulkTerms} open={openEditBulkTerms} activeStep={activeStep} setActiveStep={setActiveStep} />
    </Box>
  )
}

export default Dashboard