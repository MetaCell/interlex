import PropTypes from "prop-types";
import { useState } from "react";
import { Box, Divider, Button, Typography, Avatar, Stack, Grid, TextField, Link } from "@mui/material";
import CustomizedDialog from "../../common/CustomizedDialog";
import PasswordField from "./PasswordField";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { vars } from "../../../theme/variables";
const { gray600, gray700, brand700 } = vars;

const HeaderRightSideContent = ({ handleClose, handleSubmit }) => {
    return (
        <Box display='flex' alignItems='center' gap='.75rem'>
            <Button variant="outlined" onClick={handleClose}>Cancel</Button>
            <Button variant='contained' disabled onClick={handleSubmit}>
                Save Changes
            </Button>
        </Box>
    );
};

HeaderRightSideContent.propTypes = {
    handleClose: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
};

const AccountSettingsDialog = ({
    user,
    open,
    handleClose
}) => {
    const [showPasswordField, setShowPasswordField] = useState(false);

    const [formData, setFormData] = useState({
        email: user?.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log("Form submitted:", formData)
    }

    const userGroupname = user?.groupname.charAt(0).toUpperCase() + user?.groupname.slice(1)

    return (
        <CustomizedDialog
            open={open}
            handleClose={handleClose}
            title="Account settings"
            aria-labelledby="accounts-settings-dialog-title"
            fullScreen={false}
            HeaderRightSideContent={<HeaderRightSideContent handleClose={handleClose} handleSubmit={handleClose} />}
            sx={{
                '& .MuiDialog-paper': {
                    maxWidth: '62.5rem'
                }
            }}
        >
            <Box display="flex" sx={{ alignItems: "center" }}>
                <Avatar sx={{ width: 64, height: 64 }} >
                    <PersonOutlineIcon fontSize="large" />
                </Avatar>
                <Stack sx={{ marginLeft: "1.25rem" }}>
                    <Typography variant="h6" component="label" sx={{ color: "#3B403F" }}>{userGroupname}</Typography>
                    <Typography variant="subtitle1" sx={{ color: "#4D4F4F" }}>{user?.email}</Typography>
                </Stack>
            </Box>
            <Divider sx={{ mt: 5, mb: 5 }} />
            <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <Box>
                            <Typography variant="subtitle2" component="label" sx={{ color: gray700, marginBottom: "0.375rem" }}>
                                Email
                            </Typography>
                            <TextField
                                fullWidth
                                type="email"
                                variant="outlined"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                disabled
                                size="small"
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "flex", alignItems: "center", fontSize: "0.875rem", color: gray600 }}>
                                Email address can't be changed from the interface. Please contact us to make this change.
                                <Link
                                    href="mailto:support@interlex.org"
                                    underline="none"
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: brand700,
                                        ml: 0.5
                                    }}
                                >
                                    Contact support
                                    <ArrowForwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                                </Link>
                            </Typography>
                        </Box>
                    </Grid>

                    {showPasswordField && (
                        <>
                            <Grid item xs={12}>
                                <Box>
                                    <Typography variant="subtitle2" component="label" sx={{ color: gray700, marginBottom: "0.375rem" }}>
                                        Current Password
                                    </Typography>
                                    <PasswordField
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        handleChange={(e) => handleInputChange("currentPassword", e.target.value)}
                                        placeholder="Enter your current password"
                                    />
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Box>
                                    <Typography variant="subtitle2" component="label" sx={{ color: gray700, marginBottom: "0.375rem" }}>
                                        Enter New Password
                                    </Typography>
                                    <PasswordField
                                        name="newPassword"
                                        value={formData.newPassword}
                                        handleChange={(e) => handleInputChange("newPassword", e.target.value)}
                                        placeholder="Enter new password"
                                    />
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Box>
                                    <Typography variant="subtitle2" component="label" sx={{ color: gray700, marginBottom: "0.375rem" }}>
                                        Confirm New Password
                                    </Typography>
                                    <PasswordField
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        handleChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                        placeholder="Confirm new password"
                                    />
                                </Box>
                            </Grid>
                        </>
                    )}

                    <Grid item xs={12}>
                        <Box sx={{ pt: 2 }}>
                            <Button
                                type="submit"
                                variant="outlined"
                                startIcon={<ModeEditOutlineOutlinedIcon />}
                                onClick={() => setShowPasswordField(!showPasswordField)}
                            >
                                Change Password
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </CustomizedDialog>
    );
};

AccountSettingsDialog.propTypes = {
    user: PropTypes.object.isRequired,
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
};

export default AccountSettingsDialog;
