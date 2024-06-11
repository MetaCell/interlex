import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import ForkRightOutlinedIcon from '@mui/icons-material/ForkRightOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { vars } from '../../theme/variables';

const { gray100, gray200, gray600, error700 } = vars;

const menuStyles = {
    paper: {
        border: `1px solid ${gray200}`,
        borderRadius: '0.5rem',
        boxShadow: '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
        marginTop: '0.188rem'
    },
    list: {
        paddingY: 0.5,
    },
    menuItem: {
        paddingY: '0.625rem',
        paddingX: '0.875rem',
        gap: 0.5,
        fontWeight: 600,
        fontSize: '0.875rem',
        color: gray600,
        '&:hover': {
            backgroundColor: gray100,
        },
    },
    dangerMenuItem: {
        color: error700,
        '&:hover': {
            background: 'transparent',
        },
    },
    divider: {
        marginY: '0.25rem !important',
        borderColor: '#D3D9D8',
    },
};

const CustomMenu = ({ open, anchorRef, setOpen }) => {
    return (
        <Menu
            id="customized-menu"
            open={open}
            onClose={() => setOpen(false)} 
            anchorEl={anchorRef.current}
            keepMounted
            elevation={0}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            sx={{
                '& .MuiPaper-root': menuStyles.paper,
                '& .MuiList-root': menuStyles.list,
            }}
        >
            <MenuItem onClick={() => setOpen(false)} sx={menuStyles.menuItem}>
                <CreateNewFolderOutlinedIcon fontSize="small" />
                Add term to active ontology
            </MenuItem>
            <MenuItem onClick={() => setOpen(false)} sx={menuStyles.menuItem}>
                <ForkRightOutlinedIcon fontSize="small" />
                Create fork
            </MenuItem>
            <Divider sx={menuStyles.divider} />
            <MenuItem onClick={() => setOpen(false)} sx={{ ...menuStyles.menuItem, ...menuStyles.dangerMenuItem }}>
                <DeleteOutlineOutlinedIcon fontSize="small" sx={{ color: error700 }} />
                Remove from active ontology
            </MenuItem>
        </Menu>
    );
};

export default CustomMenu;
