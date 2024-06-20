import {
  Box,
  Divider,
  Grid,
} from "@mui/material";
import Hierarchy from "./Hierarchy";
import Predicates from "./Predicates";
import Details from "./Details";
import RawDataViewer from "./RawDataViewer";
import {useQuery} from "../../../helpers";

const OverView = ({ isCodeViewVisible, selectedDataFormat }) => {
  const query = useQuery();
  const searchTerm = query.get('searchTerm');

  return (
    <Box p="2.5rem 5rem" sx={{
      overflow: 'auto',
    }}>
      {isCodeViewVisible ? <RawDataViewer dataId={"ilx_0101901"} dataFormat={selectedDataFormat} /> :
        <>
          <Details term={searchTerm} />
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
        </>
      }
    </Box>
  )
}

export default OverView