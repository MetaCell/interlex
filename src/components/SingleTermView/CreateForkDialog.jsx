import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import CustomizedDialog from "../common/CustomizedDialog";
import FeatureNotAvailableDialog from "../common/FeatureNotAvailableDialog";
import { Box, Button, Grid, Typography, CircularProgress, Alert } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { createFork } from "../../api/endpoints/apiService";

import { vars } from "../../theme/variables";
const { gray800, gray600, gray500 } = vars;

const HeaderRightSideContent = ({ handleClose, onSaveFork, isSaving }) => (
  <Box display='flex' alignItems='center' gap={1.5}>
    <Button sx={{ p: '0.625rem 0.875rem', minWidth: '0.0625rem' }} variant="outlined" onClick={handleClose} disabled={isSaving}>Cancel</Button>
    <Button sx={{ p: '0.625rem 0.875rem', minWidth: '0.0625rem' }} variant='contained' onClick={onSaveFork} disabled={isSaving}>
      {isSaving ? <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} /> : null}
      Create a fork
      <ArrowForwardIcon />
    </Button>
  </Box>
);

HeaderRightSideContent.propTypes = {
  handleClose: PropTypes.func,
  onSaveFork: PropTypes.func,
  isSaving: PropTypes.bool,
};

const CreateForkDialog = ({ open, handleClose, user, searchTerm, termLabel, group }) => {
  const navigate = useNavigate();
  const [ownerNotSupportedOpen, setOwnerNotSupportedOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const groupname = user?.groupname || '';
  const displayLabel = termLabel || searchTerm || '';

  const handleSaveFork = async () => {
    if (!groupname || !searchTerm) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const result = await createFork(groupname, searchTerm, group || 'base', displayLabel);
      if (result.ok) {
        handleClose();
        navigate(`/${groupname}/${searchTerm}/overview`);
      } else {
        setSaveError(`Fork creation failed (status ${result.status}). Please try again.`);
      }
    } catch (e) {
      setSaveError(e?.message || 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <CustomizedDialog
        title='Create a fork'
        open={open}
        handleClose={handleClose}
        sx={{ '& .MuiDialogContent-root': { overflowY: 'hidden' } }}
        HeaderRightSideContent={
          <HeaderRightSideContent
            handleClose={handleClose}
            onSaveFork={handleSaveFork}
            isSaving={isSaving}
          />
        }
      >
        <Box width={705}>
          <Typography color={gray800} fontSize='1.125rem' fontWeight={600} mb='2.75rem'>
            Fork &quot;{displayLabel}&quot; under your account
          </Typography>

          {saveError && (
            <Alert severity="error" sx={{ mb: '1.5rem' }}>{saveError}</Alert>
          )}

          <Grid container spacing='1.75rem' alignItems='flex-start'>
            <Grid item xs={12} lg={5}>
              <Box display="flex" justifyContent="space-between" mb='.75rem'>
                <Typography sx={{ fontSize: '1rem', fontWeight: '500', color: gray800 }}>
                  Owner
                </Typography>
                <Typography variant="body1" sx={{ color: gray600 }}>Required</Typography>
              </Box>
              <Box
                onClick={() => setOwnerNotSupportedOpen(true)}
                sx={{
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'grey.50',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography sx={{ color: gray800, fontSize: '1rem' }}>{groupname}</Typography>
                <Typography sx={{ color: gray500, fontSize: '0.75rem' }}>▼</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} lg={1}>
              <Box textAlign='center' mt='2rem'>
                <Typography variant="body1" fontSize='1.875rem' sx={{ color: gray500 }}>/</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Typography color={gray800} fontSize='1rem' fontWeight={500} mb='1.25rem'>
                Fork name
              </Typography>
              <Typography color={gray800} fontSize='1rem' fontWeight={400}>
                {displayLabel}
              </Typography>
            </Grid>
          </Grid>

          <Typography color={gray600} fontSize='1rem' fontWeight={400} mt='2.75rem'>
            The fork will be created under your account with the same term identifier.
          </Typography>
        </Box>
      </CustomizedDialog>

      <FeatureNotAvailableDialog
        open={ownerNotSupportedOpen}
        onClose={() => setOwnerNotSupportedOpen(false)}
        title='Custom fork owner not supported'
        message='Selecting a different fork owner is not yet supported. Forks can only be created under your own account.'
      />
    </>
  );
};

CreateForkDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  user: PropTypes.object,
  searchTerm: PropTypes.string,
  termLabel: PropTypes.string,
  group: PropTypes.string,
};

export default CreateForkDialog;
