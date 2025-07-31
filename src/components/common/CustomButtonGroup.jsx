import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";
import { vars } from '../../theme/variables';

const { white, gray200, gray600, paperShadow } = vars;

const styles = {
    paper: {
        borderRadius: "0.5rem",
        border: `1px solid ${gray200}`,
        backgroundColor: white,
        boxShadow: paperShadow,
        width: "100%"
    },
    menu: {
        padding: "0.25rem 0"
    },
    menuItem: {
        padding: "0.625rem 0.875rem",
        fontSize: "0.875rem",
        fontWeight: 600,
        lineHeight: "1.25rem",
        color: gray600,
        gap: "0.25rem"
    }
}

const CustomButtonGroup = ({
    buttonTitle,
    buttonIcon = null,
    options = [],
    onOptionSelect
}) => {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);

    const handleMainButtonClick = () => {
        if (options.length === 0 && onOptionSelect) {
            onOptionSelect(null);
        }
    };

    const handleMenuItemClick = (event, option) => {
        setOpen(false);
        if (option.action) {
            option.action();
        } else if (onOptionSelect) {
            onOptionSelect(option);
        }
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
    };

    return (
        <Box sx={{ width: 210, position: "relative", display: "flex", justifyContent: "end" }}>
            <ButtonGroup
                variant="contained"
                ref={anchorRef}
                aria-label="Button group with a nested menu"
                sx={{
                    boxShadow: open && "0px 1px 2px 0px rgba(16, 24, 40, 0.05), 0px 0px 0px 4px rgba(50, 129, 115, 0.24)"
                }}
            >
                <Button
                    onClick={handleMainButtonClick}
                    startIcon={buttonIcon}
                    sx={{
                        pr: "0.75rem !important",
                        "& .MuiButton-startIcon": {
                            marginRight: "0.25rem"
                        }
                    }}
                >
                    {buttonTitle}
                </Button>
                {options.length > 0 && (
                    <Button
                        size="small"
                        aria-controls={open ? 'split-button-menu' : undefined}
                        aria-expanded={open ? 'true' : undefined}
                        aria-label="split button with menu"
                        aria-haspopup="menu"
                        onClick={handleToggle}
                        sx={{ pl: "0.75rem !important" }}
                    >
                        {open ? <KeyboardArrowUp fontSize="medium" /> : <KeyboardArrowDown fontSize="medium" />}
                    </Button>
                )}
            </ButtonGroup>
            {options.length > 0 && (
                <Popper
                    sx={{ zIndex: 1, marginTop: "0.25rem !important", width: "100%" }}
                    open={open}
                    anchorEl={anchorRef.current}
                    role={undefined}
                    transition
                    disablePortal
                >
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            style={{
                                transformOrigin:
                                    placement === 'bottom' ? 'center top' : 'center bottom',
                            }}
                        >
                            <Paper sx={styles.paper}>
                                <ClickAwayListener onClickAway={handleClose}>
                                    <MenuList id="split-button-menu" sx={styles.menu}>
                                        {options.map((option, index) => (
                                            <MenuItem
                                                key={option.label || index}
                                                onClick={(event) => handleMenuItemClick(event, option)}
                                                sx={styles.menuItem}
                                            >
                                                {option.icon}
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            )}
        </Box>
    );
}

export default CustomButtonGroup;