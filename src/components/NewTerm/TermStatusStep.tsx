import React from "react"
import { Box, Typography, Button } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { BackgroundPattern } from "../../Icons";
import { vars } from "../../theme/variables";
const { gray900, gray600 } = vars;

const TermStatusStep = ({ handleCloseAndActiveStep }) => {
    return (
        <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' height='100%' position='relative'>
            <Box sx={{
                width: '30rem', height: '30rem', objectFit: 'cover',
                position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -60%)', zIndex: 1
            }}>
                <BackgroundPattern />
            </Box>
            <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' zIndex={2} padding='2rem' sx={{
                position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -10%)',
            }}>
                <Typography mt='1.25rem' mb='.75rem' color={gray900} fontSize='1.25rem' fontWeight={600}>
                    Term successfully created
                </Typography>
                <Typography mb='2rem' color={gray600} fontSize='1rem'>
                    Your term “Central nervous system” has been added. Click finish to go see the result, or add a new term.
                </Typography>
                <Box display='flex' gap='1rem'>
                    <Button variant='text'>Undo</Button>
                    <Button startIcon={<AddOutlinedIcon />} variant='outlined' onClick={handleCloseAndActiveStep}>
                        Add a new term
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}

export default TermStatusStep;