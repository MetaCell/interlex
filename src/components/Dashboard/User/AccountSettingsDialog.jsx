import PropTypes from "prop-types";
import { useState } from "react";
import { Dialog, Box, Divider, Button, DialogContent, Typography, Avatar, Stack, Grid, TextField } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import PasswordField from "./PasswordField";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";

import { vars } from "../../../theme/variables";
const { gray600, gray200, gray700 } = vars;

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
        <Dialog
            onClose={handleClose}
            aria-labelledby="accounts-settings-dialog-title"
            open={open}
            sx={{
                '& .MuiDialog-paper': {
                    maxWidth: '62.5rem'
                }
            }}
        >
            <Box
                sx={{
                    m: 0,
                    p: "1rem 1.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: `1px solid ${gray200}`,
                }}
                id="accounts-settings-title"
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <IconButton aria-label="close" onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{
                            margin: "0 1.5rem",
                        }}
                    />
                    <Typography fontWeight={500} fontSize="1.25rem" color={gray600}>
                        Account settings
                    </Typography>
                </Box>
                <HeaderRightSideContent handleClose={handleClose} handleSubmit={handleClose} />
            </Box>
            <DialogContent sx={{ padding: "2.25rem 3.25rem 2.5rem 3.25rem" }}>
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
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block", fontSize: "0.875rem", color: gray600 }}>
                                    Email address can't be changed from the interface. Please contact us to make this change.
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
            </DialogContent>
        </Dialog>
    );
};

AccountSettingsDialog.propTypes = {
    user: PropTypes.object.isRequired,
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
};

export default AccountSettingsDialog;
