import ListItem from "./ListItem";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Box, List } from "@mui/material";

import { vars } from "../../../theme/variables";
const { gray50 } = vars;

const ListTerms = ({ entries, viewerGroup }) => {
  const navigate = useNavigate();

  // The record's own url doubles as the in-app route (/<group>/pulls/<id>), which renders the
  // delta rather than the raw JSON the backend serves at that address.
  const onRequestClick = (e, entry) => {
    if (entry?.path) navigate(entry.path);
  };
  // Full width: the rows line up with the pagination below them, whose "Previous"/"Next"
  // sit 1.5rem inside the section on either side (1rem root + 0.5rem item padding).
  return (
    <List disablePadding sx={{ width: 1 }}>
      {entries.map((entry, index) => (
        <Box
          key={entry.id || index}
          sx={{
            paddingLeft: "1rem",
            borderRadius: "0.375rem",
            "&:hover": {
              backgroundColor: gray50,
              "& .MuiIconButton-root": {
                display: "flex",
              },
            },
          }}
        >
          <ListItem entry={entry} onRequestClick={onRequestClick} viewerGroup={viewerGroup} />
        </Box>
      ))}
    </List>
  );
};

ListTerms.propTypes = {
  entries: PropTypes.array,
  viewerGroup: PropTypes.string,
};

export default ListTerms;
