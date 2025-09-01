// SingleTermView/OverView/Hierarchy.jsx
import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Divider,
  Stack,
  Typography,
  CircularProgress
} from "@mui/material";
import { vars } from "../../../theme/variables";
import { RestartAlt, TargetCross } from "../../../Icons";
import SingleSearch from "../SingleSearch";
import CustomizedTreeView from "../../common/CustomizedTreeView";
import CustomSingleSelect from "../../common/CustomSingleSelect";

const { gray600, gray800 } = vars;
const CHILDREN = 'children';
const SUPERCLASSES = 'superclasses';

// Find first tree item whose .iri matches focusIri
const findFirstRenderedId = (items = [], focusIri) => {
  const stack = [...items];
  while (stack.length) {
    const node = stack.shift();
    if (node?.iri === focusIri) return node.id;
    if (Array.isArray(node?.children)) stack.push(...node.children);
  }
  return null;
};

// Normalize "ILX:0100573" -> "http://uri.interlex.org/base/ilx_0100573"
const toIri = (idLike) => {
  if (!idLike) return "";
  if (/^https?:\/\//i.test(idLike)) return idLike;
  const m = String(idLike).match(/^ILX:(\d+)$/i);
  if (m) return `http://uri.interlex.org/base/ilx_${m[1]}`;
  return idLike;
};

const Hierarchy = ({
  options = { children: [], superclasses: [] }, // {children:[{id,label}], superclasses:[...]}
  selectedValue,                                 // { id, label }
  onSelect,
  // prebuilt trees (arrays of {id,label,iri,children})
  treeChildren = [],
  treeSuperclasses = [],
  loading = false,
}) => {
  const [type, setType] = React.useState(SUPERCLASSES); // default to superclasses
  const [currentId, setCurrentId] = React.useState(null);

  // when selection or type changes, recompute which tree + currentId to show
  React.useEffect(() => {
    const focusIri = toIri(selectedValue?.id);
    const items = type === CHILDREN ? treeChildren : treeSuperclasses;
    setCurrentId(findFirstRenderedId(items, focusIri));
  }, [selectedValue, type, treeChildren, treeSuperclasses]);

  const items = type === CHILDREN ? treeChildren : treeSuperclasses;
  const childCount = items?.[0]?.children?.length || 0;

  const handleSelectChange = (_event, value) => onSelect?.(value);
  const gotoFirstOption = () => {
    const opts = type === CHILDREN ? options.children : options.superclasses;
    if (opts?.length) onSelect?.(opts[0]);
  };

  const singleSearchOptions = type === CHILDREN ? options.children : options.superclasses;

  if (loading) {
    return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  }

  return (
    <Box display='flex' flexDirection='column' gap='1rem'>
      <Box display='flex' alignItems='center' justifyContent='space-between'>
        <Typography color={gray800} fontWeight={500}>Hierarchy</Typography>
        <Stack direction="row" alignItems="center" spacing={'.75rem'}>
          <Typography variant="caption" sx={{ fontSize: '0.875rem', color: gray600 }}>Type:</Typography>
          <CustomSingleSelect
            value={type}
            onChange={(v) => setType(v)}
            options={[
              { value: CHILDREN, label: 'Children' },
              { value: SUPERCLASSES, label: 'Superclasses' },
            ]}
          />
          <Divider orientation="vertical" flexItem />
          <Button sx={{ p: '0.625rem 0.5625rem', minWidth: '0.0625rem' }} variant='outlined' onClick={gotoFirstOption}>
            <RestartAlt />
          </Button>
          <Button sx={{ p: '0.625rem 0.5625rem', minWidth: '0.0625rem' }} variant='outlined' title="Focus (no-op placeholder)">
            <TargetCross />
          </Button>
        </Stack>
      </Box>

      <SingleSearch
        onChange={handleSelectChange}
        selectedValue={selectedValue}
        options={singleSearchOptions}
      />

      <CustomizedTreeView
        items={items}
        loading={false}
        currentId={currentId}
        defaultExpanded={type === CHILDREN ? false : true}
      />

      <Typography color={gray600} fontSize='.875rem'>
        Total number of first generation {type === CHILDREN ? CHILDREN : SUPERCLASSES}: {childCount}
      </Typography>
    </Box>
  );
};

Hierarchy.propTypes = {
  options: PropTypes.shape({
    children: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, label: PropTypes.string })),
    superclasses: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, label: PropTypes.string })),
  }),
  selectedValue: PropTypes.shape({ id: PropTypes.string, label: PropTypes.string }),
  onSelect: PropTypes.func,
  treeChildren: PropTypes.array,      // array of TreeItem
  treeSuperclasses: PropTypes.array,  // array of TreeItem
  loading: PropTypes.bool,
};

export default Hierarchy;
