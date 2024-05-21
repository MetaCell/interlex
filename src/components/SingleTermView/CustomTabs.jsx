import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {vars} from "../../theme/variables";

const {brand700, brand600, gray500, gray200} = vars
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
        <Box>
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

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);
  
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  
  return (
      <Box sx={{ width: 'fit-content', borderBottom: 1, borderColor: gray200 }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" sx={{
          minHeight: '2.25rem',
          '& .MuiTabs-flexContainer': {
            gap: '.75rem'
          },
          '& .MuiTab-root': {
            padding: '0rem 0.25rem 0.75rem 0.25rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: gray500,
            textAlign: 'center',
            
            '&.Mui-selected': {
              color: brand700
            }
          },
          '& .MuiTabs-indicator': {
            backgroundColor: brand600
          }
        }}>
          <Tab label="Overview" {...a11yProps(0)} />
          <Tab label="Variants" {...a11yProps(1)} />
          <Tab label="Version history" {...a11yProps(2)} />
          <Tab label="Discussions" {...a11yProps(3)} />
        </Tabs>
      </Box>
  );
}
