import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const FeatureNotAvailableDialog = ({ open, onClose, title = "Feature Not Yet Available", message = "This feature is not yet implemented. Please check back in a future update." }) => {
  const handleCreateIssue = () => {
    const issueTitle = encodeURIComponent(`Feature Request: ${title}`);
    const issueBody = encodeURIComponent(`**Feature Description:**
${message}

**Additional Context:**
Please describe what you would like to see implemented and any specific requirements or use cases.

**Priority:**
Please indicate the priority level (Low/Medium/High) and any business justification.
`);
    
    const githubUrl = `https://github.com/MetaCell/interlex/issues/new?title=${issueTitle}&body=${issueBody}&labels=enhancement`;
    window.open(githubUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="feature-not-available-dialog-title"
      aria-describedby="feature-not-available-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="feature-not-available-dialog-title">
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="feature-not-available-dialog-description" sx={{ mb: 2 }}>
          {message}
        </DialogContentText>
        
        <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
            Have feedback about this feature?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            We&apos;d love to hear your thoughts and suggestions! Click below to create a GitHub issue where you can share your ideas, requirements, or use cases.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<OpenInNewIcon />}
            onClick={handleCreateIssue}
            sx={{ textTransform: 'none' }}
          >
            Create GitHub Issue
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

FeatureNotAvailableDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string
};

export default FeatureNotAvailableDialog;