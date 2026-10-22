import { Box, Button, Container, Typography } from "@mui/material";
import { vars } from "../../theme/variables";
import FDILAB_LOGO from "../../assets/logos/FDILab.png";

const { gray200 } = vars;

const Footer = () => {
    return (
        <Box sx={{width: '100%', height: '3.25rem', backgroundColor: 'white', borderTop: `0.0625rem solid ${gray200}`, py: 1, position: 'fixed', bottom: 0}}>
            <Container maxWidth="xl" sx={{display: 'flex', justifyContent:'space-between', alignItems: 'center'}}>
                <Box display='flex' gap='0.875rem' alignItems='center'>
                    <Button variant="text" href="https://www.fdilab.org" target="_blank" rel="noopener noreferrer">
                            <Box component="img" src={FDILAB_LOGO} alt="About FDILab" sx={{height: '1.5rem'}} />
                        </Button>
                    <Typography sx={{fontSize: '0.75rem', lineHeight: '150%'}}>&copy;Copyright 2026 FDILab</Typography>
                </Box>
                <Box display='flex' gap='0.5rem' sx={{
                    '& .MuiButton-root': {
                        height: '2.25rem'
                    }
                }}>
                    <Button variant="text">About</Button>
                    <Button variant="text">Privacy Policy</Button>
                    <Button variant="text">Terms of Service</Button>
                </Box>
            </Container>
        </Box>
    )
}

export default Footer;