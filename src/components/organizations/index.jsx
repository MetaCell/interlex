import {useEffect, useState } from "react";
import { newOrganization } from "../../api/endpoints";
import OrganizationsList from "../common/OrganizationsList";
import { Box, Typography, CircularProgress, Stack, Button, Link } from "@mui/material";
import BasicDialog from "../common/BasicDialog";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import { getOrganizations } from "../../api/endpoints/apiService";
import { useCookies } from 'react-cookie'

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
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [cookies, setCookie] = useCookies(['session']);

  const fetchOrganizations = async() => {
    const organizations = await getOrganizations()
    setLoading(false)
  }

  // useEffect( () => {
  //   setLoading(true)
  //   fetchOrganizations();
  //   newOrganization("aigul");
  // }, []);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // setError(null);

    try {
      // Your API URL and cookie details
      const apiUrl = '/dariodippi/priv/org-new';
      // const cookieName = 'authCookie';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: "a test"
      });
      // const response = getOrganizations(cookies)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      console.log("data: ", data)
      // setResponse(data);
    } catch (err) {
      console.log('An unknown error occurred: ', err);
    } finally {
      setLoading(false);
    }
  }
  console.log("cookies: ", cookies)

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
        <Button type="string" startIcon={<GroupAddOutlinedIcon />} onClick={handleSubmit}>Create a new organizationzz</Button>
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
