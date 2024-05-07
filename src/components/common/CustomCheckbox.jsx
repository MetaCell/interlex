import {FormControlLabel} from "@mui/material";
import React from "react"
import {Checkbox as MuiCheckbox} from '@mui/material';
import { CheckboxDefault, CheckboxSelected } from "../../Icons";


const Checkbox = ({label = '', sx = {}, checked, onChange, name}) => {
    return (
        <FormControlLabel
            sx={sx}
            control={
                <MuiCheckbox
                    disableRipple
                    icon={<CheckboxDefault/>}
                    checkedIcon={<CheckboxSelected/>}
                    checked={checked}
                    onChange={onChange}
                    name={name}
                />
            }
            label={label}
        />
    )
}

export default Checkbox;