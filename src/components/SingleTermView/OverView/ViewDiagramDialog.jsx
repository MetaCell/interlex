import CustomizedDialog from "../../common/CustomizedDialog";
import {Box, Divider} from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import PlaylistAddOutlinedIcon from "@mui/icons-material/PlaylistAddOutlined";
import * as React from "react";
import {vars} from "../../../theme/variables";
import AddPredicateDialog from "./AddPredicateDialog";
import {useState} from "react";
import CustomSingleSelect from "../../common/CustomSingleSelect";
import Graph from "../../GraphViewer/Graph";

const {gray600, gray700} = vars
const HeaderRightSideContent = ({handleOpenAddPredicate, selectedItem, predicates}) => {
  const [type, setType] = React.useState(selectedItem?.title);
  const [count, setCount] = React.useState(selectedItem?.count)
  const handleChangeType = (value) => {
    setType(value)
    const selectedTypeCount = predicates.find(predicate => predicate.title === e.target.value).count
    setCount(selectedTypeCount)
  }
  const options = predicates.map(row => ({
    label: row.title,
    value: row.title
  }))
  return (
    <Box display='flex' alignItems='center'>
      <Typography color={gray700} fontSize='.875rem' mr='1.5rem'>
        Number of this type: {count}
      </Typography>
      <Typography variant="caption" sx={{ fontSize: '0.875rem', color: gray600, mr: '.5rem' }}>Predicate type:</Typography>
      <CustomSingleSelect
        value={type}
        onChange={handleChangeType}
        options={options}
      />
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
        <Graph width={1200} height={600} />
      </CustomizedDialog>
      <AddPredicateDialog open={openAddPredicate} handleClose={handleCloseAddPredicate} image={image} />
    </>
    
  )
}

export default ViewDiagramDialog