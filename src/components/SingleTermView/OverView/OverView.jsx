import {
  Box,
  Divider,
  Grid,
} from "@mui/material";
import Details from "./Details";
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import Hierarchy from "./Hierarchy";
import Predicates from "./Predicates";
import RawDataViewer from "./RawDataViewer";
import {useCallback, useEffect, useMemo, useState} from "react";
import { getMatchTerms } from "../../../api/endpoints";

const OverView = ({ searchTerm, isCodeViewVisible, selectedDataFormat }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchTerms = useCallback(
    debounce((searchTerm) => {
      if (searchTerm) {
        getMatchTerms("base", searchTerm).then(data => {
          console.log("data from api call: ", data)
          setData(data?.results?.[0]);
          setLoading(false);
        });
      }
    }, 300),
    []
  );
  
  useEffect(() => {
    setLoading(true);
    fetchTerms(searchTerm);
    return () => {
      fetchTerms.cancel();
    };
  }, [searchTerm, fetchTerms]);

  const memoData = useMemo(() => data, [data]);
  
  return (
    <Box p="2.5rem 5rem" sx={{
      overflow: 'auto',
    }}>
      {isCodeViewVisible ? <RawDataViewer dataId={searchTerm} dataFormat={selectedDataFormat} /> :
        <>
          <Details data={memoData} loading={loading} />
          <Box p='5rem 0'>
            <Divider />
            <Grid container pt='5.25rem' spacing='2.75rem'>
              <Grid item xs={12} lg={4}>
                <Hierarchy />
              </Grid>
              <Grid item xs={12} lg={8}>
                <Predicates data={memoData} loading={loading} isGraphVisible={true} />
              </Grid>
            </Grid>
          </Box>
        </>
      }
    </Box>
  )
}

OverView.propTypes = {
  searchTerm: PropTypes.string,
  isCodeViewVisible: PropTypes.bool,
  selectedDataFormat: PropTypes.string
}

export default OverView;
