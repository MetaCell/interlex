import {Box, Button} from "@mui/material";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import CustomizedDialog from "../common/CustomizedDialog";
import {useState} from "react";

const Dashboard = () => {
  const [openEditBulkTerms, setOpenEditBulkTerms] = useState(false)
  
  const handleCloseEditBulkTerms = () => {
    setOpenEditBulkTerms(false)
  }
  const handleOpenEditBulkTerms = () => {
    setOpenEditBulkTerms(true)
  }
  return (
    <Box p="1.5rem 5rem 0rem 5rem">
      <Button type="string" color="secondary" startIcon={<ModeEditOutlineOutlinedIcon />} onClick={handleOpenEditBulkTerms}>
        Edit bulk terms
      </Button>
      <CustomizedDialog
        title='Edit bulk terms - Conditional search for term selection'
        open={openEditBulkTerms}
        handleClose={handleCloseEditBulkTerms}
      />
    </Box>
  )
}

export default Dashboard