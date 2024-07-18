import {Box, Button, Chip, Grid, Stack, Typography} from "@mui/material";
import { vars } from "../../../theme/variables";
import CustomBreadcrumbs from "../../common/CustomBreadcrumbs";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { SettingsOutlined } from "@mui/icons-material";
import {GlobalDataContext} from "../../../contexts/DataContext";
import { useContext } from "react";

const { gray25, gray600, gray800, gray500 } = vars;

const breadcrumbItems = [
  { label: '', href: '/', icon: HomeOutlinedIcon },
  { label: 'My dashboard' },
];

const User = () => {
  const {user} = useContext(GlobalDataContext)

  return (
    <Box sx={{
      p: "2.25rem 5rem",
      backgroundColor: gray25,
      minHeight: '15rem',
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
              <Chip className="greenChip" variant="outlined" label={user?.role} />
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default User;
