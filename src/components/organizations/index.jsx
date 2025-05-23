import { useState, useContext } from "react";
import OrganizationsList from "../common/OrganizationsList";
import { Box, Typography, CircularProgress, Stack, Button } from "@mui/material";
import { useOrganizations } from "../../helpers/useOrganizations";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import { GlobalDataContext } from "../../contexts/DataContext";
import MessageDialog from "../common/MessageDialog";

import { vars } from "../../theme/variables";
const { gray700 } = vars;


const Organizations = () => {
  const { user } = useContext(GlobalDataContext);
  const [open, setOpen] = useState(false);
  const groupname = user?.groupname || "base";

  const {
    organizations,
    loading,
    message,
    createOrganization
  } = useOrganizations(groupname);

  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    await createOrganization();
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
        {Object.keys(user).length !== 0 && <Button type="string" startIcon={<GroupAddOutlinedIcon />} onClick={handleCreateOrganization}>Create a new organization</Button>}
      </Stack>
      <OrganizationsList organizations={organizations} />
      {message && (
        <MessageDialog open={open} title="Create a new organization" handleClose={handleClose} message={message} />
      )}
    </Box>
  );
}

export default Organizations;
