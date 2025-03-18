import { useState } from "react";
import PropTypes from "prop-types";
import StatusDialog from "../common/StatusDialog";
import CustomizedDialog from "../common/CustomizedDialog";
import { Box, Button, Grid, Typography } from "@mui/material";
import CustomSingleSelect from "../common/CustomSingleSelect";
import SearchTermsData from "../../static/SearchTermsData.json"
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { vars } from "../../theme/variables";
const { gray800, gray600, gray500, gray700 } = vars;

const HeaderRightSideContent = ({ handleClose, onSaveFork }) => {
  return (
      <Box display='flex' alignItems='center' gap={1.5}>
          <Button sx={{ p: '0.625rem 0.875rem', minWidth: '0.0625rem' }} variant="outlined" onClick={handleClose}>Cancel</Button>
          <Button sx={{ p: '0.625rem 0.875rem', minWidth: '0.0625rem' }} variant='contained' onClick={onSaveFork}>
              Create a fork
              <ArrowForwardIcon />
          </Button>
      </Box>
  )
}

HeaderRightSideContent.propTypes = {
  handleClose: PropTypes.func,
  onSaveFork: PropTypes.func
}

// eslint-disable-next-line no-unused-vars
const CreateForkDialog = ({ formState, open, handleClose, onInputChange }) => {
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [newTerm, setNewTerm] = useState('label')
    const handleSaveFork = () => {
      setOpenStatusDialog(true);
      handleClose()
    }
    const handleTermChange = (index, field, value) => {
      // newTerms[index][field] = value;
      setNewTerm(value)
    };
    const updatedColumnsArray = SearchTermsData.termsColumns.map(item => ({
      ...item,
      value: item.id
    }));
    const handleCloseStatusDialog = () => {
      setOpenStatusDialog(false)
    }
    const handleStatusDialogActionButtonClick = () => {
      setOpenStatusDialog(false);
    }
    return (
      <>
        <CustomizedDialog
          title='Create a fork'
          open={open}
          handleClose={handleClose}
          sx={{ '& .MuiDialogContent-root': { overflowY: "hidden" } }}
          HeaderRightSideContent={
            <HeaderRightSideContent
              handleClose={handleClose}
              onSaveFork={handleSaveFork}
          />
          }
        >
        <Box width={705}>
          <Typography color={gray800} fontSize='1.125rem' fontWeight={600} mb='2.75rem'>
            Add a fork to Central Nervous System
          </Typography>
          <Grid container spacing='1.75rem' alignItems={'flex-start'}>
            <Grid item xs={12} lg={5}>
              <Box display="flex" justifyContent="space-between">
                <Typography sx={{
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: gray800,
                  mb: '.75rem'
                }}>
                  Owner
                </Typography>
                <Typography variant="body1" sx={{ color: gray600 }}>Required</Typography>
              </Box>
              <CustomSingleSelect
                isFormControlFullWidth={true}
                options={updatedColumnsArray}
                placeholder='Select fork owner'
                value={newTerm}
                onChange={handleTermChange}
              />
            </Grid>
            <Grid item xs={12} lg={1}>
              <Box textAlign={'center'} mt="2rem">
                <Typography variant="body1" fontSize='1.875rem' sx={{ color: gray500 }}>/</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Box>
                <Typography color={gray800} fontSize='1rem' fontWeight={500} mb='1.25rem'>
                  Fork name
                </Typography>
              </Box>
              <Box>
                <Typography color={gray700} fontSize='1rem' fontWeight={400}>
                  Central nervous system
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Typography color={gray600} fontSize='1rem' fontWeight={400} mt='2.75rem'>
            By default the fork name is the same as the curated. It’s possible to personalise it.
          </Typography>
        </Box>
        </CustomizedDialog>
        <StatusDialog
          open={openStatusDialog}
          handleClose={handleCloseStatusDialog}
          title={"Create a fork"}
          message={"Fork successfully created"}
          subMessage={"Your fork of “Nervous system” has been created. "}
          finishButtonTitle={"Go to fork"}
          handleActionButtonClick={handleStatusDialogActionButtonClick}
          finishButtonEndIcon={<ArrowForwardIcon />}
        />
      </>
    );
};

CreateForkDialog.propTypes = {
  formState: PropTypes.object,
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  onInputChange: PropTypes.func
}

export default CreateForkDialog;
