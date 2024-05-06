import { Box, Container, Typography } from "@mui/material";
import { vars } from "../../theme/variables";
import BOLTSHIFT from "../../Icons/svg/boltshift.svg";
import LIGHTBOX from "../../Icons/svg/lightbox.svg";
import FEATHERDEV from "../../Icons/svg/featherdev.svg";
import SPHERULE from "../../Icons/svg/spherule.svg";
import GLOBALBANK from "../../Icons/svg/globalbank.svg";
import NIETZSCHE from "../../Icons/svg/nietzsche.svg";
import PartnersData from "../../static/Partners.json";

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

const imageMap = {
    BOLTSHIFT,
    LIGHTBOX,
    FEATHERDEV,
    SPHERULE,
    GLOBALBANK,
    NIETZSCHE,
};
const Partners = () => {
    return (
        <Box sx={style.root}>
            <Container maxWidth="xl">
                <Typography sx={style.heading}>Join 4,000+ companies already growing</Typography>
                <Box display='flex' alignItems='center' justifyContent='center' gap={3}>
                {PartnersData?.images?.map((image, index) => {
                    const imageSrc = imageMap[image.name];
                    if (imageSrc) {
                    return (
                        <img key={index} src={imageSrc} alt={image.alt} />
                    );
                    }
                    return null;
                })}
                </Box>
            </Container>
        </Box>
    )
}

export default Partners;