import CustomizedDialog from "../../common/CustomizedDialog";
import {Box, Divider, FormControl, MenuItem, Select} from "@mui/material";
import Typography from "@mui/material/Typography";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Button from "@mui/material/Button";
import PlaylistAddOutlinedIcon from "@mui/icons-material/PlaylistAddOutlined";
import * as React from "react";
import {vars} from "../../../theme/variables";
import AddPredicateDialog from "./AddPredicateDialog";
import {useState} from "react";

const {gray600, gray700, gray300} = vars
const HeaderRightSideContent = ({handleOpenAddPredicate, selectedItem, predicates}) => {
  const [type, setType] = React.useState(selectedItem?.title);
  const [count, setCount] = React.useState(selectedItem?.count)
  const handleChangeType = (e) => {
    setType(e.target.value)
    const selectedTypeCount = predicates.find(predicate => predicate.title === e.target.value).count
    setCount(selectedTypeCount)
  }
  return (
    <Box display='flex' alignItems='center'>
      <Typography color={gray700} fontSize='.875rem' mr='1.5rem'>
        Number of this type: {count}
      </Typography>
      <Typography variant="caption" sx={{ fontSize: '0.875rem', color: gray600, mr: '.5rem' }}>Predicate type:</Typography>
      <FormControl sx={{ minWidth: 75 }}>
        <Select
          value={type}
          onChange={handleChangeType}
          displayEmpty
          IconComponent={KeyboardArrowDownIcon}
          sx={{
            color: gray700,
            borderRadius: '0.5rem !important',
            fontSize: '0.875rem',
            fontWeight: 600,
            '& .MuiOutlinedInput-input': {
              padding: '0.625rem 0.875rem'
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: gray300
            },
            '& .MuiSvgIcon-root': {
              color: gray700,
              fontSize: '1.25rem',
              right: '0.875rem !important'
            }
          }}
        >
          {
            predicates.map((predicate, i) => <MenuItem key={i} value={predicate.title}>{predicate.title}</MenuItem>)
          }
        </Select>
      </FormControl>
      <Divider orientation="vertical" flexItem sx={{
        m: '0 1rem'
      }} />
      <Button
        onClick={handleOpenAddPredicate}
        startIcon={<PlaylistAddOutlinedIcon />}
        sx={{ p: '0.625rem 0.5625rem', minWidth: '0.0625rem' }}
        variant='text'
        color='secondary'
      >
        Add new predicate(s)
      </Button>
    </Box>
  )
}
const ViewDiagramDialog = ({open, handleClose, image, selectedItem, predicates}) => {
  const [openAddPredicate, setOpenAddPredicate] = useState(false)
  
 const handleCloseAddPredicate = () => {
    setOpenAddPredicate(false)
  }
 const handleOpenAddPredicate = () => {
    setOpenAddPredicate(true)
  }

  return (
    <>
      <CustomizedDialog
        title='View predicate'
        open={open}
        handleClose={handleClose}
        HeaderRightSideContent={<HeaderRightSideContent
        selectedItem={selectedItem}
        handleOpenAddPredicate={handleOpenAddPredicate}
        predicates={predicates}
        />
      }
      >
        Diagram
      </CustomizedDialog>
      <AddPredicateDialog open={openAddPredicate} handleClose={handleCloseAddPredicate} image={image} />
    </>
    
  )
}

export default ViewDiagramDialog