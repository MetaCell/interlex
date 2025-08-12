import React from "react";
import PropTypes from 'prop-types';
import ExpandIcon from '@mui/icons-material/Expand';
import RemoveIcon from '@mui/icons-material/Remove';
import PredicatesAccordion from "./PredicatesAccordion";
import { Box, Typography, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { vars } from "../../../theme/variables";

const { gray800 } = vars;

const FALLBACK_PREDICATE = "predicate";

function groupsFromTriples(triples) {
  const byPred = new Map();
  for (const t of triples || []) {
    const key = (t?.predicate?.label || t?.predicate?.id || "").trim() || FALLBACK_PREDICATE;
    if (!byPred.has(key)) byPred.set(key, []);
    byPred.get(key).push(t);
  }
  const groups = [];
  for (const [predLabel, items] of byPred.entries()) {
    const rows = items.map((t) => ({
      subject: t.subject?.label || t.subject?.id,
      subjectId: t.subject?.id,
      object: t.object?.label || t.object?.id,
      objectId: t.object?.id,
    }));
    const edges = items.map((t) => ({
      from: t.subject,
      to: t.object,
      predicate: t.predicate,
    }));
    groups.push({
      title: predLabel,
      count: items.length,
      rows,
      values: rows,
      edges,
      forceGraph: false,
    });
  }
  return groups;
}

const Predicates = ({ basePredicates = [], triplesChildren = [], triplesSuperclasses = [], isGraphVisible }) => {
  const [predicates, setPredicates] = React.useState([]);
  const [toggleButtonValue, setToggleButtonValue] = React.useState('expand');

  const onToggleButtonChange = (_event, newValue) => {
    if (newValue) setToggleButtonValue(newValue);
  };

  React.useEffect(() => {
    // Build groups from both directions and merge with existing basePredicates
    const groupsChildren = groupsFromTriples(triplesChildren);
    const groupsSupers   = groupsFromTriples(triplesSuperclasses);

    const all = [...(Array.isArray(basePredicates) ? basePredicates : [])];

    const pushOrMerge = (g) => {
      const idx = all.findIndex(p => p.title === g.title);
      if (idx === -1) {
        all.push(g);
      } else {
        const existing = all[idx];
        const combinedRows = [...(existing.rows || existing.values || []), ...(g.rows || g.values || [])];
        const combinedEdges = [...(existing.edges || []), ...(g.edges || [])];
        all[idx] = {
          ...existing,
          count: (existing.count || 0) + (g.count || 0),
          rows: combinedRows,
          values: combinedRows,
          edges: combinedEdges,
        };
      }
    };

    groupsChildren.forEach(pushOrMerge);
    groupsSupers.forEach(pushOrMerge);

    setPredicates(all);
  }, [basePredicates, triplesChildren, triplesSuperclasses]);

  return (
    <Box display='flex' flexDirection='column' gap='.75rem'>
      <Box display='flex' alignItems='center' justifyContent='space-between'>
        <Typography color={gray800} fontWeight={500}>Predicates</Typography>
        <Box display='flex' alignItems='center' gap='.75rem'>
          <ToggleButtonGroup
            value={toggleButtonValue}
            exclusive
            onChange={onToggleButtonChange}
            sx={{
              gap: '.75rem',
              '& .MuiButtonBase-root': {
                borderRadius: '.5rem !important'
              }
            }}
          >
            <ToggleButton value={'expand'}>
              <ExpandIcon />
            </ToggleButton>
            <ToggleButton value={'compress'}>
              <RemoveIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
      <PredicatesAccordion
        data={predicates}
        expandAllPredicates={toggleButtonValue === 'expand'}
        isGraphVisible={isGraphVisible}
      />
    </Box>
  );
};

Predicates.propTypes = {
  basePredicates: PropTypes.array,
  triplesChildren: PropTypes.array,
  triplesSuperclasses: PropTypes.array,
  isGraphVisible: PropTypes.bool
};

export default Predicates;
