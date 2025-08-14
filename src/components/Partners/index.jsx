import { Box, Container, Typography } from "@mui/material";
import { vars } from "../../theme/variables";
import NIDDK from "../../assets/logos/NIDDK.svg";
import NIDM from "../../assets/logos/NIDM.svg";
import NIF from "../../assets/logos/NIF.svg";
import RRID from "../../assets/logos/RRID.svg";
import SPARC from "../../assets/logos/SPARC.svg";
import drugDesign from "../../assets/logos/drugDesign.svg";
import openDataCommons from "../../assets/logos/openDataCommons.svg";

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
    },

    logo: {
        width: 'auto',
        height: '120px', // Double the typical size
        maxWidth: '400px', // Prevent logos from becoming too wide
        paddingLeft: '4rem',
        paddingRight: '4rem',
        objectFit: 'contain',
        transition: 'transform 0.3s ease',
    }
}

const logos = [
    { src: NIDDK, alt: "NIDDK" },
    { src: NIDM, alt: "NIDM" },
    { src: NIF, alt: "NIF" },
    { src: RRID, alt: "RRID" },
    { src: SPARC, alt: "SPARC" },
    { src: drugDesign, alt: "Drug Design" },
    { src: openDataCommons, alt: "Open Data Commons" }
];

const Partners = () => {
    return (
        <Box sx={style.root}>
            <Container maxWidth="xl">
                <Typography sx={style.heading}>Affiliates</Typography>
                <Box display='flex' alignItems='center' justifyContent='center' gap={3}>
                    {logos.map((logo, index) => (
                        <img key={index} src={logo.src} alt={logo.alt} style={style.logo} />
                    ))}
                </Box>
            </Container>
        </Box>
    )
}

export default Partners;
