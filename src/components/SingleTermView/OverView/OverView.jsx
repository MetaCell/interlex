import {
  Box,
  Divider,
  Grid,
} from "@mui/material";
import Hierarchy from "./Hierarchy";
import Predicates from "./Predicates";
import Details from "./Details";
import {useParams} from "react-router-dom";

const OverView = () => {
  const { term } = useParams();
  return (
    <Box p="2.5rem 5rem" sx={{
      overflow: 'auto',
    }}>
     <Details term={term} />
      <Box p='5rem 0'>
        <Divider />
        <Grid container pt='5.25rem' spacing='2.75rem'>
          <Grid item xs={12} lg={4}>
            <Hierarchy />
          </Grid>
          <Grid item xs={12} lg={8}>
            <Predicates />
          </Grid>
        </Grid>
      </Box>
    </Box>
  
  )}

export default OverView