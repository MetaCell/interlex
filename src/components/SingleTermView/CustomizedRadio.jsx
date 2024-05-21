import { styled } from '@mui/material/styles';
import Radio from '@mui/material/Radio';
import {vars} from "../../theme/variables";
const {brand600, white, gray300, gray50} = vars

const BpIcon = styled('span')(() => ({
  borderRadius: '50%',
  width: 16,
  height: 16,
  backgroundColor: white,
  border: `1px solid ${gray300}`,
  
  '.Mui-focusVisible &': {
    outline: '2px auto rgba(19,124,189,.6)',
    outlineOffset: 2,
  },
  'input:hover ~ &': {
    backgroundColor: brand600,
    border: 0,
    '&::before': {
      display: 'block',
      width: 16,
      height: 16,
      backgroundImage: 'radial-gradient(#fff,#fff 28%,transparent 32%)',
      content: '""',
    },
  },
  'input:disabled ~ &': {
    boxShadow: 'none',
    background: gray50,
},
}));

const BpCheckedIcon = styled(BpIcon)({
  backgroundColor: brand600,
  border: 0,
  '&::before': {
    display: 'block',
    width: 16,
    height: 16,
    backgroundImage: 'radial-gradient(#fff,#fff 28%,transparent 32%)',
    content: '""',
  },
  'input:hover ~ &': {
    backgroundColor: brand600,
  },
  
  'input:disabled ~ &': {
    boxShadow: 'none',
    background: gray50,
  },
});

// Inspired by blueprintjs
function BpRadio(props) {
  return (
    <Radio
      disableRipple
      color="default"
      checkedIcon={<BpCheckedIcon />}
      icon={<BpIcon />}
      {...props}
    />
  );
}

const CustomizedRadio = ({checked}) => {
  return (
    <BpRadio checked={checked} />
  );
}

export default CustomizedRadio;