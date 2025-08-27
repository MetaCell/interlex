import {
  Box,
  Divider,
  Grid,
  CircularProgress,
} from "@mui/material";
import Details from "./Details";
import { debounce } from "lodash";
import PropTypes from "prop-types";
import Hierarchy from "./Hierarchy";
import Predicates from "./Predicates";
import RawDataViewer from "./RawDataViewer";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getMatchTerms,
  getRawData,
  getTermHierarchies,
  getTermPredicates,
} from "../../../api/endpoints/apiService";
import { toHierarchyOptionsFromTriples } from "../../../parsers/hierarchies-parser";

const OverView = ({ searchTerm, isCodeViewVisible, selectedDataFormat, group = "base" }) => {
  const [data, setData] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [jsonData, setJsonData] = useState(null);

  // options for Hierarchy’s SingleSearch
  const [hierarchyOptions, setHierarchyOptions] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);

  // hierarchies (triples) for the currently selected value
  const [triplesChildren, setTriplesChildren] = useState([]);
  const [triplesSuperclasses, setTriplesSuperclasses] = useState([]);

  // predicates panel data (already gold-standard shaped)
  const [predicateGroups, setPredicateGroups] = useState([]);

  // fine-grained loading states
  const [loadingHierarchies, setLoadingHierarchies] = useState(false);
  const [loadingPredicates, setLoadingPredicates] = useState(false);

  // ---------- FIX: debounced search with explicit deps ----------
  const debouncedFetchTerms = useMemo(
    () =>
      debounce(async (term, groupname) => {
        if (!term) {
          setData(null);
          setHierarchyOptions([]);
          setSelectedValue(null);
          setPageLoading(false);
          return;
        }
        try {
          const apiData = await getMatchTerms(groupname, term);
          const results = apiData?.results || [];
          setData(results?.[0] || null);

          // keep selection if still present; else first result
          setSelectedValue((prev) =>
            prev && results.some((o) => o.id === prev?.id) ? prev : results[0] || null
          );
        } finally {
          setPageLoading(false);
        }
      }, 300),
    []
  );
  // -------------------------------------------------------------

  // JSON-LD for raw viewer
  const fetchJSONFile = useCallback(() => {
    if (!searchTerm) {
      setJsonData(null);
      return;
    }
    getRawData(group, searchTerm, "jsonld").then((rawResponse) => {
      setJsonData(rawResponse);
    });
  }, [searchTerm, group]);

  // Fetch hierarchies for the selected value (superclasses for now)
  const fetchHierarchies = useCallback(async (curieLike, groupname) => {
    setLoadingHierarchies(true);
    try {
      let termId = curieLike.split("/").pop() || curieLike;
      termId = termId.replace(/^ilx_/, "ILX:");

      const superRes = await getTermHierarchies({ groupname, termId, objToSub: false });
      const triples = superRes?.triples || [];
      setTriplesSuperclasses(triples);

      // Build SingleSearch options from the triples we got back
      const deduped = toHierarchyOptionsFromTriples(triples);
      setHierarchyOptions(deduped);
    } catch (e) {
      console.error("fetchHierarchies error:", e);
      setTriplesChildren([]);
      setTriplesSuperclasses([]);
      setHierarchyOptions([]);
    } finally {
      setLoadingHierarchies(false);
    }
  }, []);

  // Fetch predicates for the Predicates panel
  const fetchPredicates = useCallback(async (curieLike, groupname) => {
    setLoadingPredicates(true);
    try {
      // Normalize to ILX:NNNN… for the endpoint
      let termId = curieLike.split("/").pop() || curieLike;
      termId = termId.replace(/^ilx_/i, "ILX:");

      const groups = await getTermPredicates({ groupname, termId });
      setPredicateGroups(groups || []);
    } catch (e) {
      console.error("fetchPredicates error:", e);
      setPredicateGroups([]);
    } finally {
      setLoadingPredicates(false);
    }
  }, []);

  // bootstrapping on search change
  useEffect(() => {
    setPageLoading(true);
    debouncedFetchTerms(searchTerm, group);
    fetchJSONFile();
    return () => {
      debouncedFetchTerms.cancel();
    };
  }, [searchTerm, group, debouncedFetchTerms, fetchJSONFile]);

  // react to selection changes
  useEffect(() => {
    if (selectedValue?.id) {
      // Trigger both in parallel; each has its own loading state
      fetchPredicates(selectedValue.id, "base");
      fetchHierarchies(selectedValue.id, "base");
    } else {
      setTriplesChildren([]);
      setTriplesSuperclasses([]);
      setPredicateGroups([]);
      setHierarchyOptions([]);
    }
  }, [selectedValue, group, fetchHierarchies, fetchPredicates]);

  const memoData = useMemo(() => data, [data]);

  return (
    <Box p="2.5rem 5rem" sx={{ overflow: "auto" }}>
      {isCodeViewVisible ? (
        <RawDataViewer dataId={searchTerm} dataFormat={selectedDataFormat} />
      ) : (
        <>
          <Details data={memoData} jsonData={jsonData} loading={pageLoading} />
          <Box p="5rem 0">
            <Divider />
            <Grid container pt="5.25rem" spacing="2.75rem">
              <Grid item xs={12} lg={4}>
                {loadingHierarchies ? (
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 240 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Hierarchy
                    options={hierarchyOptions}
                    selectedValue={selectedValue}
                    onSelect={setSelectedValue}
                    triplesChildren={triplesChildren}
                    triplesSuperclasses={triplesSuperclasses}
                  />
                )}
              </Grid>
              <Grid item xs={12} lg={8}>
                {loadingPredicates ? (
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 240 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Predicates data={predicateGroups} isGraphVisible={true} />
                )}
              </Grid>
            </Grid>
          </Box>
        </>
      )}
    </Box>
  );
};

OverView.propTypes = {
  searchTerm: PropTypes.string,
  isCodeViewVisible: PropTypes.bool,
  selectedDataFormat: PropTypes.string,
  group: PropTypes.string,
};

export default OverView;
