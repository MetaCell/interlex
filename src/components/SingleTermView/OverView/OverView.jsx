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
import { getMatchTerms, getRawData, getTermHierarchies } from "../../../api/endpoints/apiService";

// ---- HTML table -> triples (subject, predicate, object) ----
function parseTransitiveHtml(html) {
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const rows = Array.from(doc.querySelectorAll("table tr")).slice(1);
    const triples = [];
    for (const tr of rows) {
      const tds = tr.querySelectorAll("td");
      if (tds.length < 3) continue;
      const subjLink = tds[0]?.querySelector("a");
      const predLink = tds[1]?.querySelector("a");
      const objLink  = tds[2]?.querySelector("a");
      const subject = {
        id: subjLink?.getAttribute("href") || (subjLink?.textContent || "").trim(),
        label: (subjLink?.textContent || "").trim(),
      };
      const predicate = {
        id: predLink?.getAttribute("href") || (predLink?.textContent || "").trim(),
        label: (predLink?.textContent || "").trim(),
      };
      const object = objLink
        ? { id: objLink.getAttribute("href") || "", label: (objLink.textContent || "").trim() }
        : { id: (tds[2]?.textContent || "").trim(), label: (tds[2]?.textContent || "").trim() };
      triples.push({ subject, predicate, object });
    }
    return triples;
  } catch {
    return [];
  }
}

// ---- Normalize any backend shape -> triples ----
function extractTriples(result) {
  if (result?.results?.bindings) {
    return result.results.bindings.map((b) => ({
      subject:   { id: b.subject?.value ?? "",   label: b.subject?.value ?? "" },
      predicate: { id: b.predicate?.value ?? "", label: b.predicate?.value ?? "" },
      object:    { id: b.object?.value ?? "",    label: b.object?.value ?? "" },
    }));
  }
  if (Array.isArray(result?.triples)) return result.triples;
  if (typeof result === "string") return parseTransitiveHtml(result);
  if (Array.isArray(result)) return result;
  return [];
}

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchTerms = useCallback(
    debounce((term) => {
      if (term) {
        getMatchTerms(group, term).then(apiData => {
          const results = apiData?.results || [];
          setData(results?.[0] || null);

          // Build options { label, handler }
          const opts = results
            .map((r) => {
              const label =
                r.label ||
                r.rdfsLabel ||
                r.prefLabel ||
                r.term ||
                r.name ||
                r.curie ||
                r.id;
              const handler =
                r.curie || r.ilx || r.id || r.termId || r.identifier;
              return label && handler ? { label, handler } : null;
            })
            .filter(Boolean);

          // de-dupe by handler
          const seen = new Set();
          const deduped = opts.filter(o => (seen.has(o.handler) ? false : (seen.add(o.handler), true)));

          setHierarchyOptions(deduped);

          // default selection
          setSelectedValue(prev =>
            prev && deduped.some(o => o.handler === prev?.handler) ? prev : deduped[0] || null
          );

          setLoading(false);
        });
      } else {
        setData(null);
        setHierarchyOptions([]);
        setSelectedValue(null);
        setLoading(false);
      }
    }, 300),
    [group]
  );

  const fetchJSONFile = useCallback(() => {
    if (!searchTerm) {
      setJsonData(null);
      return;
    }
    getRawData(group, searchTerm, 'jsonld').then(rawResponse => {
      setJsonData(rawResponse);
    });
  }, [searchTerm, group]);

  // Fetch hierarchies for selectedValue
  const fetchHierarchies = useCallback(async (curieLike, groupname) => {
    if (!curieLike) {
      setTriplesChildren([]);
      setTriplesSuperclasses([]);
      return;
    }
    try {
      const [resChildren, resSupers] = await Promise.all([
        getTermHierarchies({ groupname, termId: curieLike, objToSub: true }),
        getTermHierarchies({ groupname, termId: curieLike, objToSub: false }),
      ]);
      setTriplesChildren(extractTriples(resChildren));
      setTriplesSuperclasses(extractTriples(resSupers));
    } catch (e) {
      console.error("fetchHierarchies error:", e);
      setTriplesChildren([]);
      setTriplesSuperclasses([]);
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
    // infer groupname from data if you store it in context; fallback to "base"
    const groupname = group || "base";
    if (selectedValue?.handler) {
      fetchHierarchies(selectedValue.handler, groupname);
    } else {
      setTriplesChildren([]);
      setTriplesSuperclasses([]);
    }
  }, [selectedValue, group, fetchHierarchies]);

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
                  basePredicates={memoData?.predicates || []}
                  triplesChildren={triplesChildren}
                  triplesSuperclasses={triplesSuperclasses}
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
