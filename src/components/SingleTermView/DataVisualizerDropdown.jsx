import * as React from 'react';
import { FormControl, Select, MenuItem } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { vars } from '../../theme/variables';

const { gray700, gray300 } = vars

export default function DataVisualizerDropdown({ selectedValue, setSelectedValue, menuItems }) {

    return (
        <FormControl sx={{ minWidth: 90 }}>
            <Select
                value={selectedValue}
                onChange={(e) => setSelectedValue(e.target.value)}
                displayEmpty
                IconComponent={KeyboardArrowDownIcon}
                sx={{
                    color: gray700,
                    borderRadius: '0.5rem !important',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    '& .MuiOutlinedInput-input': {
                        padding: '0.625rem 0.875rem'
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: gray300
                    },
                    '& .MuiSvgIcon-root': {
                        color: gray700,
                        fontSize: '1.25rem',
                        right: '0.625rem !important'
                    }
                }}
            >
                {menuItems.map(dataFormat => (
                    <MenuItem key={dataFormat} value={dataFormat}>{dataFormat}</MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
