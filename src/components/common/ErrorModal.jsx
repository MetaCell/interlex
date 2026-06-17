import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Chip,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { vars } from '../../theme/variables';

const { error500, gray600 } = vars;

// Pulls a status code + human-readable reason/body out of an axios-style error.
const extractError = (error) => {
    if (!error) return { status: null, reason: '', body: '' };

    const status = error?.response?.status ?? null;
    const reason = error?.response?.statusText || error?.message || 'Unknown error';

    const data = error?.response?.data;
    let body = '';
    if (data != null) {
        body = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    }

    return { status, reason, body };
};

const ErrorModal = ({ open, onClose, title = 'Request failed', error }) => {
    const { status, reason, body } = extractError(error);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ErrorOutlineIcon sx={{ color: error500 }} />
                {title}
            </DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={1.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                        {status != null && (
                            <Chip label={status} color="error" variant="outlined" size="small" />
                        )}
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {reason}
                        </Typography>
                    </Box>
                    {body && (
                        <Box
                            component="pre"
                            sx={{
                                m: 0,
                                p: 1.5,
                                borderRadius: '0.5rem',
                                backgroundColor: '#f5f5f5',
                                color: gray600,
                                fontSize: '0.8125rem',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                maxHeight: '15rem',
                                overflow: 'auto',
                            }}
                        >
                            {body}
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained">Close</Button>
            </DialogActions>
        </Dialog>
    );
};

ErrorModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string,
    error: PropTypes.object,
};

export default ErrorModal;
