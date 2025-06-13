import PropTypes from "prop-types";
import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import { BackgroundPattern, StatusErrorBackgroundPattern } from "../../Icons";
import CustomizedDialog from "./CustomizedDialog";
import Typography from "@mui/material/Typography";

import { vars } from "../../theme/variables";
const { gray600, gray900 } = vars;

const HeaderRightSideContent = ({ handleClose, finishButtonTitle, finishButtonEndIcon }) => {
    return (
        <Box display='flex' alignItems='center' gap='.75rem'>
            <Button variant='contained' color='primary' onClick={handleClose} endIcon={finishButtonEndIcon}>
                {finishButtonTitle}
            </Button>
        </Box>
    );
};

HeaderRightSideContent.propTypes = {
    handleClose: PropTypes.func,
    finishButtonTitle: PropTypes.string,
    finishButtonEndIcon: PropTypes.node,
};

const StatusDialog = ({ open, handleClose, title, message, subMessage, finishButtonTitle, actionButtonTitle, handleActionButtonClick, finishButtonEndIcon, actionButtonStartIcon, errored }) => {
    return (
        <CustomizedDialog
            title={title}
            open={open}
            handleClose={handleClose}
            HeaderRightSideContent={<HeaderRightSideContent handleClose={handleClose} finishButtonTitle={finishButtonTitle} finishButtonEndIcon={finishButtonEndIcon} />}
        >
            <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' height='100%' position='relative'>
                { !errored ? <Box sx={{
                    width: '30rem',
                    height: '30rem',
                    objectFit: 'cover',
                    position: 'absolute',
                    top: '40%',
                    left: '50%',
                    transform: 'translate(-50%, -60%)',
                    zIndex: 1
                }}>
                    <BackgroundPattern />
                </Box>
                :
                <Box
                    sx={{
                        height: '17.875rem',
                        objectFit: 'cover',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -60%)',
                        zIndex: 1,
                    }}
                >
                    <StatusErrorBackgroundPattern/>
                </Box>}
                <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' zIndex={2} padding='2rem' sx={{
                    position: 'absolute',
                    top: '40%',
                    left: '50%',
                    transform: 'translate(-50%, -10%)',
                    textAlign: 'center'
                }}>
                    <Typography mt='0.5rem' mb='.75rem' color={gray900} fontSize='1.25rem' fontWeight={600}>{message}</Typography>
                    <Typography mb='2rem' color={gray600} fontSize='1rem'>{subMessage}</Typography>
                    <Box display='flex' gap='1rem'>
                        {actionButtonTitle && (
                            <Button
                                startIcon={actionButtonStartIcon}
                                variant='outlined'
                                onClick={handleActionButtonClick}
                            >
                                {actionButtonTitle}
                            </Button>
                        )}
                    </Box>
                </Box>
            </Box>
        </CustomizedDialog>
    );
};

StatusDialog.propTypes = {
    open: PropTypes.bool,
    handleClose: PropTypes.func,
    title: PropTypes.string,
    message: PropTypes.string,
    subMessage: PropTypes.string,
    finishButtonTitle: PropTypes.string,
    actionButtonTitle: PropTypes.string,
    handleActionButtonClick: PropTypes.func,
    finishButtonEndIcon: PropTypes.node,
    actionButtonStartIcon: PropTypes.node,
    errored: PropTypes.bool,
};

export default StatusDialog;
