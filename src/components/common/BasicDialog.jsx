import PropTypes from "prop-types";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

import { vars } from "../../theme/variables";
const { gray400, gray600 } = vars;

const BasicDialog = ({ open, title, handleClose, children, sx }) => {

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      sx={sx}
    >
      <DialogTitle sx={{ color: gray600 }}>{title}</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{
          position: 'absolute',
          right: 24,
          top: 16,
          color: gray400,
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        {children}
      </DialogContent>
    </Dialog>
  );
};

BasicDialog.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  sx: PropTypes.object,
};

export default BasicDialog;