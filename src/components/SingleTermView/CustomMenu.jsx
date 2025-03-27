import PropTypes from 'prop-types';
import Menu from '@mui/material/Menu';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import ForkRightOutlinedIcon from '@mui/icons-material/ForkRightOutlined';
import FolderCopyOutlinedIcon from '@mui/icons-material/FolderCopyOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';

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
        color: `${error700} !important`,
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
    const handleAddToActiveOntology = () => {
        console.log('Add term to active ontology');
        setOpen(false);
    };

    const handleCreateFork = () => {
        console.log('Create fork');
        setOpen(false);
    };

    const handleAddToAnotherOntology = () => {
        console.log('Add term to another ontology');
        setOpen(false);
    };

    const handleRemoveFromActiveOntology = () => {
        console.log('Remove from active ontology');
        setOpen(false);
    };

    const menuOptions = [
        {
            icon: <CreateNewFolderOutlinedIcon fontSize="small" />,
            name: "Add term to active ontology",
            onClick: handleAddToActiveOntology
        },
        {
            icon: <ForkRightOutlinedIcon fontSize="small" />,
            name: "Create fork",
            onClick: handleCreateFork
        },
        {
            icon: <FolderCopyOutlinedIcon fontSize="small" />,
            name: "Add term to another ontology",
            onClick: handleAddToAnotherOntology
        }
    ]

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
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            sx={{
                '& .MuiPaper-root': menuStyles.paper,
                '& .MuiList-root': menuStyles.list,
            }}
        >
            {menuOptions.map((item, index) => (
                <MenuItem
                    key={`${item.name}_${index}`}
                    onClick={item.onClick}
                    sx={menuStyles.menuItem}
                >
                    {item.icon}
                    {item.name}
                </MenuItem>
            ))}
            <Divider sx={menuStyles.divider} />
            <MenuItem onClick={handleRemoveFromActiveOntology} sx={{ ...menuStyles.menuItem, ...menuStyles.dangerMenuItem }}>
                <DeleteOutlineOutlinedIcon fontSize="small" sx={{ color: error700 }} />
                Remove from active ontology
            </MenuItem>
        </Menu>
    );
};

CustomMenu.propTypes = {
    open: PropTypes.bool.isRequired,
    anchorRef: PropTypes.object.isRequired,
    setOpen: PropTypes.func.isRequired,
};

export default CustomMenu;
