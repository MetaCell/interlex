import { memo } from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import Details from "./Details";
import Hierarchy from "./Hierarchy";
import Predicates from "./Predicates";
import { useObservable } from "./overviewStore";

// Each section subscribes to its own stream and is memoized, so an unrelated
// OverView re-render (or a sibling section resolving) never re-renders it.
// `reserveHeight` keeps a minimum footprint while loading so late-arriving
// content above a section can't shove a section you are already scrolled to.

export const DetailsSection = memo(function DetailsSection({ subject, reserveHeight }) {
  const { loading, data, jsonData } = useObservable(subject);
  return (
    <Box sx={{ minHeight: loading ? reserveHeight : undefined }}>
      <Details loading={loading} data={data} jsonData={jsonData} />
    </Box>
  );
});

DetailsSection.propTypes = {
  subject: PropTypes.object.isRequired,
  reserveHeight: PropTypes.number,
};

export const HierarchySection = memo(function HierarchySection({
  subject,
  selectedSubject,
  onSelect,
  reserveHeight,
}) {
  const { loading, options, treeChildren, treeSuperclasses } = useObservable(subject);
  const selectedValue = useObservable(selectedSubject);
  return (
    <Box sx={{ minHeight: loading ? reserveHeight : undefined }}>
      <Hierarchy
        options={options}
        selectedValue={selectedValue}
        onSelect={onSelect}
        treeChildren={treeChildren}
        treeSuperclasses={treeSuperclasses}
        loading={loading}
      />
    </Box>
  );
});

HierarchySection.propTypes = {
  subject: PropTypes.object.isRequired,
  selectedSubject: PropTypes.object.isRequired,
  onSelect: PropTypes.func,
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
