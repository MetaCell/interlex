import PropTypes from "prop-types";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const ExistingForkDialog = ({ open, handleClose, groupname, termLabel, onUseExisting, onStartFromScratch }) => (
  <Dialog
    open={open}
    onClose={handleClose}
    aria-labelledby="existing-fork-dialog-title"
    aria-describedby="existing-fork-dialog-description"
    maxWidth="sm"
    fullWidth
  >
    <DialogTitle id="existing-fork-dialog-title">You already have a fork of this term</DialogTitle>
    <DialogContent>
      <DialogContentText id="existing-fork-dialog-description">
        &quot;{termLabel}&quot; is already forked under {groupname}. Continue working on that fork, or start
        a scratch version from the current curated term instead.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button variant="outlined" onClick={handleClose}>Cancel</Button>
      <Button variant="outlined" onClick={onStartFromScratch}>Start from scratch</Button>
      <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={onUseExisting}>
        Use existing fork
      </Button>
    </DialogActions>
  </Dialog>
);

ExistingForkDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  groupname: PropTypes.string,
  termLabel: PropTypes.string,
  onUseExisting: PropTypes.func.isRequired,
  onStartFromScratch: PropTypes.func.isRequired,
};

export default ExistingForkDialog;
