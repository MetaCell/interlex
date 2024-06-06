import CustomizedDialog from "../../common/CustomizedDialog";
import {Box, Divider, FormControl, MenuItem, Select} from "@mui/material";
import Typography from "@mui/material/Typography";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Button from "@mui/material/Button";
import PlaylistAddOutlinedIcon from "@mui/icons-material/PlaylistAddOutlined";
import * as React from "react";
import {vars} from "../../../theme/variables";

const {gray600, gray700, gray300} = vars

const types = [
  'Is part of',
  'Related to',
  'Has Dbx ref',
  'Has exact synonym'
]
const HeaderRightSideContent = ({handleClose}) => {
  return (
    <Box display='flex' alignItems='center' gap='.75rem'>
      <Button  variant='outlined' onClick={handleClose}>
        Cancel
      </Button>
      <Button startIcon={<PlaylistAddOutlinedIcon />} variant='contained' color='primary' onClick={handleClose}>
        Add new predicate(s)
      </Button>
    </Box>
  )
}
const AddPredicateDialog = ({open, handleClose}) => {
  return (
    <CustomizedDialog title='Add new predicate(s)' open={open} handleClose={handleClose} HeaderRightSideContent={<HeaderRightSideContent handleClose={handleClose} />}>
      inputs
    </CustomizedDialog>
  )
}

export default AddPredicateDialog