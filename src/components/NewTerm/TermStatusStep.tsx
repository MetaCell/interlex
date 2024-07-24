import React from "react";
import { Box, Typography, Button } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { BackgroundPattern, StatusErrorBackgroundPattern } from "../../Icons";
import { vars } from "../../theme/variables";

const { gray900, gray600 } = vars;

const StatusBackground = ({ responseStatus }) => (
    <Box
        sx={{
            width: '30rem',
            height: '30rem',
            objectFit: 'cover',
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -60%)',
            zIndex: 1,
        }}
    >
        {responseStatus === 'success' ? <BackgroundPattern /> : <StatusErrorBackgroundPattern />}
    </Box>
);

const StatusMessage = ({ responseStatus, termValue }) => (
    <Box
        display='flex'
        flexDirection='column'
        justifyContent='center'
        alignItems='center'
    >
        <Typography mt='1.25rem' mb='.75rem' color={gray900} fontSize='1.25rem' fontWeight={600}>
            {responseStatus === 'success' ? 'Term successfully created' : 'Unable to create the term'}
        </Typography>
        <Typography mb='2rem' color={gray600} fontSize='1rem'>
            {responseStatus === 'success'
                ? `Your term ${termValue} has been added. Click finish to see the result, or add a new term.`
                : `Your term ${termValue} can’t be added. Cancel or try again.`}
        </Typography>
    </Box>
);

const ActionButtons = ({ responseStatus, onAddNewTerm }) => (
    <Box display='flex' gap='1rem'>
        <Button variant='text'>Undo</Button>
        <Button startIcon={<AddOutlinedIcon />} variant='outlined' onClick={onAddNewTerm}>
            {responseStatus === 'success' ? 'Add a new term' : 'Try again'}
        </Button>
    </Box>
);

const TermStatusStep = ({ responseStatus, termValue, onAddNewTerm }) => (
    <Box
        display='flex'
        flexDirection='column'
        justifyContent='center'
        alignItems='center'
        height='100%'
        position='relative'
    >
        <StatusBackground responseStatus={responseStatus} />
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
            <StatusMessage responseStatus={responseStatus} termValue={termValue} />
            <ActionButtons responseStatus={responseStatus} onAddNewTerm={onAddNewTerm} />
        </Box>
    </Box>
);

export default TermStatusStep;
