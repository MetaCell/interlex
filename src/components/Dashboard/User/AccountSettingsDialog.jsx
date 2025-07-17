import PropTypes from "prop-types"
import { useState } from "react"
import { Box, Divider, Button, Typography, Avatar, Stack, Grid, TextField, Link } from "@mui/material"
import * as yup from "yup"
import CustomizedDialog from "../../common/CustomizedDialog"
import PasswordField from "./PasswordField"
import PersonOutlineIcon from "@mui/icons-material/PersonOutline"
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined"
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import { changePassword } from "../../../api/endpoints/apiService"
import { vars } from "../../../theme/variables"

const { gray600, gray700, brand700 } = vars;

const DIALOG_STYLES = {
    "& .MuiDialog-paper": {
        maxWidth: "62.5rem",
    },
}

const validationSchema = yup.object().shape({
    currentPassword: yup.string().when('showPasswordField', {
        is: true,
        then: yup.string().required('Current password is required'),
    }),
    newPassword: yup.string().when('showPasswordField', {
        is: true,
        then: yup.string()
            .required('New password is required')
            .min(8, 'Password must be at least 8 characters'),
    }),
    confirmPassword: yup.string().when('showPasswordField', {
        is: true,
        then: yup.string()
            .required('Please confirm your password')
            .oneOf([yup.ref('newPassword'), null], 'Passwords must match'),
    }),
});

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

const AccountSettingsDialog = ({ user, open, handleClose }) => {
    const [showPasswordField, setShowPasswordField] = useState(false);
    const [formData, setFormData] = useState({
        email: user?.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleInputChange = (field, value) => {
        setFormData((prev) => {
            const updatedFormData = {
                ...prev,
                [field]: value,
            };

            const newErrors = { ...errors };
            if ((field === 'newPassword' || field === 'confirmPassword') && showPasswordField) {
                newErrors.confirmPassword =
                    updatedFormData.newPassword === updatedFormData.confirmPassword
                        ? ""
                        : "Passwords do not match";
            }

            setErrors(newErrors);

            return updatedFormData;
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (showPasswordField) {
            try {
                await validationSchema.validate(formData, { abortEarly: false });
                setErrors({});
                console.log("Form submitted:", formData);
                await changePassword({ group: user?.groupname, data: formData });
            } catch (err) {
                const validationErrors = {};
                err.inner.forEach(error => {
                    validationErrors[error.path] = error.message;
                });
                setErrors(validationErrors);
                return;
            }
        } else {
            console.log("Form submitted (no password change):", formData);
        }
    };

    const userGroupname = user?.groupname.charAt(0).toUpperCase() + user?.groupname.slice(1)
    const isPasswordFormValid =
        formData.currentPassword.trim() !== "" &&
        formData.newPassword.trim() !== "" &&
        formData.confirmPassword.trim() !== "" &&
        formData.newPassword === formData.confirmPassword &&
        !errors.newPassword &&
        !errors.confirmPassword;

    return (
        <CustomizedDialog
            open={open}
            handleClose={handleClose}
            title="Account settings"
            aria-labelledby="accounts-settings-dialog-title"
            fullScreen={false}
            HeaderRightSideContent={<HeaderRightSideContent handleClose={handleClose} handleSubmit={handleClose} />}
            sx={DIALOG_STYLES}
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
                                Email address can&apos;t be changed from the interface. Please contact us to make this change.
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
                                <PasswordField
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    label="Current Password"
                                    handleChange={(e) => handleInputChange("currentPassword", e.target.value)}
                                    placeholder="Enter your current password"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <PasswordField
                                    name="newPassword"
                                    value={formData.newPassword}
                                    label="Enter New Password"
                                    handleChange={(e) => handleInputChange("newPassword", e.target.value)}
                                    placeholder="Enter new password"
                                    errorMessage={errors.newPassword}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <PasswordField
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    label="Confirm New Password"
                                    handleChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                    placeholder="Confirm new password"
                                    errorMessage={errors.confirmPassword}
                                />
                            </Grid>
                        </>
                    )}

                    <Grid item xs={12}>
                        <Box sx={{ pt: 2 }}>
                            {!showPasswordField ? (
                                <Button
                                    type="submit"
                                    variant="outlined"
                                    startIcon={<ModeEditOutlineOutlinedIcon />}
                                    onClick={() => setShowPasswordField(true)}
                                >
                                    Change Password
                                </Button>
                            ) : (<>
                                <Button
                                    type="submit"
                                    variant="outlined"
                                    startIcon={isPasswordFormValid ? <SaveOutlinedIcon /> : <ModeEditOutlineOutlinedIcon />}
                                    onClick={() => setShowPasswordField(true)}
                                    disabled={!isPasswordFormValid}
                                >
                                    Save new password
                                </Button>
                                <Button variant="text" onClick={() => setShowPasswordField(false)}>
                                    Cancel
                                </Button>
                            </>)}
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
