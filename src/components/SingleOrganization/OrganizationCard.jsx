import { Box, Chip, Grid, Stack, Typography } from "@mui/material";
import CustomButton from "../common/CustomButton";
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import { vars } from "../../theme/variables";

const { gray50, gray500, gray700, gray200, brand600, brand200, brand50 } = vars;

const TermTitleSection = ({ term }) => {
    return (
        <Box display="flex" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={'.75rem'}>
                <Typography variant='h6' color={gray700} className='label'>{term?.label}</Typography>
                <Chip label={term?.status} className="greenChip" variant="outlined" />
            </Stack>
            <CustomButton
                sx={{
                    opacity: 0,
                    visibility: 'hidden',
                    transition: 'opacity 0.3s ease-in-out'
                }}
                onClick={(e) => handleClick(e, searchResult.label)}
            >
                <CreateNewFolderOutlinedIcon fontSize="medium" />
                Add term to active ontology
            </CustomButton>
        </Box>
    )
}

const OntologyTitleSection = ({ ontology }) => {
    return (
        <Box display="flex" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={'.75rem'}>
                <FolderOpenOutlinedIcon />
                <Typography variant='h6' color={gray700} className='label'>{ontology?.name}</Typography>
            </Stack>
            <CustomButton
                sx={{
                    opacity: 0,
                    visibility: 'hidden',
                    transition: 'opacity 0.3s ease-in-out'
                }}
                onClick={(e) => handleClick(e, searchResult.label)}
            >
                <DownloadOutlinedIcon fontSize="medium" />
                Download ontology
            </CustomButton>
        </Box>
    )
}

const OrganizationCard = ({ data, isOntology }) => {
    return (
        <Grid item xs={12} lg={6} sx={{
            cursor: 'pointer',
        }}>
            <Stack spacing={'1rem'} sx={{
                borderBottom: `1px solid ${gray200}`,
                minHeight: '11.314rem',
                p: '1.5rem',
                position: 'relative',
                borderRadius: "0.5rem",
                '&:hover': {
                    background: gray50,
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
                {isOntology ? <OntologyTitleSection ontology={data}/> : <TermTitleSection term={data} />}
                <Typography variant='body2' color={gray500} sx={{
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    WebkitLineClamp: 2,
                    textOverflow: 'ellipsis',
                }}>
                    {data?.description ? data?.description : '-'}
                </Typography>
            </Stack>
        </Grid>
    );
};

export default OrganizationCard;
