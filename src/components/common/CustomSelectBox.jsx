import * as React from 'react';
import { Stack, FormControl, MenuItem, Select, Typography } from '@mui/material';
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { vars } from '../../theme/variables';

const { white, gray200, gray300, gray500, gray600, gray700, gray800 } = vars;

const CustomSelectBox = ({ isRequired, label, value, onChange, options, sx, placeholder }) => {

    return (
        <div>
            <Stack direction="row" justifyContent="space-between" mb={1.5}>
                <Typography variant="body1" sx={{ fontWeight: 500, color: gray800 }}>{label}</Typography>
                {isRequired && <Typography variant="body1" sx={{ color: gray600 }}>Required</Typography>}
            </Stack>
            <FormControl sx={sx}>
                <Select
                    id="demo-controlled-select"
                    displayEmpty
                    value={value}
                    onChange={onChange}
                    IconComponent={KeyboardArrowDownIcon}
                    className="custom-select"
                    renderValue={
                        value !== "" ? undefined : () => <Typography sx={{ fontSize: "0.875rem", color: gray500 }}>{placeholder}</Typography>
                    }
                    MenuProps={{
                        PaperProps: {
                            sx: {
                                borderRadius: "0.5rem",
                                border: `1px solid ${gray200}`,
                                boxShadow: "0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)",
                                "& .MuiMenuItem-root": {
                                    color: gray700,
                                    fontWeight: 400
                                }
                            }
                        }
                    }}
                    sx={{
                        color: gray700,
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        background: white,
                        minHeight: "2.5rem",
                        boxShadow: "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
                        '& .MuiOutlinedInput-input': {
                            padding: '0.5rem 0.75rem !important',
                            maxWidth: '13.5rem',
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: gray300
                        },
                        '& .MuiSvgIcon-root': {
                            color: gray500,
                            fontSize: '1.25rem',
                            right: '0.75rem !important'
                        },
                        '&.Mui-focused': {
                            boxShadow: "0px 0px 0px 4px rgba(50, 129, 115, 0.24)", // Change this to your desired shadow
                        }
                    }}
                >
                    {
                        options?.map((option, i) => <MenuItem key={i} value={typeof option === 'object' ? option.name : option}>{typeof option === 'object' ? option.name : option}</MenuItem>)
                    }
                </Select>
            </FormControl>
        </div>
    );
}

export default CustomSelectBox;
