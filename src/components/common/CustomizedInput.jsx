import { styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import FormControl from '@mui/material/FormControl';
import {vars} from "../../theme/variables";
import {Typography} from "@mui/material";

const { gray800, gray300, gray700, brand600, gray500 }= vars

const BootstrapInput = styled(InputBase)(() => ({
  '& .MuiInputBase-input': {
    borderRadius: '.5rem',
    border: `1px solid ${gray300}`,
    fontSize: '1rem',
    width: '100%',
    padding: '.5rem .575rem',
    height: '2.5rem',
    color: gray700,
    '&:focus': {
      borderColor: brand600,
      boxShadow: 'none',
      borderWidth: '2px'
    },
    '&::placeholder': {
      color: gray500,
      fontSize: '1rem',
    }
  },
}));
const CustomizedInput = (props) => {
  const {label, value, placeholder} = props
  return (
    <>
      {label && <Typography sx={{
        fontSize: '1rem',
        fontWeight: '500',
        color: gray800,
        mb: '.75rem'
      }}>
        {label}
      </Typography>}
      <FormControl variant="standard" sx={{
        position: 'relative',
        width: '100%',
        '& .MuiFormLabel-root': {
        fontSize: '1rem',
        fontWeight: '500',
        transform: 'none',
        transition: 'none',
        top: '-2rem',
        color: gray800
      },
        ...props.sx
      }}>
        <BootstrapInput defaultValue={value} id={label} placeholder={placeholder} {...props} />
      </FormControl>
    </>
    
  );
}

export default CustomizedInput;