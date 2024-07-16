import {Box, Chip, Grid, Stack, Typography} from "@mui/material";
import { vars } from "../../../theme/variables";
import CustomButton from "../../common/CustomButton";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";

const {gray500, gray700, gray200, brand600, brand200, brand50, error300, error700, error50 } = vars;
const VariantCard = ({term}) => {
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
            background: brand50
          },
          
          '& .MuiIconButton-root': { opacity: 1, visibility: 'visible' }
        }
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" spacing={'.75rem'}>
            <Typography variant='h6' color={gray700} className='label'>{term?.label}</Typography>
            <Chip label={term?.status} className="greenChip" variant="outlined" />
          </Stack>
          {term.ontologyIsActive ? (
            <CustomButton
              sx={{
                opacity: 0,
                visibility: 'hidden',
                transition: 'opacity 0.3s ease-in-out',
                border: `1px solid ${error300}`,
                color: error700,
                '&:hover': {background: error50}
              }}
            >
              <DeleteOutlinedIcon fontSize="medium" />
              Remove from active ontology
            </CustomButton>
          ) : (
            <CustomButton
              sx={{
                opacity: 0,
                visibility: 'hidden',
                transition: 'opacity 0.3s ease-in-out'
              }}
            >
              <CreateNewFolderOutlinedIcon fontSize="medium" />
              Add term to active ontology
            </CustomButton>
          )}
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

export default VariantCard;
