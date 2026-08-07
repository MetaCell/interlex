import PropTypes from "prop-types";
import { useCallback, useMemo, useState } from "react";
import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import CustomSingleSelect from "../common/CustomSingleSelect";
import OntologyHierarchyTree from "./OntologyHierarchyTree";
import { RestartAlt, TargetCross } from "../../Icons";

// The "Ontology hierarchy" widget: the subClassOf tree of the ontology, opened on its root class
// (the starting selection the design calls for).
//
// The tree always shows the whole hierarchy — clicking a term picks what the Terms table beside it
// lists, so re-scoping the tree to the choice would take away the rows the user browses *with*.
// Which term is picked, and the direction the "Type:" select reads it in, belong to the page that
// owns both panels; expansion is this widget's own business.
const OntologyHierarchyPanel = ({
  hierarchy,
  anchorTermId,
  scope,
  scopeOptions,
  onScopeChange,
  onSelectTerm,
  onSelectRoot,
}) => {
  const rootIds = useMemo(() => hierarchy.map((node) => node.id), [hierarchy]);
  const [expandedItems, setExpandedItems] = useState(rootIds);

  // Both buttons put the scope back on the root class; they differ in what they do to the tree.
  // Reset closes it back to the opening view, while focus only makes sure the root is open.
  const handleReset = useCallback(() => {
    setExpandedItems(rootIds);
    onSelectRoot();
  }, [rootIds, onSelectRoot]);

  const handleFocusRoot = useCallback(() => {
    setExpandedItems((prev) => [...new Set([...prev, ...rootIds])]);
    onSelectRoot();
  }, [rootIds, onSelectRoot]);

  return (
    <Stack sx={{ height: 1, minHeight: 0 }} gap={2}>
      <Typography variant="sectionTitle">Ontology hierarchy</Typography>

      <Stack direction="row" alignItems="center" gap={1.5}>
        <Typography variant="body2" color="text.secondary">
          Type:
        </Typography>
        <CustomSingleSelect value={scope} onChange={onScopeChange} options={scopeOptions} />
        <Box sx={{ flex: 1 }} />
        <Divider orientation="vertical" flexItem />
        <Button
          variant="outlined"
          onClick={handleReset}
          aria-label="Reset the hierarchy"
          title="Reset the hierarchy"
          sx={{ p: "0.625rem 0.5625rem", minWidth: "0.0625rem" }}
        >
          <RestartAlt />
        </Button>
        <Button
          variant="outlined"
          onClick={handleFocusRoot}
          aria-label="Select the root class"
          title="Select the root class"
          sx={{ p: "0.625rem 0.5625rem", minWidth: "0.0625rem" }}
        >
          <TargetCross />
        </Button>
      </Stack>

      {/* The sidebar scrolls independently of the table beside it (design decision). */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", pl: 1.5 }}>
        <OntologyHierarchyTree
          items={hierarchy}
          expandedItems={expandedItems}
          onExpandedItemsChange={(_e, ids) => setExpandedItems(ids)}
          anchorTermId={anchorTermId}
          onSelectTerm={onSelectTerm}
        />
      </Box>
    </Stack>
  );
};

OntologyHierarchyPanel.propTypes = {
  hierarchy: PropTypes.array.isRequired,
  // The class the table is scoped to; highlighted at every position it occupies.
  anchorTermId: PropTypes.string.isRequired,
  scope: PropTypes.string.isRequired,
  scopeOptions: PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.string, label: PropTypes.string })
  ).isRequired,
  onScopeChange: PropTypes.func.isRequired,
  onSelectTerm: PropTypes.func.isRequired,
  onSelectRoot: PropTypes.func.isRequired,
};

export default OntologyHierarchyPanel;
