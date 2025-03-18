import PropTypes from 'prop-types';
import {FormControlLabel} from "@mui/material";
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

Checkbox.propTypes = {
    label: PropTypes.string,
    sx: PropTypes.object,
    checked: PropTypes.bool,
    onChange: PropTypes.func,
    name: PropTypes.string
}

export default Checkbox;
