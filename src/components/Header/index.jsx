import {
    DocumentationIcon,
    LogoutIcon,
    NavIcon,
    OrganizationsIcon,
    ReleaseNotesIcon,
    TermActivityIcon,
    UserIcon,
    SortIcon
} from '../../Icons';
import {
    Avatar,
    Badge,
    Box,
    Button,
    Divider,
    IconButton,
    ListItemAvatar,
    Popover
} from "@mui/material";
import React from "react";
import Search from './Search';
import { useContext } from "react";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { useNavigate } from "react-router-dom";
import Logo from '../../Icons/svg/interlex_logo.svg'
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import { GlobalDataContext } from "../../contexts/DataContext";
import EditBulkTermsDialog from "../Dashboard/EditBulkTerms/EditBulkTermsDialog";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { userLogout } from "../../api/endpoints/apiService";
import { useCookies } from 'react-cookie';
import CustomButtonGroup from '../common/CustomButtonGroup';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import AddIcon from '@mui/icons-material/Add';
import AddNewTermDialog from '../TermEditor/newTerm/AddNewTermDialog';

import { vars } from "../../theme/variables";
const { gray200, white, gray100, gray600 } = vars;

const styles = {
    root: {
        background: white,
        position: 'sticky',
        top: 0,
        zIndex: 99,
        borderBottom: `0.0625rem solid ${gray200}`,
        px: '2rem',
        height: '4.125rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        display: 'flex'
    },

    popover: {
        '& .MuiPopover-paper': {
            boxShadow: 'none',
            background: white,
            border: `0.0625rem solid ${gray200}`,
            borderRadius: '0.5rem',
            marginTop: '0.5rem',
            minWidth: '15rem'
        },

        '& .MuiListItemIcon-root': {
            minWidth: '0.0625rem',
            marginRight: '0.5rem'
        },

        '& .MuiList-root': {
            paddingY: '0.25rem'
        },

        '& .MuiListItem-root': {
            padding: '0.063rem 0.375rem'
        },

        '& .MuiListItemText-root': {
            margin: 0,

            '& .MuiTypography-root': {
                fontWeight: 500,
                color: '#3B403F',
                fontSize: '0.875rem',
            }
        },

        '& .MuiListItemButton-root': {
            alignItems: 'center',
            borderRadius: '0.375rem',
            padding: '0.5625rem 0.625rem'
        }
    },

    divider: {
        width: '0.0625rem',
        borderRadius: '0.0625rem',
        height: '2.5rem',
        background: gray200
    },

    keyBoardInfo: {
        borderRadius: '0.25rem', pointerEvents: 'none', background: gray100, color: gray600, fontSize: '0.875rem', lineHeight: '142.857%', p: '0.125rem 0.5rem'
    },

    avatar: {
        border: '0.0469rem solid rgba(0,0,0,0.08)',
        width: '2.5rem',
        height: '2.5rem',
        '& .MuiSvgIcon-root': {
            width: '1.5rem',
            height: '1.5rem',
            fontSize: '1.5rem'
        }
    }
}

const NavMenu = [
    {
        label: 'Organizations',
        icon: <OrganizationsIcon />,
        href: '/organizations',
        protected: true
    },
    {
        label: 'Term activity',
        icon: <TermActivityIcon />,
        href: '/term-activity'
    },
    {
        label: 'Documentation',
        icon: <DocumentationIcon />,
        href: '#'
    },
    {
        label: 'Release notes',
        icon: <ReleaseNotesIcon />,
        href: '#'
    }
]

