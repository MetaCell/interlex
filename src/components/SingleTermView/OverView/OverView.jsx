// SingleTermView/OverView/OverView.jsx
import {
  Box,
  Divider,
  Grid,
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

import {
  toHierarchyOptionsFromTriples,
  buildChildrenTreeFromTriples,
  buildSuperclassesTreeFromTriples,
  dedupePredicateGroups
} from "../../../parsers/hierarchies-parser";

const OverView = ({ searchTerm, isCodeViewVisible = false, selectedDataFormat, group = "base" }) => {
  const [data, setData] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [jsonData, setJsonData] = useState(null);

  // SingleSearch options + selection
  const [hierarchyOptions, setHierarchyOptions] = useState({});
  const [selectedValue, setSelectedValue] = useState(null); // {id, label}

  // computed trees
  const [treeChildren, setTreeChildren] = useState([]);
  const [treeSuperclasses, setTreeSuperclasses] = useState([]);

  // predicates
  const [predicateGroups, setPredicateGroups] = useState([]);

  // loading flags
  const [loadingHierarchies, setLoadingHierarchies] = useState(true);
  const [loadingPredicates, setLoadingPredicates] = useState(true);

  // debounced search (explicit deps to satisfy eslint)
  const debouncedFetchTerms = useMemo(
    () =>
      debounce(async (term, groupname) => {
        if (!term) {
          setData(null);
          setSelectedValue(null);
          setPageLoading(false);
          return;
        }
        try {
          const apiData = await getMatchTerms(groupname, term);
          const results = apiData?.results || [];
          const first = results?.[0] || null;

          // normalize first result -> { id, label }
          let id =
            first?.curie ||
            first?.ilx ||
            first?.id ||
            first?.termId ||
            first?.identifier ||
            null;
          let label =
            first?.label ||
            first?.rdfsLabel ||
            first?.prefLabel ||
            first?.term ||
            first?.name ||
            id;

          if (id) setSelectedValue({ id, label });
          setData(first);
        } finally {
          setPageLoading(false);
        }
      }, 300),
    []
  );

  const fetchJSONFile = useCallback(() => {
    if (!searchTerm) {
      setJsonData(null);
      return;
    }
    getRawData(group, searchTerm, "jsonld").then((rawResponse) => {
      setJsonData(rawResponse);
    });
  }, [searchTerm, group]);

  // normalize ID for API calls
  const toILX = (curieLike) => {
    let t = (curieLike || "").split("/").pop() || curieLike;
    return t.replace(/^ilx_/i, "ILX:");
  };

  // fetch both directions + compute trees + build options
  const fetchHierarchies = useCallback(async (curieLike, groupname) => {
    setLoadingHierarchies(true);
    try {
      const termId = toILX(curieLike);

      const [childRes, superRes] = await Promise.all([
        getTermHierarchies({ groupname, termId, objToSub: true }),
        getTermHierarchies({ groupname, termId, objToSub: false }),
      ]);

      const childTriples = childRes?.triples || [];
      const superTriples = superRes?.triples || [];

      // trees for the currently selected ID
      setTreeChildren(buildChildrenTreeFromTriples(childTriples, termId));
      setTreeSuperclasses(buildSuperclassesTreeFromTriples(superTriples, termId));

      // update SingleSearch options (union of both)
      const children = toHierarchyOptionsFromTriples(childTriples);
      const superclasses = toHierarchyOptionsFromTriples(superTriples);
      setHierarchyOptions({children: children, superclasses: superclasses});
      setLoadingHierarchies(false);
    } catch (e) {
      console.error("fetchHierarchies error:", e);
      setTreeChildren([]);
      setTreeSuperclasses([]);
      setHierarchyOptions([]);
      setLoadingHierarchies(false);
    }
  }, []);

  const fetchPredicates = useCallback(async (curieLike, groupname) => {
    setLoadingPredicates(true);
    try {
      const termId = toILX(curieLike);
      const groups = await getTermPredicates({ groupname, termId });
      setPredicateGroups(groups || []);
    } catch (e) {
      console.error("fetchPredicates error:", e);
      setLoadingPredicates(false);
    } finally {
      setLoadingPredicates(false);
    }
  }, []);

  useEffect(() => {
    setPageLoading(true);
    setLoadingHierarchies(true);
    setLoadingPredicates(true);
    debouncedFetchTerms(searchTerm, group);
    fetchJSONFile();
    return () => debouncedFetchTerms.cancel();
  }, [searchTerm, group, debouncedFetchTerms, fetchJSONFile]);

  useEffect(() => {
    if (selectedValue?.id) {
      fetchHierarchies(selectedValue.id, "base");
      fetchPredicates(selectedValue.id, "base");
    } else {
      setTreeChildren([]);
      setTreeSuperclasses([]);
      setPredicateGroups([]);
      setHierarchyOptions([]);
    }
  }, [selectedValue, fetchHierarchies, fetchPredicates]);

  const memoData = useMemo(() => data, [data]);

  const rawPredicates = [
    ...(Array.isArray(predicateGroups) ? predicateGroups : []),
    ...(memoData && Array.isArray(memoData.predicates) ? memoData.predicates : []),
  ];
  
  const predicates = dedupePredicateGroups(rawPredicates);  

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
                <Hierarchy
                  options={hierarchyOptions}
                  selectedValue={selectedValue}
                  onSelect={setSelectedValue}
                  treeChildren={treeChildren}
                  treeSuperclasses={treeSuperclasses}
                  loading={loadingHierarchies}
                />
              </Grid>
              <Grid item xs={12} lg={8}>
                <Predicates data={predicates} isGraphVisible={true} loading={loadingPredicates}/>
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
