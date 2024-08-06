import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { vars } from '../../theme/variables';

const { white, gray200, gray600, gray300, gray700, gray50, error600, error700 } = vars;

const commonBtnStyles = {
    padding: "0.625rem 0.875rem",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    minWidth: "13.125rem",
    boxShadow: "0px 1px 2px 0px rgba(16, 24, 40, 0.05)"
}

const styles = {
    root: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 480,
        border: `1px solid ${gray200}`,
        background: white,
        borderRadius: "0.5rem",
    },
    title: {
        fontSize: "1.25rem",
        color: gray600
    },
    description: {
        fontSize: "0.875rem",
        color: gray600
    },
    cancelBtn: {
        ...commonBtnStyles,
        border: `1px solid ${gray300}`,
        background: white,
        color: gray700,
        "&:hover": {
            background: gray50,
        },
        "&:focus": {
            boxShadow: "0px 1px 2px 0px rgba(16, 24, 40, 0.05), 0px 0px 0px 4px rgba(152, 162, 179, 0.14)"
        }
    },
    leaveBtn: {
        ...commonBtnStyles,
        background: error600,
        color: white,
        "&:hover": {
            background: error700,
            color: white
        },
        "&:focus": {
            background: error600,
            color: white,
            boxShadow: "0px 1px 2px 0px rgba(16, 24, 40, 0.05), 0px 0px 0px 4px rgba(240, 68, 56, 0.24)"
        }
    }
}

const LeaveModal = ({ open, handleClose }) => {

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <Box sx={styles.root}>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ padding: "1rem 1.5rem" }}>
                    <Typography id="modal-title" variant="h6" component="h2" sx={styles.title}>
                        Leave organization?
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 24,
                            top: 16,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Typography id="modal-description" sx={{ padding: "0.5rem 1.5rem 1rem 1.5rem", ...styles.description }}>
                    Are you sure you want to delete this post? This action cannot be undone. To be part of this organization again, you would have to send a new request to join.
                </Typography>
                <Box display="flex" justifyContent="space-between" sx={{ padding: "1rem 1.5rem" }}>
                    <Button sx={styles.cancelBtn} onClick={handleClose}>Cancel</Button>
                    <Button sx={styles.leaveBtn}>Leave</Button>
                </Box>
            </Box>
        </Modal>
    );
}

export default LeaveModal;
