import React from "react";
import {IconButton} from '@mui/material';
import {vars} from "../../theme/variables";

const {gray300, gray700, gray50} = vars;

const CustomButton = ({sx = {}, onClick, children}) => {
    return (
        <IconButton
            sx={{
                border: `1px solid ${gray300}`,
                padding: '0.625rem 0.875rem',
                boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: gray700,
                '&:hover': { background: gray50 },
                ...sx
            }}
            onClick={onClick}
        >
            {children}
        </IconButton>
    )
}

export default CustomButton;