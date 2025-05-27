import { useState } from "react";
import { Avatar, Box, Button, Chip, Grid, Stack, Typography, Divider, TextField, InputAdornment, IconButton } from "@mui/material";
import { vars } from "../../../theme/variables";
import CustomBreadcrumbs from "../../common/CustomBreadcrumbs";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { SettingsOutlined } from "@mui/icons-material";
import { GlobalDataContext } from "../../../contexts/DataContext";
import { useContext } from "react";
import AccountSettingsDialog from "./AccountSettingsDialog";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import PasswordField from "./PasswordField";

const { gray25, gray600, gray800, gray500, gray700 } = vars;

const breadcrumbItems = [
  { label: '', href: '/', icon: HomeOutlinedIcon },
  { label: 'My dashboard' },
];

const User = () => {
  const { user } = useContext(GlobalDataContext)
  const [open, setOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    email: "user@example.com",
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

  const togglePasswordVisibility = (field) => {
    switch (field) {
      case "current":
        setShowCurrentPassword(!showCurrentPassword)
        break
      case "new":
        setShowNewPassword(!showNewPassword)
        break
      case "confirm":
        setShowConfirmPassword(!showConfirmPassword)
        break
    }
  }

  return (
    <Box sx={{
      p: "2.25rem 5rem",
      backgroundColor: gray25,
      width: '100%',
      gap: '1.75rem',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <CustomBreadcrumbs breadcrumbItems={breadcrumbItems} />
      <Box display='flex' alignItems='center' justifyContent='space-between'>
        <Typography color={gray600} fontSize="1.875rem" fontWeight={600}>
          {user?.name} dashboard
        </Typography>
        <Button
          startIcon={<SettingsOutlined />}
          variant='outlined'
          onClick={() => setOpen(true)}
        >
          Account settings
        </Button>
      </Box>
      <Grid container>
        <Grid item xs={12} lg={3} mb=".75rem">
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Email
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {user?.email}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={3} mb=".75rem">
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              ORCID ID
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {user?.id}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={3} mb=".75rem">
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Role
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              <Chip className="darkGreen rounded" variant="outlined" label={user?.role} />
            </Typography>
          </Stack>
        </Grid>
      </Grid>
      <AccountSettingsDialog
        open={open}
        title="Account settings"
        handleClose={() => setOpen(false)}
      >
        <>
          <Box display="flex" sx={{ alignItems: "center" }}>
            <Avatar sx={{ width: 64, height: 64 }} >
              <PersonOutlineIcon fontSize="large" />
            </Avatar>
            <Stack sx={{ marginLeft: "1.25rem" }}>
              <Typography variant="h6" component="label" sx={{ color: "#3B403F" }}>Aigul</Typography>
              <Typography variant="subtitle1" sx={{ color: "#4D4F4F" }}>aigul@metacell.us</Typography>
            </Stack>
          </Box>
          <Divider sx={{ mt: 5, mb: 5 }} />
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Box>
                  <Typography variant="subtitle2" component="label" sx={{ color: gray700 }} gutterBottom>
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
                    sx={{ mt: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block", fontSize: "0.875rem", color: gray600 }}>
                    Email address can't be changed from the interface. Please contact us to make this change.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box>
                  <Typography variant="subtitle2" component="label" sx={{ color: gray700 }} gutterBottom>
                    Current Password
                  </Typography>
                  <PasswordField
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    handleChange={(e) => handleInputChange("currentPassword", e.target.value)}
                    placeholder="Enter your current password"
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle2" component="label" sx={{ color: gray700 }} gutterBottom>
                    Enter New Password
                  </Typography>
                  <TextField
                    fullWidth
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange("newPassword", e.target.value)}
                    placeholder="Enter new password"
                    variant="outlined"
                    sx={{ mt: 1 }}
                    // InputProps={{
                    //   endAdornment: (
                    //     <InputAdornment position="end">
                    //       <IconButton
                    //         onClick={() => togglePasswordVisibility("new")}
                    //         edge="end"
                    //         aria-label="toggle password visibility"
                    //       >
                    //         {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    //       </IconButton>
                    //     </InputAdornment>
                    //   ),
                    // }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle2" component="label" sx={{ color: gray700 }} gutterBottom>
                    Confirm New Password
                  </Typography>
                  <TextField
                    fullWidth
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm new password"
                    variant="outlined"
                    sx={{ mt: 1 }}
                    // InputProps={{
                    //   endAdornment: (
                    //     <InputAdornment position="end">
                    //       <IconButton
                    //         onClick={() => togglePasswordVisibility("confirm")}
                    //         edge="end"
                    //         aria-label="toggle password visibility"
                    //       >
                    //         {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    //       </IconButton>
                    //     </InputAdornment>
                    //   ),
                    // }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ pt: 2 }}>
                  <Button
                    type="submit"
                    variant="outlined"
                    startIcon={<ModeEditOutlineOutlinedIcon />}
                  >
                    Change Password
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </>
      </AccountSettingsDialog>
    </Box>
  );
};

export default User;
