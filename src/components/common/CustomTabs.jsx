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

const BasicTabs = ({tabs, tabValue, handleChange}) => {
  
  return (
      <Box sx={{ width: 'fit-content', borderBottom: 1, borderColor: gray200 }}>
        <Tabs value={tabValue} onChange={handleChange} aria-label="basic tabs example" sx={{
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
          {
            tabs.map((tab, i) => <Tab key={i} label={tab} {...a11yProps(i)} />)
          }
        </Tabs>
      </Box>
  );
}

export default BasicTabs