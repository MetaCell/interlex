import { Box, Grid, Typography } from "@mui/material";
import CustomInputBox from "../../common/CustomInputBox";

const SecondStepContent = () => {
    return (
        <Box
            sx={{
                px: '3.25rem',
                pt: '1.75rem',
                pb: '2.5rem',
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column', 
                gap: "2.75rem"
            }}
        >
            <Grid container>
                <Grid item xs={12}>
                    <Typography variant="h6">Term metadata overview</Typography>
                </Grid>
                <Grid container spacing={5.5}>
                    <Grid item xs={6}>
                        <CustomInputBox
                            id="superclass-field"
                            // name="title"
                            // value={newOntology.title}
                            // onInputChange={handleNewOntologyChange}
                            label="Superclass"
                            placeholder={"Regional part of nervous system"}
                            isEndAdornmentVisible
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <CustomInputBox
                            id="subclass-field"
                            // name="title"
                            // value={newOntology.title}
                            // onInputChange={handleNewOntologyChange}
                            label="Subclass of"
                            placeholder={"Regional part of nervous system"}
                            isEndAdornmentVisible
                        />
                    </Grid>
                </Grid>
                <Grid item></Grid>
            </Grid>
        </Box>
    )
}

export default SecondStepContent;