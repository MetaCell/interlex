import PropTypes from "prop-types";
import { Box, Typography, Button } from "@mui/material";
import { StatusErrorBackgroundPattern, AddedSuccessfully } from "../../Icons";

import { vars } from "../../theme/variables";
const { gray900, gray600 } = vars;

const StatusBackground = ({ responseStatus }) => (
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
        {responseStatus?.success ? <AddedSuccessfully /> : <StatusErrorBackgroundPattern />}
    </Box>
);

StatusBackground.propTypes = {
    responseStatus: PropTypes.object,
};

const StatusMessage = ({ message, description, additionalInfo }) => (
    <Box
        display='flex'
        flexDirection='column'
        justifyContent='center'
        alignItems='center'
    >
        <Typography mt='1.25rem' mb='.75rem' color={gray900} fontSize='1.25rem' fontWeight={600}>
            {message}
        </Typography>
        <Typography mb='1.25rem' color={gray600} fontSize='1rem' sx={{ textAlign: "center", maxWidth: "22rem" }}>
            {description}
        </Typography>
        <Typography mb="2rem">{additionalInfo}</Typography>
    </Box>
);

StatusMessage.propTypes = {
    message: PropTypes.string,
    description: PropTypes.string,
    additionalInfo: PropTypes.string,
};

const ActionButtons = ({
    isTryButtonVisible,
    isCloseButtonVisible,
    onAction,
    onTryAgain,
    onClose,
    actionButtonMessage,
    actionButtonStartIcon
}) => (
    <Box display='flex' gap='1rem'>
        {isCloseButtonVisible && <Button variant='text' onClick={onClose}>Close</Button>}
        {actionButtonMessage && <Button startIcon={actionButtonStartIcon} variant='outlined' onClick={onAction}>
            {actionButtonMessage}
        </Button>}
        {isTryButtonVisible && <Button variant='outlined' onClick={onTryAgain}>
            Try Again
        </Button>}
    </Box>
);

ActionButtons.propTypes = {
    isTryButtonVisible: PropTypes.bool,
    isCloseButtonVisible: PropTypes.bool,
    onAction: PropTypes.func,
    onTryAgain: PropTypes.func,
    onClose: PropTypes.func,
    actionButtonMessage: PropTypes.string,
    actionButtonStartIcon: PropTypes.node,
};

const StatusStep = ({ statusProps, onAction, onTryAgain, onClose, actionButtonStartIcon, additionalInfo }) => {
    const {
        statusResponse,
        successMessage,
        successDescription,
        failureMessage,
        failureDescription,
        actionButtonMessage,
        isTryButtonVisible,
        isCloseButtonVisible,
    } = statusProps;

    const message = statusResponse?.success
        ? successMessage
        : statusResponse?.error
            ? failureMessage
            : '';

    const description = statusResponse?.success
        ? successDescription
        : statusResponse?.error
            ? failureDescription
            : '';

    return (
        <Box
            display='flex'
            flexDirection='column'
            justifyContent='center'
            alignItems='center'
            height='100%'
            position='relative'
        >
            <StatusBackground responseStatus={statusResponse} />
            <Box
                display='flex'
                flexDirection='column'
                justifyContent='center'
                alignItems='center'
                zIndex={2}
                padding='2rem'
                sx={{
                    position: 'absolute',
                    top: '40%',
                    left: '50%',
                    transform: 'translate(-50%, -10%)',
                }}
            >
                <StatusMessage message={message} description={description} additionalInfo={additionalInfo} />
                <ActionButtons
                    isTryButtonVisible={isTryButtonVisible}
                    isCloseButtonVisible={isCloseButtonVisible}
                    onAction={onAction}
                    onTryAgain={onTryAgain}
                    onClose={onClose}
                    actionButtonMessage={actionButtonMessage}
                    actionButtonStartIcon={actionButtonStartIcon}
                />
            </Box>
        </Box>
    )
}

StatusStep.propTypes = {
    statusProps: PropTypes.object,
    onAction: PropTypes.func,
    onTryAgain: PropTypes.func,
    onClose: PropTypes.func,
    actionButtonStartIcon: PropTypes.node,
    additionalInfo: PropTypes.string,
};

export default StatusStep;
