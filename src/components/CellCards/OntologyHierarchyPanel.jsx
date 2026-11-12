import PropTypes from "prop-types";
import { useCallback, useMemo, useState } from "react";
import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import CustomSingleSelect from "../common/CustomSingleSelect";
import OntologyHierarchyTree from "./OntologyHierarchyTree";
import { RestartAlt, TargetCross } from "../../Icons";

// Layout only: lets a select shrink inside its row and ellipsise, instead of widening the panel
// by the length of its longest option.
const shrinkingSelect = { flex: 1, minWidth: 0 };
const iconButton = { p: "0.625rem 0.5625rem", minWidth: "0.0625rem" };

// The "Ontology hierarchy" widget: one hierarchy of the ontology at a time — the relation the
// "Hierarchy:" select names, over the terms of the rdf:type the "Type:" select names — drawn as a
// forest with nothing selected. Its top-level terms are the ones with no parent among those shown;
// their parents may well exist, in another ontology.
//
// The tree always shows the whole hierarchy — clicking a term picks what the Terms table beside it
// lists, so re-scoping the tree to the choice would take away the rows the user browses *with*.
// Which term is picked, and both filters, belong to the page that owns both panels; expansion is
// this widget's own business.
const OntologyHierarchyPanel = ({
  hierarchy,
  anchorTermId,
  type,
  typeOptions,
  onTypeChange,
  relation,
  relationOptions,
  onRelationChange,
  onSelectTerm,
  onClearSelection,
}) => {
  // A lone top-level term is opened, so the first view lists what is under it.
  const rootIds = useMemo(
    () => (hierarchy.length === 1 ? [hierarchy[0].id] : []),
    [hierarchy]
  );
  const [expandedItems, setExpandedItems] = useState(rootIds);

  // Both buttons put the table back on the whole list; they differ in what they do to the tree.
  // Reset closes it back to the opening view, while focus only makes sure a lone root is open.
  const handleReset = useCallback(() => {
    setExpandedItems(rootIds);
    onClearSelection();
  }, [rootIds, onClearSelection]);

  const handleFocusRoot = useCallback(() => {
    setExpandedItems((prev) => [...new Set([...prev, ...rootIds])]);
    onClearSelection();
  }, [rootIds, onClearSelection]);

  return (
    <Stack sx={{ height: 1, minHeight: 0 }} gap={2}>
      <Typography variant="sectionTitle">Ontology hierarchy</Typography>

      <Stack direction="row" alignItems="center" gap={1.5}>
        <Typography variant="body2" color="text.secondary">
          Type:
        </Typography>
        <CustomSingleSelect
          value={type}
          onChange={onTypeChange}
          options={typeOptions}
          FormControlSX={shrinkingSelect}
        />
        <Divider orientation="vertical" flexItem />
        <Button
          variant="outlined"
          onClick={handleReset}
          aria-label="Reset the hierarchy"
          title="Reset the hierarchy"
          sx={iconButton}
        >
          <RestartAlt />
        </Button>
        <Button
          variant="outlined"
          onClick={handleFocusRoot}
          aria-label="Select the whole ontology"
          title="Select the whole ontology"
          sx={iconButton}
        >
          <TargetCross />
        </Button>
      </Stack>

      {relation && (
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Typography variant="body2" color="text.secondary">
            Hierarchy:
          </Typography>
          <CustomSingleSelect
            value={relation}
            onChange={onRelationChange}
            options={relationOptions}
            FormControlSX={shrinkingSelect}
          />
        </Stack>
      )}

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

const selectOptions = PropTypes.arrayOf(
  PropTypes.shape({ value: PropTypes.string, label: PropTypes.string })
);

OntologyHierarchyPanel.propTypes = {
  hierarchy: PropTypes.array.isRequired,
  // The term the table is scoped to; highlighted at every position it occupies. Absent while the
  // table lists every term.
  anchorTermId: PropTypes.string,
  // The rdf:type the whole view is narrowed to.
  type: PropTypes.string.isRequired,
  typeOptions: selectOptions.isRequired,
  onTypeChange: PropTypes.func.isRequired,
  // The relation the tree is drawn over. Absent for an ontology with no terms to place.
  relation: PropTypes.string,
  relationOptions: selectOptions.isRequired,
  onRelationChange: PropTypes.func.isRequired,
  onSelectTerm: PropTypes.func.isRequired,
  onClearSelection: PropTypes.func.isRequired,
};

export default OntologyHierarchyPanel;
