import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import { vars } from "../../theme/variables";
const { brand700, brand600, gray500, gray200 } = vars
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


// eslint-disable-next-line no-unused-vars
const BasicTabs = ({ tabs, tabValue, handleChange, onMouseDown, parentBoxStyles, tabStyles }) => {

  return (
    <Box sx={{ width: 'fit-content', borderBottom: 1, borderColor: gray200, ...parentBoxStyles }}>
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
          alignItems: 'center',

          '&.Mui-selected': {
            color: brand700
          }
        },
        '& .MuiTabs-indicator': {
          backgroundColor: brand600
        },
        ...tabStyles
      }}
        onMouseDown={(event) => event.preventDefault()}
      >
        {
          // A tab is either a plain label or { label, disabled, hidden }: `disabled` for one that
          // is part of the design but has no view behind it yet, `hidden` for one that does not
          // apply to what is being shown at all.
          //
          // Each Tab carries its index as an explicit `value`, so hiding one does not renumber
          // the others — callers keep addressing tabs by their position in `tabs`, which is what
          // the value MUI hands back to `handleChange` still means.
          tabs.map((tab, i) => {
            const { label, disabled, hidden } = typeof tab === 'string' ? { label: tab } : tab;
            return hidden
              ? null
              : <Tab key={i} value={i} label={label} disabled={disabled} {...a11yProps(i)} />;
          })
        }
      </Tabs>
    </Box>
  );
}

BasicTabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      disabled: PropTypes.bool,
      hidden: PropTypes.bool
    })
  ])).isRequired,
  tabValue: PropTypes.number.isRequired,
  handleChange: PropTypes.func.isRequired,
  onMouseDown: PropTypes.func,
  parentBoxStyles: PropTypes.object,
  tabStyles: PropTypes.object
};

export default BasicTabs
