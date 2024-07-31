import {Button} from "@mui/material";
import {vars} from "../../theme/variables";

const { gray50, gray300 } = vars;

const CustomViewButton = ({ view, listView, onClick, icon }) => (
  <Button
    sx={{
      background: listView === view ? gray50 : 'transparent',
      padding: '0.5rem 0.75rem',
      border: `1px solid ${gray300}`,
      '&.Mui-disabled': {
        border: `1px solid ${gray300}`
      },
      '& svg path': {
        fill: listView !== view ? gray300 : 'currentColor'
      }
    }}
    disabled={view === 'table' && true}
    onClick={onClick}
  >
    {icon}
  </Button>
);

export default CustomViewButton