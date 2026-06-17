import { Box, Typography } from "@mui/material";

const Documentation = () => {
    return (
        <Box
            width={1}
            height={1}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={1}
        >
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Documentation
            </Typography>
            <Typography variant="body1" color="text.secondary">
                Documentation is coming soon.
            </Typography>
        </Box>
    );
};

export default Documentation;
