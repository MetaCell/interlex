import { useState } from "react";
import {useQuery} from "../../../helpers";
import {Box, Grid, Button} from "@mui/material";
import Typography from "@mui/material/Typography";
import PredicateGroupInput from "./PredicateGroupInput";
import CustomizedInput from "../../common/CustomizedInput";
import CustomizedDialog from "../../common/CustomizedDialog";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CustomSingleSelect from "../../common/CustomSingleSelect";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddPredicateStatusDialog from "./AddPredicateStatusDialog";
import PlaylistAddOutlinedIcon from "@mui/icons-material/PlaylistAddOutlined";
import PropTypes from "prop-types";

import {vars} from "../../../theme/variables";
const {gray800} = vars;

const HeaderRightSideContent = ({handleClose, handleOpenAddPredicateStatusDialog, isAllFieldsFilled}) => {
  return (
    <Box display='flex' alignItems='center' gap='.75rem'>
      <Button variant='outlined' onClick={handleClose}>
        Cancel
      </Button>
      <Button
        startIcon={<PlaylistAddOutlinedIcon />}
        variant='contained'
        color='primary'
        onClick={handleOpenAddPredicateStatusDialog}
        disabled={!isAllFieldsFilled}
      >
        Add new predicate(s)
      </Button>
    </Box>
  );
};

HeaderRightSideContent.propTypes = {
  handleClose: PropTypes.func.isRequired,
  handleOpenAddPredicateStatusDialog: PropTypes.func.isRequired,
  isAllFieldsFilled: PropTypes.bool.isRequired
};

const AddPredicateDialog = ({ open, handleClose, image, predicates: fetchedPredicated }) => {
  const [openAddPredicateStatusDialog, setOpenAddPredicateStatusDialog] = useState(false);
  const query = useQuery();
  const storedSearchTerm = query.get('searchTerm');
  const [predicates, setPredicates] = useState([{ subject: storedSearchTerm, predicate: '', object: { type: 'Object', value: '', isLink: false } }]);
  const handleCloseAddPredicateStatusDialog = () => {
    setOpenAddPredicateStatusDialog(false);
  };
  
  const handleOpenAddPredicateStatusDialog = () => {
    setOpenAddPredicateStatusDialog(true);
  };
  
  const handleAddPredicate = () => {
    setPredicates([...predicates, { subject: storedSearchTerm, predicate: '', object: { type: 'Object', value: '', isLink: false } }]);
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
  
  const isAllFieldsFilled = (data) => {
    for (const item of data) {
      if (!item.predicate || !item.object.value) {
        return false;
      }
    }
    return true;
  }

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
            isAllFieldsFilled={isAllFieldsFilled(predicates)}
          />
        }
      >
        <Box padding={'2.25rem 3.25rem 2.5rem 3.25rem'}>
          <Typography color={gray800} fontSize='1.125rem' fontWeight={600} mb='2.75rem'>
            Add predicate(s) to {storedSearchTerm}
          </Typography>
          {predicates.map((predicate, index) => (
            <Grid container spacing='1.75rem' mb='2rem' key={index} alignItems='end'>
              <Grid item xs={12} lg={3}>
                <CustomizedInput
                  value={predicate.subject}
                  label='Subject'
                  placeholder='Subject term'
                  onChange={(e) => handlePredicateChange(index, 'subject', e.target.value)}
                  disabled={true}
                />
              </Grid>
              <Grid item xs={12} lg={3}>
                <Typography sx={{
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: gray800,
                  mb: '.75rem'
                }}>
                  Predicate
                </Typography>
                <CustomSingleSelect
                  value={predicate.predicate}
                  onChange={(v) => handlePredicateChange(index, 'predicate', v)}
                  options={fetchedPredicated}
                  isFormControlFullWidth={true}
                />
              </Grid>
              <Grid item xs={12} lg={predicates.length > 1 ? 5 : 6}>
                <PredicateGroupInput
                  predicate={predicate}
                  onChange={(value) => handlePredicateChange(index, 'object', value)}
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
        storedSearchTerm={storedSearchTerm}
      />
    </>
  );
};

AddPredicateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  image: PropTypes.string,
  predicates: PropTypes.array.isRequired
};

export default AddPredicateDialog;
