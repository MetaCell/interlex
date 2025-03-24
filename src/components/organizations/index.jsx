import {useEffect, useState } from "react";
import { getOrganizations } from "../../api/endpoints";
import OrganizationsList from "../common/OrganizationsList";
import {Box, Typography, CircularProgress} from "@mui/material";

import { vars } from "../../theme/variables";
const { gray700 } = vars;

const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrganizations = async() => {
    const organizations = await getOrganizations("base")
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

  return (
    <Box p='2.25rem 5rem' flexGrow={1} overflow='auto'>
      <Typography fontSize='1.5rem' color={gray700} fontWeight={600} mb='1.5rem'>
        {organizations.length} Organizations
      </Typography>
      <OrganizationsList organizations={organizations} />
    </Box>
  );
}

export default Organizations;
