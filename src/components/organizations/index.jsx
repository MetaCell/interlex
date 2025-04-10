import {useEffect, useState } from "react";
// import { getOrganizations, newOrganization } from "../../api/endpoints";
import OrganizationsList from "../common/OrganizationsList";
import { Box, Typography, CircularProgress, Stack, Button, Link } from "@mui/material";
import BasicDialog from "../common/BasicDialog";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import { getOrganizations } from "../../api/endpoints/apiService";

import { vars } from "../../theme/variables";
const { gray600, gray700, brand700, brand800 } = vars;

const linkStyles = {
  color: brand700,
  fontWeight: 600, 
  textDecoration: "none", 
  "&:hover": { 
    color: brand800 
  }
}

const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const fetchOrganizations = async() => {
    const organizations = await getOrganizations()
    console.log("organizations: ", organizations)
    setOrganizations(organizations);
    setLoading(false)
  }

  useEffect( () => {
    setLoading(true)
    fetchOrganizations();
    // newOrganization("aigul");
  }, []);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 1 }}>
      <CircularProgress />
    </Box>
  }

  return (
    <Box p='2.25rem 5rem' flexGrow={1} overflow='auto'>
      <Stack direction="row" sx={{ justifyContent: "space-between" }}>
        {/* <Typography fontSize='1.5rem' color={gray700} fontWeight={600} mb='1.5rem'>
          {organizations?.length} Organizations
        </Typography> */}
        <Button type="string" startIcon={<GroupAddOutlinedIcon />} onClick={handleOpen}>Create a new organization</Button>
      </Stack>
      {/* <OrganizationsList organizations={organizations} /> */}
      <BasicDialog 
        open={open} 
        handleClose={handleClose} 
        title="Create a new organization"
        sx={{
          "& .MuiDialogContent-root": {
            paddingTop: "0.5rem"
          }
        }}
      >
        <Typography variant="body2" sx={{ color: gray600 }}>
          Creating an organization requires the help of an admin. Please reach out to {' '}
          <Link href="" sx={linkStyles}>
            organisation@interlex.org
          </Link> 
          {' '} for assistance.
        </Typography>
      </BasicDialog>
    </Box>
  );
}

export default Organizations;
