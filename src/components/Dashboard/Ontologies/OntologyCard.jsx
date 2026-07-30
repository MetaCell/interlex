import PropTypes from 'prop-types';
import {Box, Chip, Grid, Stack, Typography} from "@mui/material";

import { vars } from "../../../theme/variables";
const {gray500, gray700, gray200, brand600, brand200, brand50 } = vars;

const OntologyCard = ({ ontology, onSelect }) => {
  const handleClick = () => {
    // The cell card overview component is not built yet - the parent shows a
    // placeholder dialog for now.
    onSelect(ontology);
  };

  return (
    <Grid item xs={12} lg={6} sx={{ cursor: 'pointer' }} onClick={handleClick}>
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
            <Typography variant='h6' color={gray700} className='label'>{ontology?.label}</Typography>
            {ontology?.badge && <Chip label={ontology.badge} className="greenChip" variant="outlined" />}
          </Stack>
        </Box>
        <Typography variant='body2' color={gray500} sx={{
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          WebkitLineClamp: 2,
          textOverflow: 'ellipsis',
        }}>
          {ontology?.description ? ontology?.description : '-'}
        </Typography>
      </Stack>
    </Grid>
  );
};

OntologyCard.propTypes = {
  ontology: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired
};

export default OntologyCard;
