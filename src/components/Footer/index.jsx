import { Box, Button, Container, Typography } from "@mui/material";
import { vars } from "../../theme/variables";
import LOGO from '../../Icons/svg/logo.svg';

const { gray200 } = vars;

const Footer = () => {
    return (
        <Box sx={{width: '100%', height: '3.25rem', backgroundColor: 'white', borderTop: `0.0625rem solid ${gray200}`, py: 1, position: 'fixed', bottom: 0}}>
            <Container maxWidth="xl" sx={{display: 'flex', justifyContent:'space-between', alignItems: 'center'}}>
                <Box display='flex' gap='0.875rem' alignItems='end'>
                    <img src={LOGO} alt="" />
                    <Typography sx={{fontSize: '0.75rem', lineHeight: '150%'}}>&copy;Copyright 2024 Interlex</Typography>
                </Box>

                <Box display='flex' gap='0.5rem' sx={{
                    '& .MuiButton-root': {
                        height: '2.25rem'
                    }
                }}>
                    <Button variant="text">About SciCrunch</Button>
                    <Button variant="text">Privacy Policy</Button>
                    <Button variant="text">Scicrunch Terms of Service</Button>
                </Box>
            </Container>
        </Box>
    )
}

export default Footer;