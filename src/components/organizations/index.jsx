import {useEffect, useState } from "react";
import {Box, Typography, CircularProgress} from "@mui/material";
import { vars } from "../../theme/variables";
import { getOrganizations } from "../../api/endpoints";
import OrganizationsList from "../common/OrganizationsList";

const { gray700 } = vars;

const URL = "https://raw.githubusercontent.com/MetaCell/interlex/feature/ILEX-41/src/static/Organizations.json"
const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrganizations = async() => {
    const organizations = await getOrganizations()
    setOrganizations(organizations);
    setLoading(false)
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
  // if (error) {
  //   return <div>error</div>;
  // }
  return (
    <Box p='2.25rem 5rem' flexGrow={1} overflow='auto'>
      <Typography fontSize='1.5rem' color={gray700} fontWeight={600} mb='1.5rem'>
        {organizationss.length} Organizations
      </Typography>
      <OrganizationsList organizations={organizationss} />
    </Box>
  );
}

export default Organizations;
