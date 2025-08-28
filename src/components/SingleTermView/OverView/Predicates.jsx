import React from "react";
import PropTypes from "prop-types";
import ExpandIcon from "@mui/icons-material/Expand";
import RemoveIcon from "@mui/icons-material/Remove";
import PredicatesAccordion from "./PredicatesAccordion";
import CircularProgress from '@mui/material/CircularProgress';
import { Box, Typography, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { vars } from "../../../theme/variables";

const { gray800 } = vars;

const Predicates = ({ data, isGraphVisible, loading }) => {
  const [toggleButtonValue, setToggleButtonValue] = React.useState("expand");

  const predicates = React.useMemo(() => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data)) return data;
    return [];
  }, [data]);

  const onToggleButtonChange = (_e, v) => v && setToggleButtonValue(v);

  if (loading) {
    return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  }

  return (
    <Box display="flex" flexDirection="column" gap=".75rem">
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography color={gray800} fontWeight={500}>Predicates</Typography>
        <Box display="flex" alignItems="center" gap=".75rem">
          <ToggleButtonGroup
            value={toggleButtonValue}
            exclusive
            onChange={onToggleButtonChange}
            sx={{ gap: ".75rem", "& .MuiButtonBase-root": { borderRadius: ".5rem !important" } }}
          >
            <ToggleButton value="expand"><ExpandIcon /></ToggleButton>
            <ToggleButton value="compress"><RemoveIcon /></ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
      <PredicatesAccordion
        data={predicates}
        expandAllPredicates={toggleButtonValue === "expand"}
        isGraphVisible={isGraphVisible}
      />
    </Box>
  );
};

Predicates.propTypes = {
  data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  isGraphVisible: PropTypes.bool,
  loading: PropTypes.bool
};

export default Predicates;
