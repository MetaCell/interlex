import { useEffect, useState } from "react";
import OrganizationsList from "../common/OrganizationsList";
import { Box, Typography, CircularProgress, Stack, Button, Link } from "@mui/material";
import BasicDialog from "../common/BasicDialog";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import { createNewOrganization, getOrganizations } from "../../api/endpoints/apiService";
import { GlobalDataContext } from "../../contexts/DataContext";

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
  const { user } = GlobalDataContext();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState();

  // TODO: change this to be dynamic when we get the response from api call
  const groupname = user?.groupname || "base";

  const fetchOrganizations = async() => {
    setLoading(true);

    try {
      const response = await getOrganizations(groupname)
      if(response.length > 0){
        setOrganizations(response)
      }
    } catch (err) {
      console.error('An unknown error occurred: ', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect( () => {
    setLoading(true)
    fetchOrganizations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const createOrganization = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      // eslint-disable-next-line no-unused-vars
      const response = await createNewOrganization({ group: groupname, data: "a test" })
      
    } catch (err) {
      console.error('An unknown error occurred: ', err);

      console.log("error.res.status: ", err.response.status)
      if(err.response.status === 501) {
        setMessage(err.response.data)
      }
    } finally {
      setLoading(false);
    }

    handleOpen()
  }

  if (loading) {
    return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 1 }}>
      <CircularProgress />
    </Box>
  }

  return (
    <Box p='2.25rem 5rem' flexGrow={1} overflow='auto'>
      <Stack direction="row" sx={{ justifyContent: "space-between" }}>
        <Typography fontSize='1.5rem' color={gray700} fontWeight={600} mb='1.5rem'>
          {organizations?.length} Organizations
        </Typography>
        <Button type="string" startIcon={<GroupAddOutlinedIcon />} onClick={createOrganization}>Create a new organization</Button>
      </Stack>
      <OrganizationsList organizations={organizations} />
      {message && (
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
            {message?.split(/(\S+@\S+\.\S+)/).map((part, i) => 
              part.match(/\S+@\S+\.\S+/) ? <Link key={i} href={`mailto:${part}`} sx={linkStyles}>{part}</Link> : part
            )}
          </Typography>
        </BasicDialog>
      )}
    </Box>
  );
}

export default Organizations;
