import {Box, Button, ButtonGroup, Divider, Typography, CircularProgress, Link} from "@mui/material";
import { useState } from "react";
import { vars } from "../../../theme/variables";
import { ListIcon, TableChartIcon } from "../../../Icons";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import OrganizationsList from "../../common/OrganizationsList";
import CustomViewButton from "../../common/CustomViewButton";
import { createNewOrganization } from "../../../api/endpoints/apiService";
import BasicDialog from "../../common/BasicDialog";

const { gray600, gray200, brand700, brand800 } = vars;

const linkStyles = {
  color: brand700,
  fontWeight: 600, 
  textDecoration: "none", 
  "&:hover": { 
    color: brand800 
  }
}

const Organizations = () => {
  const [listView, setListView] = useState('list');
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState();
  const [open, setOpen] = useState(false);

  // TODO: change this to be dynamic when we get the response from api call
  const groupname = "aigul"

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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

  useEffect( () => {
    setLoading(true)
    fetchOrganizations();
  }, []);

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
          <Button type="string" color="secondary" startIcon={<AddOutlinedIcon />} onClick={createOrganization}>
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
};

export default Organizations;
