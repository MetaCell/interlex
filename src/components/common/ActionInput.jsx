import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import PropTypes from "prop-types";
import { vars } from '../../theme/variables';

const { gray300, inputBoxShadow } = vars;

const ActionInput = ({ actionButton, placeholder, name, value, onChange, type }) => {
    return (
        <Paper
            component="div"
            sx={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: "0.5rem",
                border: `1px solid ${gray300}`,
                boxShadow: inputBoxShadow,
                '& .MuiButton-root': {
                    border: "none",
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    height: "auto"
                }
            }}
        >
            <InputBase
                sx={{
                    flex: 1,
                    paddingY: "0.625rem",
                    paddingLeft: "0.875rem",
                    paddingRight: 0
                }}
                type={type}
                value={value}
                onChange={onChange}
                name={name}
                placeholder={placeholder}
                inputProps={{ 'aria-label': name }}
            />
            <IconButton type="button" sx={{ py: '0.625rem', px: "0.875rem" }} aria-label="search">
                <SearchIcon fontSize='small' />
            </IconButton>
            <Divider flexItem orientation="vertical" />
            {actionButton}
        </Paper>
    );
}

ActionInput.propTypes = {
    placeholder: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    type: PropTypes.string,
    actionButton: PropTypes.node
};

ActionInput.defaultProps = {
    placeholder: "",
};


export default ActionInput