import React from "react";
import { Box, Typography, Button } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { BackgroundPattern, StatusErrorBackgroundPattern, AddedSuccessfully } from "../../Icons";
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

const StatusMessage = ({ message, description }) => (
    <Box
        display='flex'
        flexDirection='column'
        justifyContent='center'
        alignItems='center'
    >
        <Typography mt='1.25rem' mb='.75rem' color={gray900} fontSize='1.25rem' fontWeight={600}>
            {message}
        </Typography>
        <Typography mb='2rem' color={gray600} fontSize='1rem' sx={{ textAlign: "center", maxWidth: "22rem" }}>
            {description}
        </Typography>
    </Box>
);

const ActionButtons = ({
    isAddButtonVisible,
    isTryButtonVisible,
    isCloseButtonVisible,
    onAdd,
    onTryAgain,
    onClose,
    addButtonMessage
}) => (
    <Box display='flex' gap='1rem'>
        {isCloseButtonVisible && <Button variant='text' onClick={onClose}>Close</Button>}
        {isAddButtonVisible && <Button startIcon={<AddOutlinedIcon />} variant='outlined' onClick={onAdd}>
            {addButtonMessage}
        </Button>}
        {isTryButtonVisible && <Button variant='outlined' onClick={onTryAgain}>
            Try Again
        </Button>}
    </Box>
);

const StatusStep = ({ statusProps, onAdd, onTryAgain, onClose }) => {
    const {
        statusResponse,
        successMessage,
        successDescription,
        failureMessage,
        failureDescription,
        addButtonMessage,
        isAddButtonVisible,
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
                <StatusMessage message={message} description={description} />
                <ActionButtons
                    isAddButtonVisible={isAddButtonVisible}
                    isTryButtonVisible={isTryButtonVisible}
                    isCloseButtonVisible={isCloseButtonVisible}
                    onAdd={onAdd}
                    onTryAgain={onTryAgain}
                    onClose={onClose}
                    addButtonMessage={addButtonMessage}
                />
            </Box>
        </Box>
    )
}

export default StatusStep;
