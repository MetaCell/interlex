import { Box, IconButton, Typography, Button, Snackbar, Stack } from "@mui/material";
import { ErrorOutlinedIcon } from "../../../Icons";
import CloseIcon from '@mui/icons-material/Close';
import { vars } from "../../../theme/variables";

const { gray200, gray300, gray600, gray900, brand700 } = vars

const snackbarStyles = {
    root: {
        padding: '1rem',
        border: `1px solid ${gray300}`,
        background: '#fff',
        borderRadius: '0.75rem',
        boxShadow: '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)'
    },
    snackbarButtonStyle: {
        p: 0,
        fontWeight: 600,
        height: '1.25rem',
        minWidth: 'auto',
        '&:hover': {
            background: 'transparent'
        }
    }
};

const CustomSnackbar = ({ open, handleClose, onUndoDelete }) => {
    return (
        <Snackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            open={open}
            onClose={handleClose}
            sx={snackbarStyles.root}
        >
            <Box display="flex" alignItems="flex-start" gap={2}>
                <IconButton sx={{ p: '0.625rem', border: `1px solid ${gray200}`, borderRadius: '0.5rem' }}>
                    <ErrorOutlinedIcon />
                </IconButton>
                <Stack direction="column">
                    <Typography variant="body2" sx={{ fontWeight: 600, color: gray900 }}>You’ve removed “SP1 neuron”</Typography>
                    <Typography variant="body2" sx={{ color: gray600, mt: 0.5 }}>from Central nervous system relationship “is part of”.</Typography>
                    <Stack direction="row" mt={1.5} spacing={1.5}>
                        <Button variant="text" sx={{ color: gray600, ...snackbarStyles.snackbarButtonStyle }} onClick={onUndoDelete}>Undo</Button>
                        <Button variant="text" sx={{ color: brand700, ...snackbarStyles.snackbarButtonStyle }}>Confirm</Button>
                    </Stack>
                </Stack>
                <IconButton onClick={handleClose}>
                    <CloseIcon fontSize="medium" />
                </IconButton>
            </Box>
        </Snackbar>
    )
}

export default CustomSnackbar;