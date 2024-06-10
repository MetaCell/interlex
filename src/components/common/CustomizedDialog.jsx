import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import {Box, Divider, Slide} from "@mui/material";
import {vars} from "../../theme/variables";
const {gray600} = vars

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CustomizedDialog = ({children, title, open, handleClose, HeaderRightSideContent}) => {
 
  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={open}
      fullScreen
      TransitionComponent={Transition}
    >
      <Box
        sx={{
          m: 0,
          p: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        id="customized-dialog-title">
       <Box sx={{
         display: 'flex',
         alignItems: 'center',
       }}>
         <IconButton
           aria-label="close"
           onClick={handleClose}
         >
           <CloseIcon />
         </IconButton>
         <Divider orientation="vertical" flexItem sx={{
           margin: '0 1.5rem'
         }} />
         <Typography fontWeight={500} fontSize='1.25rem' color={gray600}>
           {title}
         </Typography>
       </Box>
        {
          HeaderRightSideContent && <HeaderRightSideContent />
        }
      </Box>
      <DialogContent dividers>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export default CustomizedDialog