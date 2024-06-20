import CustomizedDialog from "../../common/CustomizedDialog";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { vars } from "../../../theme/variables";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import {BackgroundPattern} from "../../../Icons";

const { gray600, gray900 } = vars;

const HeaderRightSideContent = ({ handleClose, handleCloseAddpredicate }) => {
  return (
    <Box display='flex' alignItems='center' gap='.75rem'>
      <Button variant='contained' color='primary' onClick={() => {
        handleCloseAddpredicate();
        handleClose();
      }}>
        Finish
      </Button>
    </Box>
  );
};

const AddPredicateStatusDialog = ({ open, handleClose, handleCloseAddpredicate, image, storedSearchTerm }) => {
  return (
    <CustomizedDialog
      title='Add new predicate(s)'
      open={open}
      handleClose={handleClose}
      HeaderRightSideContent={<HeaderRightSideContent handleClose={handleClose} handleCloseAddpredicate={handleCloseAddpredicate} />}
    >
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
          <Typography mt='1.25rem' mb='.75rem' color={gray900} fontSize='1.25rem' fontWeight={600}>Predicate(s) successfully added</Typography>
          <Typography mb='2rem'  color={gray600} fontSize='1rem'>Your term “{storedSearchTerm}” has new predicate(s).</Typography>
          <Box display='flex' gap='1rem'>
            <Button type='text'>Undo</Button>
            <Button
              startIcon={<AddOutlinedIcon />}
              variant='outlined'
              onClick={handleClose}
            >
              Add new predicate(s)
            </Button>
          </Box>
        </Box>
      </Box>
    </CustomizedDialog>
  );
};

export default AddPredicateStatusDialog;
