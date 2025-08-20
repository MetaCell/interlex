import {
  Box,
  Button,
  Divider,
  Stack,
  Typography
} from "@mui/material";
import { vars } from "../../../theme/variables";
import React from "react";
import PropTypes from "prop-types";
import { RestartAlt, TargetCross } from "../../../Icons";
import SingleSearch from "../SingleSearch";
import CustomizedTreeView from "../../common/CustomizedTreeView";
import CustomSingleSelect from "../../common/CustomSingleSelect";

const { gray600, gray800 } = vars;

function mapsFromTriples(triples) {
  const idLabelMap = {};
  const parentToChildren = {};

  for (const t of triples || []) {
    const pred = (t.predicate?.label || t.predicate?.id || "").toLowerCase();

    if (pred.endsWith("label") || pred.includes("rdfs:label")) {
      if (t.subject?.id) idLabelMap[t.subject.id] = t.object?.label || t.object?.id || t.subject.id;
      continue;
    }

    if (pred.endsWith("ilx.partof:") || pred.includes("partof") || pred.includes("is part of")) {
      const child = t.subject?.id;
      const parent = t.object?.id;
      if (child && parent) {
        if (!parentToChildren[parent]) parentToChildren[parent] = [];
        if (!parentToChildren[parent].includes(child)) parentToChildren[parent].push(child);
      }
    }
  }

  return { idLabelMap, parentToChildren };
}

function buildTree(rootId, mapping, idLabelMap) {
  const visited = new Set();
  const build = (id) => {
    if (visited.has(id)) return { id, label: idLabelMap[id] || id, children: [], isCycle: true };
    visited.add(id);
    const kids = (mapping[id] || []).map(build);
    return { id, label: idLabelMap[id] || id, children: kids };
  };
  return [build(rootId)];
}

const Hierarchy = ({
  options = [],
  selectedValue,
  onSelect,
  triplesChildren = [],
  triplesSuperclasses = [],
}) => {
  const [type, setType] = React.useState("children");
  const [treeData, setTreeData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const triples = type === "children" ? triplesChildren : triplesSuperclasses;
    if (!selectedValue?.handler || !Array.isArray(triples)) {
      setTreeData([]);
      return;
    }
    setLoading(true);
    try {
      const { idLabelMap, parentToChildren } = mapsFromTriples(triples);
      let mapping = parentToChildren;
      if (type === "superclasses") {
        const childToParents = {};
        for (const [parent, kids] of Object.entries(parentToChildren)) {
          for (const kid of kids) {
            if (!childToParents[kid]) childToParents[kid] = [];
            if (!childToParents[kid].includes(parent)) childToParents[kid].push(parent);
          }
        }
        mapping = childToParents;
      }
      const tree = buildTree(selectedValue.handler, mapping, idLabelMap);
      setTreeData(tree);
    } catch (e) {
      console.error(e);
      setTreeData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedValue, type, triplesChildren, triplesSuperclasses]);

  const childCount = treeData?.[0]?.children?.length || 0;

  return (
    <Box display="flex" flexDirection="column" gap="1rem">
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography color={gray800} fontWeight={500}>Hierarchy</Typography>
        <Stack direction="row" alignItems="center" spacing={".75rem"}>
          <Typography variant="caption" sx={{ fontSize: "0.875rem", color: gray600 }}>
            Type:
          </Typography>
          <CustomSingleSelect
            value={type}
            onChange={(v) => setType(v)}
            options={[
              { value: "children", label: "Children" },
              { value: "superclasses", label: "Superclasses" },
            ]}
          />
          <Divider orientation="vertical" flexItem />
          <Button
            sx={{ p: "0.625rem 0.5625rem", minWidth: "0.0625rem" }}
            variant="outlined"
            onClick={() => options?.length && onSelect?.(options[0])}
          >
            <RestartAlt />
          </Button>
          <Button sx={{ p: "0.625rem 0.5625rem", minWidth: "0.0625rem" }} variant="outlined">
            <TargetCross />
          </Button>
        </Stack>
      </Box>

      <SingleSearch
        onChange={onSelect}
        selectedValue={selectedValue}
        options={options}
        placeholder="Search for a term"
      />
      <CustomizedTreeView
        items={treeData}
        loading={loading}
        currentId={selectedValue?.handler || null}
      />
      <Typography color={gray600} fontSize=".875rem">
        Total number of first generation {type === "children" ? "children" : "superclasses"}: {childCount}
      </Typography>
    </Box>
  );
};

Hierarchy.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      handler: PropTypes.string.isRequired,
    })
  ),
  selectedValue: PropTypes.shape({
    label: PropTypes.string,
    handler: PropTypes.string,
  }),
  onSelect: PropTypes.func,
  triplesChildren: PropTypes.array,
  triplesSuperclasses: PropTypes.array,
};

export default Hierarchy;
