import { Box, Button, ButtonGroup, Divider, Typography, CircularProgress } from "@mui/material";
import { useState } from "react";
import { useOrganizations } from "../../../helpers/useOrganizations";
import { vars } from "../../../theme/variables";
import { ListIcon, TableChartIcon } from "../../../Icons";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import OrganizationsList from "../../common/OrganizationsList";
import CustomViewButton from "../../common/CustomViewButton";
import MessageDialog from "../../common/MessageDialog";
import { GlobalDataContext } from "../../../contexts/DataContext";

const { gray600, gray200 } = vars;


const Organizations = () => {
  const [open, setOpen] = useState(false);
  const { user } = GlobalDataContext();
  const groupname = user?.groupname || "base";

  const {
    listView,
    setListView,
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
    <Box p='2.5rem 5rem' sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.75rem',
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography fontSize='1.5rem' color={gray600} fontWeight={600}>
          My Organizations
        </Typography>
        <Box display="flex" alignItems="center" gap={2} justifyContent="end">
          <ButtonGroup variant="outlined" aria-label="View mode">
            <CustomViewButton
              view="list"
              listView={listView}
              onClick={() => setListView('list')}
              icon={<ListIcon />}
            />
            <CustomViewButton
              view="table"
              listView={listView}
              disabled
              onClick={() => setListView('table')}
              icon={<TableChartIcon />}
            />
          </ButtonGroup>
          <Divider orientation="vertical" flexItem sx={{ borderColor: gray200 }} />
          <Button type="string" color="secondary" startIcon={<AddOutlinedIcon />} onClick={handleCreateOrganization}>
            Create a new organization
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddOutlinedIcon />}
          >
            Join an organization
          </Button>
        </Box>
      </Box>
      <OrganizationsList organizations={organizations} viewJoinButton={false} />
      {message && (
        <MessageDialog open={open} title="Create a new organization" handleClose={handleClose} message={message} />
      )}
    </Box>
  );
};

export default Organizations;
