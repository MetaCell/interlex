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
import { useCallback, useEffect, useMemo, useState } from "react";
import { getMatchTerms, getRawData, getTermHierarchies, getTermPredicates } from "../../../api/endpoints/apiService";

const OverView = ({ searchTerm, isCodeViewVisible, selectedDataFormat, group = "base" }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jsonData, setJsonData] = useState(null);

  // options for Hierarchy’s SingleSearch
  const [hierarchyOptions, setHierarchyOptions] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);

  // hierarchies for the currently selected value
  const [triplesChildren, setTriplesChildren] = useState([]);
  const [triplesSuperclasses, setTriplesSuperclasses] = useState([]);

  // predicates for the Predicates panel (gold-standard shape)
  const [predicateGroups, setPredicateGroups] = useState([]);

  // Build SingleSearch options from hierarchy triples
const toHierarchyOptionsFromTriples = (triples = []) => {
  const toCurie = (id) => {
    if (!id) return id;
    // http://uri.interlex.org/base/ilx_0100573 -> ILX:0100573
    const m = id.match(/\/ilx_(\d+)/i);
    return m ? `ILX:${m[1]}` : id;
  };

  const add = (map, node) => {
    const id = node?.id;
    const label = node?.label;
    if (!id || !label) return;

    // skip OWL/property nodes and empty labels
    if (id === 'owl:Class') return;
    if (id.startsWith('http://www.w3.org/')) return;

    map.set(id, { label, handler: toCurie(id) });
  };

  const uniq = new Map();
  for (const t of triples) {
    add(uniq, t.subject);
    add(uniq, t.object);
  }
  return Array.from(uniq.values());
};

  // Debounced search → populate options + default selection
  const fetchTerms = useCallback(
    debounce((term) => {
      if (!term) {
        setData(null);
        setHierarchyOptions([]);
        setSelectedValue(null);
        setLoading(false);
        return;
      }

      getMatchTerms(group, term).then(apiData => {
        const results = apiData?.results || [];
        setData(results?.[0] || null);
        
        // default selection if needed
        setSelectedValue(prev =>
          prev && results.some(o => o.id === prev?.id) ? prev : results[0] || null
        );

        setLoading(false);
      });
    }, 300),
    [group]
  );

  // JSON-LD for the raw viewer
  const fetchJSONFile = useCallback(() => {
    if (!searchTerm) {
      setJsonData(null);
      return;
    }
    getRawData(group, searchTerm, 'jsonld').then(rawResponse => {
      setJsonData(rawResponse);
    });
  }, [searchTerm, group]);

  // Fetch both hierarchy directions for the selected value
  const fetchHierarchies = useCallback(async (curieLike, groupname) => {
    try {
      let termId = curieLike.split('/').pop() || curieLike;
      termId = termId.replace(/^ilx_/, "ILX:");

      const superRes = await getTermHierarchies({ groupname, termId, objToSub: false });
      setTriplesSuperclasses(superRes.triples || []);
      const deduped = toHierarchyOptionsFromTriples(superRes?.triples);
      setHierarchyOptions(deduped);
    } catch (e) {
      console.error("fetchHierarchies error:", e);
      setTriplesChildren([]);
      setTriplesSuperclasses([]);
    }
  }, []);

  // Fetch gold-standard predicate groups for the Predicates UI
  // Fetch gold-standard predicate groups for the Predicates UI
const fetchPredicates = useCallback(async (curieLike, groupname) => {
  try {
    // Normalize to ILX:NNNNNN form (same normalization you use for hierarchies)
    let termId = curieLike.split('/').pop() || curieLike; // e.g. 'ilx_0100573' or 'ILX:0100573'
    termId = termId.replace(/^ilx_/i, 'ILX:');

    // Optional: debug so you can see it’s being called
    // console.debug('getTermPredicates →', { groupname, termId });

    const groups = await getTermPredicates({ groupname, termId });
    setPredicateGroups(groups || []);
  } catch (e) {
    console.error("fetchPredicates error:", e);
    setPredicateGroups([]);
  }
}, []);

  useEffect(() => {
    setLoading(true);
    fetchTerms(searchTerm);
    fetchJSONFile();
    return () => {
      fetchTerms.cancel();
    };
  }, [searchTerm, fetchTerms, fetchJSONFile]);

  useEffect(() => {
    if (selectedValue?.id) {
      fetchPredicates(selectedValue.id, "base");
      fetchHierarchies(selectedValue.id, "base");
    } else {
      setTriplesChildren([]);
      setTriplesSuperclasses([]);
      setPredicateGroups([]);
    }
  }, [selectedValue, group, fetchHierarchies, fetchPredicates]);

  const memoData = useMemo(() => data, [data]);

  return (
    <Box p="2.5rem 5rem" sx={{ overflow: 'auto' }}>
      {isCodeViewVisible ? (
        <RawDataViewer dataId={searchTerm} dataFormat={selectedDataFormat} />
      ) : (
        <>
          <Details data={memoData} jsonData={jsonData} loading={loading} />
          <Box p='5rem 0'>
            <Divider />
            <Grid container pt='5.25rem' spacing='2.75rem'>
              <Grid item xs={12} lg={4}>
                <Hierarchy
                  options={hierarchyOptions}
                  selectedValue={selectedValue}
                  onSelect={setSelectedValue}
                  triplesChildren={triplesChildren}
                  triplesSuperclasses={triplesSuperclasses}
                />
              </Grid>
              <Grid item xs={12} lg={8}>
                <Predicates
                  data={predicateGroups}
                  isGraphVisible={true}
                />
              </Grid>
            </Grid>
          </Box>
        </>
      )}
    </Box>
  );
}

OverView.propTypes = {
  searchTerm: PropTypes.string,
  isCodeViewVisible: PropTypes.bool,
  selectedDataFormat: PropTypes.string,
  group: PropTypes.string
}

export default OverView;
