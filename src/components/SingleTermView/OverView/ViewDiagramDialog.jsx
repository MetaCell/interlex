import * as React from "react";
import {useState} from "react";
import PropTypes from 'prop-types'
import Button from "@mui/material/Button";
import {Box, Divider} from "@mui/material";
import Graph from "../../GraphViewer/Graph";
import Typography from "@mui/material/Typography";
import AddPredicateDialog from "./AddPredicateDialog";
import CustomizedDialog from "../../common/CustomizedDialog";
import CustomSingleSelect from "../../common/CustomSingleSelect";
import PlaylistAddOutlinedIcon from "@mui/icons-material/PlaylistAddOutlined";

import {vars} from "../../../theme/variables";
const {gray600, gray700} = vars

const HeaderRightSideContent = ({ handleOpenAddPredicate, selectedItem, predicates }) => {
  // predicates is an array of groups: [{ title, count, rows }, ...]
  const options = React.useMemo(
    () => (predicates || []).map(p => ({ label: p.title, value: p.title })),
    [predicates]
  );
  const countByTitle = React.useMemo(() => {
    const m = new Map();
    (predicates || []).forEach(p => m.set(p.title, p.count ?? 0));
    return m;
  }, [predicates]);

  const [type, setType] = React.useState(selectedItem?.title || '');
  const [count, setCount] = React.useState(
    selectedItem?.title ? (countByTitle.get(selectedItem.title) ?? selectedItem?.count ?? 0) : 0
  );

  // keep in sync when selection/predicates change
  React.useEffect(() => {
    const t = selectedItem?.title || '';
    setType(t);
    setCount(countByTitle.get(t) ?? selectedItem?.count ?? 0);
  }, [selectedItem, countByTitle]);

  const handleChangeType = (value) => {
    setType(value);
    setCount(countByTitle.get(value) ?? 0);
  };

  return (
    <Box display="flex" alignItems="center">
      <Typography variant="caption" sx={{ fontSize: '0.875rem', color: gray600, mr: '.5rem' }}>
        Number of this type: {count}
      </Typography>
      <Typography variant="caption" sx={{ fontSize: '0.875rem', color: gray600, mr: '.5rem' }}>
        Predicate type:
      </Typography>
      <CustomSingleSelect
        value={type}
        onChange={handleChangeType}
        options={options}
        FormControlSX={{ width: '15rem' }}
      />
      <Divider orientation="vertical" flexItem sx={{ height: '1.5rem', m: '0 1rem' }} />
      <Button
        onClick={handleOpenAddPredicate}
        startIcon={<PlaylistAddOutlinedIcon />}
        variant="contained"
        color="secondary"
        size="small"
        sx={{ fontSize: '.875rem', color: gray700 }}
      >
        Add predicate
      </Button>
    </Box>
  );
};
const ViewDiagramDialog = ({ open, handleClose, image, selectedItem, predicates }) => {
  const [openAddPredicate, setOpenAddPredicate] = useState(false);

  const handleCloseAddPredicate = () => setOpenAddPredicate(false);
  const handleOpenAddPredicate = () => setOpenAddPredicate(true);

  // simple label/value list only for the add dialog
  const predicatesOptions = (predicates || []).map(row => ({
    label: row.title,
    value: row.title
  }));

  return (
    <>
      <CustomizedDialog
        title="View predicate"
        open={open}
        handleClose={handleClose}
        HeaderRightSideContent={
          <HeaderRightSideContent
            selectedItem={selectedItem}
            handleOpenAddPredicate={handleOpenAddPredicate}
            predicates={predicates}   // pass full groups so counts stay accurate
          />
        }
      >
        <Graph width={1200} height={600} predicate={selectedItem} />
      </CustomizedDialog>

      {openAddPredicate && (
        <AddPredicateDialog
          open={openAddPredicate}
          handleClose={handleCloseAddPredicate}
          image={image}
          predicates={predicatesOptions}
        />
      )}
    </>
  );
};

HeaderRightSideContent.propTypes = {
  handleOpenAddPredicate: PropTypes.func,
  selectedItem: PropTypes.object,
  predicates: PropTypes.array
}

ViewDiagramDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  image: PropTypes.string,
  selectedItem: PropTypes.object,
  predicates: PropTypes.array
}

export default ViewDiagramDialog
