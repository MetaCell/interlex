import PropTypes from "prop-types";
import { useCallback, useMemo, useState } from "react";
import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import CustomSingleSelect from "../common/CustomSingleSelect";
import OntologyHierarchyTree from "./OntologyHierarchyTree";
import { RestartAlt, TargetCross } from "../../Icons";

// Local name of a curie or IRI: "ilxtr:NeuronPrecision" -> "NeuronPrecision".
const localName = (id) => String(id).split(/[:/#]/).filter(Boolean).pop() || id;

// The "Ontology hierarchy" widget: the subClassOf tree of the ontology, opened on its root
// class (the starting selection the design calls for). Per the MVP decision this widget does
// not drive the Terms table beside it — the two are independent views of the same ontology.
const OntologyHierarchyPanel = ({ hierarchy, rootClass }) => {
  const rootIds = useMemo(() => hierarchy.map((node) => node.id), [hierarchy]);
  const [expandedItems, setExpandedItems] = useState(rootIds);
  const [selectedItems, setSelectedItems] = useState([]);

  // Only one hierarchy exists for a neurdf ontology, but the label is built from the root
  // class rather than hardcoded — the same rule the rest of this view follows.
  const typeOptions = useMemo(
    () => [{ value: "subClassOf", label: `sub class of ${localName(rootClass)}` }],
    [rootClass]
  );

  const handleReset = useCallback(() => {
    setExpandedItems(rootIds);
    setSelectedItems([]);
  }, [rootIds]);

  const handleFocusRoot = useCallback(() => {
    setExpandedItems((prev) => [...new Set([...prev, ...rootIds])]);
    setSelectedItems(rootIds);
  }, [rootIds]);

  return (
    <Stack sx={{ height: 1, minHeight: 0 }} gap={2}>
      <Typography variant="sectionTitle">Ontology hierarchy</Typography>

      <Stack direction="row" alignItems="center" gap={1.5}>
        <Typography variant="body2" color="text.secondary">
          Type:
        </Typography>
        <CustomSingleSelect value="subClassOf" onChange={() => {}} options={typeOptions} />
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
          aria-label="Highlight the root class"
          title="Highlight the root class"
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
          selectedItems={selectedItems}
        />
      </Box>
    </Stack>
  );
};

OntologyHierarchyPanel.propTypes = {
  hierarchy: PropTypes.array.isRequired,
  rootClass: PropTypes.string.isRequired,
};

export default OntologyHierarchyPanel;
