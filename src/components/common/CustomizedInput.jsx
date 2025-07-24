import PropTypes from 'prop-types';
import { Typography, InputAdornment } from "@mui/material";
import { styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import FormControl from '@mui/material/FormControl';

import { vars } from "../../theme/variables";
const { gray800, gray300, gray700, brand600, gray500, gray50 } = vars;

const BootstrapInput = styled(InputBase)(({ theme }) => ({
  "& .MuiInputBase-input": {
    borderRadius: ".5rem",
    border: `1px solid ${gray300}`,
    fontSize: "1rem",
    width: "100%",
    padding: ".5rem .75rem",
    height: "2.5rem",
    color: gray700,
    "&:focus": {
      borderColor: brand600,
      boxShadow: "none",
      borderWidth: "2px",
    },
    "&::placeholder": {
      color: gray500,
      fontSize: "1rem",
    },
    "&.Mui-disabled": {
      backgroundColor: gray50,
      fontWeight: 400,
      opacity: 1,
    },
  },
  "& .MuiInputBase-root": {
    position: "relative",
  },
  "& .MuiInputAdornment-root": {
    position: "absolute",
    right: ".75rem",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "auto",
  },
  "&.MuiInputBase-adornedEnd .MuiInputBase-input": {
    paddingRight: "2.5rem"
  }
}));

const CustomizedInput = (props) => {
  const { label, value, onChange, placeholder, endAdornment, ...otherProps } = props;

  return (
    <>
      {label && (
        <Typography sx={{
          fontSize: '1rem',
          fontWeight: '500',
          color: gray800,
          mb: '.75rem'
        }}>
          {label}
        </Typography>
      )}
      <FormControl variant="standard" sx={{
        position: "relative",
        width: "100%",
        "& .MuiFormLabel-root": {
          fontSize: "1rem",
          fontWeight: "500",
          transform: "none",
          transition: "none",
          top: "-2rem",
          color: gray800,
        },
        ...props.sx
      }}>
        <BootstrapInput
          value={value}
          onChange={onChange}
          id={label}
          placeholder={placeholder}
          endAdornment={endAdornment && <InputAdornment position="end">{endAdornment}</InputAdornment>}
          {...otherProps}
        />
      </FormControl>
    </>
  );
};

CustomizedInput.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  sx: PropTypes.object,
  endAdornment: PropTypes.node // For adding icons inside the input
};

export default CustomizedInput;