const Header = () => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const [openEditBulkTerms, setOpenEditBulkTerms] = React.useState(false);
    const [activeStep, setActiveStep] = React.useState(0);
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const { user, setUserData } = useContext(GlobalDataContext);
    const [openNewTermDialog, setOpenNewTermDialog] = React.useState(false);
    // eslint-disable-next-line no-unused-vars
    const [existingCookies, setCookie, removeCookie] = useCookies(['session']);

    // Get the group name based on user login status
    const getGroupName = () => {
        return user?.groupname || 'base';
    };

    const UserNavMenu = [
        {
            label: 'My dashboard',
            icon: <UserIcon />,
            href: `/${getGroupName()}/dashboard`
        },
        {
            label: 'Log out',
            icon: <LogoutIcon />
        }
    ];

    const handleNewTermDialogClose = () => {
        setOpenNewTermDialog(false);
    }

    const handleNewTermDialogOpen = () => {
        setOpenNewTermDialog(true);
    }

    // eslint-disable-next-line no-unused-vars
    const handleSetUserData = (user, organization) => {
        setUserData(user, organization);
    };
    const navigate = useNavigate();

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleUserClick = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleUserClose = () => {
        setAnchorElUser(null);
    };

    const handleClickCurieEditor = () => {
        navigate('curie-editor')
    };

    const handleCloseEditBulkTerms = () => {
        setOpenEditBulkTerms(false)
        setActiveStep(0)
    }

    const handleOpenEditBulkTerms = () => {
        setOpenEditBulkTerms(true)
    }

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    const openUser = Boolean(anchorElUser);
    const idUser = open ? 'simple-popover' : undefined;

    const [openList, setOpenList] = React.useState(false);

    const handleCloseList = () => {
        setOpenList(false);
    };

    const toggleList = () => {
        setOpenList(!openList);
    };

    const handleMenuClick = async (e, menu) => {
        if (menu.label === 'Log out') {
            try {
                await userLogout(user['groupname']);
            } catch (error) {
                console.error("Logout error:", error);
            } finally {
                setUserData(null);
            }
            removeCookie('session', { path: '/' });
            localStorage.removeItem('session');
            localStorage.removeItem('settings');
            setUserData({});
            navigate('/');
        }
        if (menu.href) {
            navigate(menu.href)
        }
    }

    React.useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.key === 'k') {
                toggleList();
            }
            if (event.key === 'Escape') {
                handleCloseList();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        console.log("Stored user in context ", user)
        if (user !== null && user?.groupname !== undefined) {
            setIsLoggedIn(true)
        } else {
            setIsLoggedIn(false)
        }
    }, [user])

    const filteredNavMenu = NavMenu.filter(menu =>
        !menu.protected || (menu.protected && isLoggedIn)
    );

    const options = [
        {
            label: 'Add a new term',
            icon: <AddIcon />,
            action: handleNewTermDialogOpen
        },
        {
            label: 'Bulk add terms',
            icon: <PlaylistAddIcon />,
            action: handleOpenEditBulkTerms
        }
    ];

    return (
        <>
            <Box sx={styles.root}>
                <Box width={isLoggedIn ? '15.5625rem' : '23.875rem'} display='flex' gap='1.25rem'>
                    <Button sx={{ p: '0.625rem 0.5625rem', minWidth: '0.0625rem' }} onClick={handleClick} aria-describedby={id} variant='outlined'>
                        <NavIcon />
                    </Button>

                    <Popover
                        sx={styles.popover}
                        id={id}
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                    >
                        <List>
                            {filteredNavMenu.map((menu, index) => (
                                <ListItem key={index} disablePadding>
                                    <ListItemButton onClick={(e) => handleMenuClick(e, menu)}>
                                        <ListItemIcon>
                                            {menu.icon}
                                        </ListItemIcon>
                                        <ListItemText primary={menu.label} />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                            {isLoggedIn && (<>
                                <Divider sx={{ mt: 0.5, mb: 0.5, color: gray200 }} />
                                <ListItem disablePadding onClick={handleClickCurieEditor}>
                                    <ListItemButton>
                                        <ListItemIcon>
                                            <SortIcon />
                                        </ListItemIcon>
                                        <ListItemText primary={'Curie Editor'} />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding onClick={handleOpenEditBulkTerms}>
                                    <ListItemButton>
                                        <ListItemIcon>
                                            <ModeEditOutlineOutlinedIcon fontSize='small' />
                                        </ListItemIcon>
                                        <ListItemText primary={'Terms editor'} />
                                    </ListItemButton>
                                </ListItem>
                            </>)}
                        </List>
                    </Popover>
                    <a onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>
                        <img src={Logo} alt="Interlex" />
                    </a>
                </Box>

                <Box sx={{ width: '35%', maxWidth: '45.5rem' }}>
                    <Search />
                </Box>

                {!isLoggedIn ? (
                    <Box display='flex' gap='1.25rem'>
                        <Box display='flex' gap='0.25rem'>
                            <Button onClick={() => navigate("/register")}>Register</Button>
                            <Button variant="outlined" onClick={() => navigate("/login")}>Log in</Button>
                        </Box>
                        <Divider sx={styles.divider} />
                        <CustomButtonGroup
                            buttonTitle='Add a new term'
                            buttonIcon={<AddIcon />}
                            options={options}
                            onOptionSelect={(option) => console.log('Selected:', option.label)}
                        />
                    </Box>
                ) : (
                    <Box display='flex' gap='1.25rem'>
                        <CustomButtonGroup
                            buttonTitle='Add a new term'
                            buttonIcon={<AddIcon />}
                            options={options}
                            onOptionSelect={(option) => console.log('Selected:', option.label)}
                        />
                        <Divider sx={styles.divider} />
                        <IconButton sx={{
                            p: 0,
                            borderRadius: '50%',
                            '&:focus': {
                                boxShadow: '0 0 0 0.25rem rgba(152, 162, 179, 0.14)'
                            }
                        }}
                            onClick={handleUserClick} aria-describedby={idUser}
                        >
                            <Avatar sx={styles.avatar}>
                                <PersonOutlineIcon />
                            </Avatar>
                        </IconButton>
                        <Popover
                            sx={{
                                ...styles.popover,
                                '& .MuiPopover-paper': {
                                    padding: '0',
                                    marginTop: '0.5rem',
                                },

                                '& .MuiListItem-root + .MuiListItem-root': {
                                    borderTop: `0.0625rem solid #D3D9D8`,
                                },
                                '& .MuiListItem-root': {
                                    padding: '0.3125rem 0.375rem'
                                }
                            }}
                            id={idUser}
                            open={openUser}
                            anchorEl={anchorElUser}
                            onClose={handleUserClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                        >
                            <List>
                                <ListItem sx={{
                                    p: '0.75rem 1rem !important',

                                    '& .MuiListItemText-root .MuiListItemText-primary': {
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        lineHeight: '142.857%',
                                        color: '#3B403F'
                                    },

                                    '& .MuiListItemText-root .MuiListItemText-secondary': {
                                        fontSize: '0.875rem',
                                        fontWeight: 400,
                                        lineHeight: '142.857%',
                                        color: '#4D4F4F'
                                    },
                                }}>
                                    <ListItemAvatar>
                                        <Badge
                                            variant="dot"
                                            color="success"
                                            anchorOrigin={{
                                                vertical: 'bottom',
                                                horizontal: 'right',
                                            }}
                                        >
                                            <Avatar sx={styles.avatar}>
                                                <PersonOutlineIcon />
                                            </Avatar>
                                        </Badge>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={user?.name}
                                        secondary={user?.email}
                                    />
                                </ListItem>
                                {UserNavMenu.map((menu, index) => (
                                    <ListItem key={index} disablePadding>
                                        <ListItemButton onClick={(e) => handleMenuClick(e, menu)}>
                                            <ListItemIcon>
                                                {menu.icon}
                                            </ListItemIcon>
                                            <ListItemText primary={menu.label} />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </Popover>
                    </Box>
                )}
            </Box>
            <AddNewTermDialog open={openNewTermDialog} handleClose={handleNewTermDialogClose} />
            <EditBulkTermsDialog handleClose={handleCloseEditBulkTerms} open={openEditBulkTerms} activeStep={activeStep} setActiveStep={setActiveStep} />
        </>
    )
}

export default Header
