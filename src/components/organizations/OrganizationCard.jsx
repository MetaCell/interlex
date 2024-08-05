import { Box, Chip, Grid, Stack, Typography } from "@mui/material";
import { vars } from "../../theme/variables";

const { gray500, gray700, gray200, brand600, brand200, brand50 } = vars;

const OrganizationCard = ({ term }) => {
    return (
        <Grid item xs={12} lg={6} sx={{
            cursor: 'pointer',
        }}>
            <Stack spacing={'1rem'} sx={{
                borderBottom: `1px solid ${gray200}`,
                minHeight: '11.314rem',
                p: '1.5rem',
                position: 'relative',
                '&:hover': {
                    '&:before': {
                        position: 'absolute',
                        top: '1.8rem',
                        left: '0',
                        content: '""',
                        height: '1.5rem',
                        borderRadius: '3px',
                        width: '2px',
                        background: brand600
                    },

                    '& .label': {
                        color: brand600
                    },

                    '& .greenChip': {
                        border: `1px solid ${brand200}`,
                        background: brand50,
                        fontSize: "0.875rem"
                    },

                    '& .MuiIconButton-root': { opacity: 1, visibility: 'visible' }
                }
            }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" alignItems="center" spacing={'.75rem'}>
                        <Typography variant='h6' color={gray700} className='label'>{term?.label}</Typography>
                        <Chip label={term?.status} className="greenChip" variant="outlined" />
                    </Stack>
                </Box>
                <Typography variant='body2' color={gray500} sx={{
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    WebkitLineClamp: 2,
                    textOverflow: 'ellipsis',
                }}>
                    {term?.description ? term?.description : '-'}
                </Typography>
            </Stack>
        </Grid>
    );
};

export default OrganizationCard;
