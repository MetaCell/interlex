import CustomizedDialog from "../../common/CustomizedDialog";
import {Box, Divider, FormControl, MenuItem, Select} from "@mui/material";
import Typography from "@mui/material/Typography";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Button from "@mui/material/Button";
import PlaylistAddOutlinedIcon from "@mui/icons-material/PlaylistAddOutlined";
import * as React from "react";
import {vars} from "../../../theme/variables";
import AddPredicateStatusDialog from "./AddPredicateStatusDialog";
import {useState} from "react";

const {gray600, gray700, gray300} = vars

const HeaderRightSideContent = ({handleClose, handleOpenAddPredicateStatusDialog}) => {
  return (
    <Box display='flex' alignItems='center' gap='.75rem'>
      <Button  variant='outlined' onClick={handleClose}>
        Cancel
      </Button>
      <Button startIcon={<PlaylistAddOutlinedIcon />} variant='contained' color='primary' onClick={handleOpenAddPredicateStatusDialog}>
        Add new predicate(s)
      </Button>
    </Box>
  )
}
const AddPredicateDialog = ({open, handleClose}) => {
  const [openAddPredicateStatusDialog, setOpenAddPredicateStatusDialog] = useState(false)
  const handleCloseAddPredicateStatusDialog = () => {
    setOpenAddPredicateStatusDialog(false)
  }
  
  const handleOpenAddPredicateStatusDialog = () => {
    setOpenAddPredicateStatusDialog(true)
  }
  return (
    <>
      <CustomizedDialog
        title='Add new predicate(s)'
        open={open} handleClose={handleClose}
        HeaderRightSideContent={
        <HeaderRightSideContent handleClose={handleClose} handleOpenAddPredicateStatusDialog={handleOpenAddPredicateStatusDialog} />
      }>
        inputs
      </CustomizedDialog>
      <AddPredicateStatusDialog open={openAddPredicateStatusDialog} handleClose={handleCloseAddPredicateStatusDialog} handleCloseAddpredicate={handleClose} />
    </>
  )
}

export default AddPredicateDialog