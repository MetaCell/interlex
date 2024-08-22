import * as React from "react";
import { vars } from "../../theme/variables";
import CustomizedDialog from "../common/CustomizedDialog";
import { Box, Button } from "@mui/material";
import StatusDialog from "../common/StatusDialog";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const { gray100, gray200, gray400, brand700 } = vars;

const HeaderRightSideContent = ({ handleClose, onSaveFork }) => {
  return (
      <Box display='flex' alignItems='center' gap={1.5}>
          <Button sx={{ p: '0.625rem 0.875rem', minWidth: '0.0625rem' }} variant="outlined" onClick={handleClose}>Cancel</Button>
          <Button sx={{ p: '0.625rem 0.875rem', minWidth: '0.0625rem' }} variant='contained' onClick={onSaveFork}>
              Save curies
              <ArrowForwardIcon />
          </Button>
      </Box>
  )
}

const CreateForkDialog = ({ open, handleClose }) => {
  const [openStatusDialog, setOpenStatusDialog] = React.useState(false);

    const handleSaveFork = () => {
      setOpenStatusDialog(true);
      handleClose()
    }

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
            sx={{ '& .MuiDialogContent-root': { padding: 0, overflowY: "hidden" } }}
            HeaderRightSideContent={
              <HeaderRightSideContent
                  handleClose={handleClose}
                  onSaveFork={handleSaveFork}
              />
          }
        >
            hi
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

export default CreateForkDialog;
