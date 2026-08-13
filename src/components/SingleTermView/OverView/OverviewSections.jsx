import { memo, useMemo } from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import Details from "./Details";
import Hierarchy from "./Hierarchy";
import Predicates from "./Predicates";
import { useObservable } from "./overviewStore";
import { focusNodeFromJsonLd } from "../../../parsers/predicateMutations";

const SUBCLASS_OF_IRI = "http://www.w3.org/2000/01/rdf-schema#subClassOf";

// Each section subscribes to its own stream and is memoized, so an unrelated
// OverView re-render (or a sibling section resolving) never re-renders it.
// `reserveHeight` keeps a minimum footprint while loading so late-arriving
// content above a section can't shove a section you are already scrolled to.

export const DetailsSection = memo(function DetailsSection({ subject, group, onMutate, reserveHeight }) {
  const { loading, data, jsonData } = useObservable(subject);
  return (
    <Box sx={{ minHeight: loading ? reserveHeight : undefined }}>
      <Details loading={loading} data={data} jsonData={jsonData} group={group} onMutate={onMutate} />
    </Box>
  );
});

DetailsSection.propTypes = {
  subject: PropTypes.object.isRequired,
  group: PropTypes.string,
  onMutate: PropTypes.func,
  reserveHeight: PropTypes.number,
};

export const HierarchySection = memo(function HierarchySection({
  subject,
  selectedSubject,
  detailsSubject,
  onSelect,
  group,
  onMutate,
  reserveHeight,
}) {
  const { loading, options, treeChildren, treeSuperclasses } = useObservable(subject);
  const selectedValue = useObservable(selectedSubject);
  // Direct superclasses are the only editable part of the hierarchy: they are
  // rdfs:subClassOf triples ON the focus node. Children are the same predicate
  // on OTHER terms, so they can't be patched from here.
  const { jsonData } = useObservable(detailsSubject);
  const directSuperclasses = useMemo(() => {
    const node = focusNodeFromJsonLd(jsonData);
    const raw = node?.["rdfs:subClassOf"] ?? node?.[SUBCLASS_OF_IRI];
    const arr = raw == null ? [] : Array.isArray(raw) ? raw : [raw];
    return arr
      .map((v) => (typeof v === "string" ? v : v?.["@id"] || v?.["@value"] || ""))
      .filter(Boolean);
  }, [jsonData]);

  return (
    <Box sx={{ minHeight: loading ? reserveHeight : undefined }}>
      <Hierarchy
        options={options}
        selectedValue={selectedValue}
        onSelect={onSelect}
        treeChildren={treeChildren}
        treeSuperclasses={treeSuperclasses}
        loading={loading}
        directSuperclasses={directSuperclasses}
        group={group}
        onMutate={onMutate}
      />
    </Box>
  );
});

HierarchySection.propTypes = {
  subject: PropTypes.object.isRequired,
  selectedSubject: PropTypes.object.isRequired,
  detailsSubject: PropTypes.object.isRequired,
  onSelect: PropTypes.func,
  group: PropTypes.string,
  onMutate: PropTypes.func,
  reserveHeight: PropTypes.number,
};

export const PredicatesSection = memo(function PredicatesSection({
  subject,
  group,
  onMutate,
  reserveHeight,
}) {
  const { loading, data, focusId } = useObservable(subject);
  return (
    <Box sx={{ minHeight: loading ? reserveHeight : undefined }}>
      <Predicates
        data={data}
        isGraphVisible={true}
        loading={loading}
        focusId={focusId}
        group={group}
        onMutate={onMutate}
      />
    </Box>
  );
});

PredicatesSection.propTypes = {
  subject: PropTypes.object.isRequired,
  group: PropTypes.string,
  onMutate: PropTypes.func,
  reserveHeight: PropTypes.number,
};
