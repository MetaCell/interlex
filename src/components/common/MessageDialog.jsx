import { Typography, Link } from '@mui/material';
import BasicDialog from './BasicDialog';
import { vars } from '../../theme/variables';

const { gray600, brand700, brand800 } = vars;

const linkStyles = {
  color: brand700,
  fontWeight: 600, 
  textDecoration: "none", 
  "&:hover": { 
    color: brand800 
  }
}

const MessageDialog = ({ title, open, handleClose, message }) => (
  <BasicDialog 
    open={open} 
    handleClose={handleClose} 
    title={title}
    sx={{
      "& .MuiDialogContent-root": {
        paddingTop: "0.5rem"
      }
    }}
  >
    <Typography variant="body2" sx={{ color: gray600 }}>
      {message?.split(/(\S+@\S+\.\S+)/).map((part, i) => 
        part.match(/\S+@\S+\.\S+/) ? <Link key={i} href={`mailto:${part}`} sx={linkStyles}>{part}</Link> : part
      )}
    </Typography>
  </BasicDialog>
)

export default MessageDialog;