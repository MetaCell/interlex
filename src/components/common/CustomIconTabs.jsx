import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {vars} from "../../theme/variables";

const {gray300, gray50, gray800} = vars

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const CustomIconTabs = (props) => {
  
  const {tabs, handleChange, value} = props;
  
  return (
    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" sx={{
      minHeight: 'auto',
      boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
      borderRadius: '0.5rem',
      border: `1px solid ${gray300}`,
      
      '& .MuiTabs-indicator': {
        display: 'none'
      },
      
      '& .MuiTabs-flexContainer': {
        gap: 0,
      },
      
      '& .MuiButtonBase-root': {
        minWidth: 0,
        padding: '0.625rem 0.875rem',
        color: gray800,
        fontSize: '.875rem',
        
        '&:first-child': {
          borderRight: `1px solid ${gray300}`,
        },
        
        '&.Mui-selected': {
          backgroundColor: gray50,
          color: gray800,
        }
      },
      ...props.sx
    }}>
      {
        tabs.map((tab, i) => (
          <Tab
            key={i}
            value={tab.value}
            icon={tab.icon || null}
            label={!tab.icon ? tab.text : null}
            {...a11yProps(i)}
          />
        ))
      }
    </Tabs>
  );
}

CustomIconTabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node,
      text: PropTypes.string,
      value: PropTypes.any.isRequired,
    })
  ).isRequired,
  handleChange: PropTypes.func.isRequired,
  value: PropTypes.any.isRequired,
  sx: PropTypes.object,
};

export default CustomIconTabs;
