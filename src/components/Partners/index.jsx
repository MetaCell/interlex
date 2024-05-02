import { Box, Container, Typography } from "@mui/material";
import { vars } from "../../theme/variables";
import BOLTSHIFT from "../../assets/svg/boltshift.svg";
import LIGHTBOX from "../../assets/svg/lightbox.svg";
import FEATHERDEV from "../../assets/svg/featherdev.svg";
import SPHERULE from "../../assets/svg/spherule.svg";
import GLOBALBANK from "../../assets/svg/globalbank.svg";
import NIETZSCHE from "../../assets/svg/nietzsche.svg";

const { gray50, gray600 } = vars;

const style = {
    root: {
        background: gray50,
        p: '4rem 0 6rem'
    },

    heading: {
        color: gray600,
        fontSize: '1rem',
        textAlign: 'center',
        fontWeight: 500,
        mb: '2rem',
        lineHeight: '150%'
    }
}

const Partners = () => {
    return (
        <Box sx={style.root}>
            <Container maxWidth="lg">
                <Typography sx={style.heading}>Join 4,000+ companies already growing</Typography>
                <Box display='flex' alignItems='center' justifyContent='center' gap={3}>
                    <img src={BOLTSHIFT} alt="" />
                    <img src={LIGHTBOX} alt="" />
                    <img src={FEATHERDEV} alt="" />
                    <img src={SPHERULE} alt="" />
                    <img src={GLOBALBANK} alt="" />
                    <img src={NIETZSCHE} alt="" />
                </Box>
            </Container>
        </Box>
    )
}

export default Partners;