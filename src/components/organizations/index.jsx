import { useState } from "react";
import OrganizationsList from "../common/OrganizationsList";
import { Box, Typography, CircularProgress, Stack, Button } from "@mui/material";
import { useOrganizations } from "../../helpers/useOrganizations";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import MessageDialog from "../common/MessageDialog";

import { vars } from "../../theme/variables";
const { gray700 } = vars;


const Organizations = () => {
  const [open, setOpen] = useState(false);

  // TODO: change this to be dynamic when we get the response from api call
  const groupname = "aigul"

  const {
    organizations,
    loading,
    message,
    createOrganization
  } = useOrganizations(groupname);

  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    // eslint-disable-next-line no-unused-vars
    const success = await createOrganization();
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
        <Typography fontSize='1.5rem' color={gray700} fontWeight={600} mb='1.5rem'>
          {organizations?.length} Organizations
        </Typography>
        <Button type="string" startIcon={<GroupAddOutlinedIcon />} onClick={handleCreateOrganization}>Create a new organization</Button>
      </Stack>
      <OrganizationsList organizations={organizations} />
      {message && (
        <MessageDialog open={open} title="Create a new organization" handleClose={handleClose} message={message} />
      )}
    </Box>
  );
}

export default Organizations;
