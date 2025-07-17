import PropTypes from "prop-types";
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import { vars } from '../../theme/variables';

const { gray300, brand600, error300, inputBoxShadow, inputErrorBoxShadow } = vars;

const ActionInput = ({ name, value, onChange, error, actionButton, placeholder, type, size, inputIcon }) => {
    return (
        <Paper
            component="div"
            sx={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: "0.5rem",
                boxShadow: inputBoxShadow,
                maxHeight: size === 'small' ? "2.5rem" : "3rem",
                height: size === 'small' ? "2.5rem" : "3rem",
                '& .MuiButton-root': {
                    border: `1px solid ${gray300}`,
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    height: "100%",
                    borderLeftColor: "transparent"
                },
                '& .MuiButton-startIcon': {
                    marginLeft: 0
                }
            }}
        >
            <InputBase
                sx={{
                    flex: 1,
                    paddingY: "0.625rem",
                    paddingLeft: "0.875rem",
                    paddingRight: 0,
                    borderRadius: "0.5rem",
                    height: "100%",
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    border: "1px solid",
                    borderColor: gray300,
                    '&.Mui-focused': {
                        borderColor: brand600,
                        borderWidth: "2px"
                    },
                    '&.MuiInputBase-colorError': {
                        borderColor: error300,
                        '&.Mui-focused': {
                            boxShadow: inputErrorBoxShadow
                        }
                    }
                }}
                type={type}
                value={value}
                onChange={onChange}
                name={name}
                placeholder={placeholder}
                color={error ? 'error' : 'info'}
                inputProps={{ 'aria-label': name }}
            />
            {inputIcon && (<IconButton type="button" sx={{ py: '0.625rem', px: "0.875rem" }} aria-label="search">
                {inputIcon}
            </IconButton>)}
            {actionButton}
        </Paper>
    );
}

ActionInput.propTypes = {
    placeholder: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    error: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    type: PropTypes.string,
    size: PropTypes.string,
    actionButton: PropTypes.node,
    inputIcon: PropTypes.element
};

ActionInput.defaultProps = {
    placeholder: "",
};


export default ActionInput