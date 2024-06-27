import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {vars} from "../../theme/variables";
import {BackgroundPattern} from "../../Icons";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
const { gray600, gray900 } = vars;
const StatusDialog = ({ handleClose }) => {
  return (
    <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' height='100%' position='relative'>
      <Box sx={{
        width: '30rem',
        height: '30rem',
        objectFit: 'cover',
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -60%)',
        zIndex: 1
      }}>
        <BackgroundPattern />
      </Box>
      <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' zIndex={2} padding='2rem' sx={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -10%)',
      }}>
        <Typography mt='1.25rem' mb='.75rem' color={gray900} fontSize='1.25rem' fontWeight={600}>Bulk terms edit successful</Typography>
        <Typography mb='2rem'  color={gray600} fontSize='1rem'>Your changes has been applied. Click finish to exit the flow, or restart editing.</Typography>
        <Box display='flex' gap='1rem'>
          <Button type='text'>Undo</Button>
          <Button
            startIcon={<EditOutlinedIcon />}
            variant='outlined'
            onClick={handleClose}
          >
            Edit bulk terms
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default StatusDialog;
