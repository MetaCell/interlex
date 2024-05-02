import { Box, Container, Grid, Typography } from "@mui/material";
import { vars } from "../../theme/variables";
import MOCKUP from "../../assets/svg/screen-mockup.svg"

const { brand800, brand600, brand700, gray900 } = vars;

const style = {
    description: {
        fontSize: '1.125rem',
        lineHeight: '150%',
        color: brand700
    },
    img: {
        position: 'absolute',
        maxWidth: '50%',
        right: 0,
        bottom: 0,
        borderTopLeftRadius: '0.625rem',
        borderTop: `0.25rem solid ${gray900}`,
        borderLeft: `0.25rem solid ${gray900}`,
    },
    heading: {
        fontSize: '4.5rem',
        fontWeight: 600,
        marginBottom: '1.5rem',
        lineHeight: '125%',
        letterSpacing: '-0.09rem',
        color: brand800,

        '& span': {
            display: 'block',
            color: brand600
        }
    }
}

const Banner = () => {
    return (
        <Box position='relative' height='calc(100vh - 4.125rem)'>
            <Container sx={{ height: 1 }} maxWidth="lg">
                <Grid height={1} container spacing={0} alignItems='center'>
                    <Grid item xs={6}>
                        <Typography component='h1' sx={style.heading}>
                            InterLex Terminology <span>Portal</span>
                        </Typography>

                        <Typography sx={style.description}>Unifying Biomedical Language Towards Data Harmonization.</Typography>
                    </Grid>
                </Grid>
            </Container>

            <img src={MOCKUP} style={style.img} alt="" />
        </Box>
    )
}

export default Banner;