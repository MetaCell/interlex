import CustomizedDialog from "../../common/CustomizedDialog";
import {Box, Divider, FormControl, MenuItem, Select} from "@mui/material";
import Typography from "@mui/material/Typography";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Button from "@mui/material/Button";
import PlaylistAddOutlinedIcon from "@mui/icons-material/PlaylistAddOutlined";
import * as React from "react";
import {vars} from "../../../theme/variables";
import {AddedSuccessfully, BackgroundPattern} from "../../../Icons";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
const {gray600, gray700, gray900} = vars

const HeaderRightSideContent = ({handleClose, handleCloseAddpredicate}) => {
  return (
    <Box display='flex' alignItems='center' gap='.75rem'>
      <Button variant='contained' color='primary' onClick={() => {
        handleCloseAddpredicate()
        handleClose()
      }}>
        Finish
      </Button>
    </Box>
  )
}
const AddPredicateStatusDialog = ({open, handleClose, handleCloseAddpredicate}) => {
  return (
    <CustomizedDialog title='Add new predicate(s)' open={open} handleClose={handleClose} HeaderRightSideContent={<HeaderRightSideContent handleClose={handleClose} handleCloseAddpredicate={handleCloseAddpredicate} />}>
      <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' height='100%'>
        <Box>
          <AddedSuccessfully />
        </Box>
        <Typography mt='1.25rem' mb='.75rem' color={gray900} fontSize='1.25rem' fontWeight={600}>Predicate(s) successfully added</Typography>
        <Typography mb='2rem'  color={gray600} fontSize='1rem'>Your term “Central nervous system” has new predicate(s).</Typography>
        <Box>
          <Button type='text'>Undo</Button>
          <Button
            startIcon={<AddOutlinedIcon />}
            variant='outlined'
            onClick={handleClose}
          >
            Add new predicate(s)
          </Button>
        </Box>
      </Box>
    </CustomizedDialog>
  )
}

export default AddPredicateStatusDialog