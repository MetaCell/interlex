import CustomizedDialog from "../../common/CustomizedDialog";
import {Box, Grid, Button} from "@mui/material";
import Typography from "@mui/material/Typography";
import PlaylistAddOutlinedIcon from "@mui/icons-material/PlaylistAddOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {vars} from "../../../theme/variables";
import AddPredicateStatusDialog from "./AddPredicateStatusDialog";
import {useState} from "react";
import CustomizedInput from "../../common/CustomizedInput";
import PredicateGroupInput from "./PredicateGroupInput";

const {gray800} = vars;

const HeaderRightSideContent = ({handleClose, handleOpenAddPredicateStatusDialog}) => {
  return (
    <Box display='flex' alignItems='center' gap='.75rem'>
      <Button variant='outlined' onClick={handleClose}>
        Cancel
      </Button>
      <Button startIcon={<PlaylistAddOutlinedIcon />} variant='contained' color='primary' onClick={handleOpenAddPredicateStatusDialog}>
        Add new predicate(s)
      </Button>
    </Box>
  );
};

const AddPredicateDialog = ({open, handleClose, image}) => {
  const [openAddPredicateStatusDialog, setOpenAddPredicateStatusDialog] = useState(false);
  const [predicates, setPredicates] = useState([{ subject: '', object: '' }]);
  
  const handleCloseAddPredicateStatusDialog = () => {
    setOpenAddPredicateStatusDialog(false);
  };
  
  const handleOpenAddPredicateStatusDialog = () => {
    setOpenAddPredicateStatusDialog(true);
  };
  
  const handleAddPredicate = () => {
    setPredicates([...predicates, { subject: '', object: '' }]);
  };
  
  const handlePredicateChange = (index, field, value) => {
    const newPredicates = [...predicates];
    newPredicates[index][field] = value;
    setPredicates(newPredicates);
  };
  
  const handleDeletePredicate = (index) => {
    const newPredicates = predicates.filter((_, i) => i !== index);
    setPredicates(newPredicates);
  };
  
  return (
    <>
      <CustomizedDialog
        title='Add new predicate(s)'
        open={open}
        handleClose={handleClose}
        HeaderRightSideContent={
          <HeaderRightSideContent
            handleClose={handleClose}
            handleOpenAddPredicateStatusDialog={handleOpenAddPredicateStatusDialog}
          />
        }
      >
        <Box padding={'2.25rem 3.25rem 2.5rem 3.25rem'}>
          <Typography color={gray800} fontSize='1.125rem' fontWeight={600} mb='2.75rem'>
            Add predicate(s) to Central Nervous System
          </Typography>
          {predicates.map((predicate, index) => (
            <Grid container spacing='2.75rem' mb='2rem' key={index} alignItems='end'>
              <Grid item xs={12} lg={3}>
                <CustomizedInput
                  value={predicate.subject}
                  label='Subject'
                  placeholder='Subject term'
                  onChange={(e) => handlePredicateChange(index, 'subject', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} lg={predicates.length > 1 ? 5 : 6}>
                <PredicateGroupInput />
              </Grid>
              <Grid item xs={12} lg={3}>
                <CustomizedInput
                  value={predicate.object}
                  label='Object'
                  placeholder='Object term'
                  onChange={(e) => handlePredicateChange(index, 'object', e.target.value)}
                />
              </Grid>
              {predicates.length > 1 && (
                <Grid item lg={predicates.length > 1 ? 1 : 0}>
                  <Button sx={{
                    padding: '.625rem',
                    minWidth: 'auto'
                  }} variant='outlined' onClick={() => handleDeletePredicate(index)}>
                    <DeleteOutlineIcon />
                  </Button>
                </Grid>
              )}
            </Grid>
          ))}
          <Button
            startIcon={<AddOutlinedIcon />}
            variant='outlined'
            onClick={handleAddPredicate}
          >
            Add new predicate
          </Button>
        </Box>
      </CustomizedDialog>
      <AddPredicateStatusDialog
        open={openAddPredicateStatusDialog}
        handleClose={handleCloseAddPredicateStatusDialog}
        handleCloseAddpredicate={handleClose}
        image={image}
      />
    </>
  );
};

export default AddPredicateDialog;
