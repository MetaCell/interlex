import CustomizedDialog from "./CustomizedDialog";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { vars } from "../../theme/variables";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

const { gray600, gray900 } = vars;

const HeaderRightSideContent = ({ handleClose, handleCloseandAdd }) => {
    return (
        <Box display='flex' alignItems='center' gap='.75rem'>
            <Button variant='contained' color='primary' onClick={() => {
                handleCloseandAdd();
                handleClose();
            }}>
                Finish
            </Button>
        </Box>
    );
};

const StatusDialog = ({ title, message, subMessage, addButtonTitle, open, handleClose, handleCloseandAdd, image }) => {
    return (
        <CustomizedDialog
            title={title}
            open={open}
            handleClose={handleClose}
            HeaderRightSideContent={<HeaderRightSideContent handleClose={handleClose} handleCloseandAdd={handleCloseandAdd} />}
        >
            <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' height='100%' position='relative'>
                <img
                    src={image.src}
                    alt='background'
                    style={{
                        width: '30rem',
                        height: '30rem',
                        objectFit: 'cover',
                        position: 'absolute',
                        top: '40%',
                        left: '50%',
                        transform: 'translate(-50%, -60%)',
                        zIndex: 1
                    }}
                />
                <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' zIndex={2} padding='2rem' sx={{
                    position: 'absolute',
                    top: '40%',
                    left: '50%',
                    transform: 'translate(-50%, -10%)',
                }}>
                    <Typography mt='1.25rem' mb='.75rem' color={gray900} fontSize='1.25rem' fontWeight={600}>{message}</Typography>
                    <Typography mb='2rem' color={gray600} fontSize='1rem'>{subMessage}</Typography>
                    <Box display='flex' gap='1rem'>
                        <Button type='text' onClick={handleClose}>Undo</Button>
                        <Button
                            startIcon={<AddOutlinedIcon />}
                            variant='outlined'
                            onClick={handleClose}
                        >
                            {addButtonTitle}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </CustomizedDialog>
    );
};

export default StatusDialog;