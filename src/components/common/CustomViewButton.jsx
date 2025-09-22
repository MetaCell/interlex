import PropTypes from 'prop-types';
import { useState } from 'react';
import { Button } from "@mui/material";
import FeatureNotAvailableDialog from "./FeatureNotAvailableDialog";

import { vars } from "../../theme/variables";
const { gray50, gray300 } = vars;

const CustomViewButton = ({ view, listView, onClick, icon }) => {
  const [featureNotAvailableOpen, setFeatureNotAvailableOpen] = useState(false);
  
  const handleClick = () => {
    if (view === 'table') {
      setFeatureNotAvailableOpen(true);
    } else {
      onClick();
    }
  };

  const handleCloseFeatureDialog = () => {
    setFeatureNotAvailableOpen(false);
  };

  return (
    <>
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
        onClick={handleClick}
      >
        {icon}
      </Button>
      
      <FeatureNotAvailableDialog
        open={featureNotAvailableOpen}
        onClose={handleCloseFeatureDialog}
        title="Table View Not Available"
        message="The table view feature is not yet implemented. We're working on bringing you this functionality in a future update."
      />
    </>
  );
};

CustomViewButton.propTypes = {
  view: PropTypes.string.isRequired,
  listView: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.element.isRequired
};

export default CustomViewButton
