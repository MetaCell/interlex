import PropTypes from 'prop-types';
import { Box, Chip, CircularProgress } from "@mui/material";
import { styled } from '@mui/material/styles';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import { vars } from "../../theme/variables";

const { gray500, brand200, brand50 } = vars;

const StyledTreeItemBase = (props) => (
  <TreeItem
    {...props}
    label={
      <Box display='flex' alignItems='center' gap='.5rem'>
        <span>{props.label}</span>
        {props.currentId && props.itemId === props.currentId && (
          <Chip
            className="rounded"
            variant="outlined"
            label={'Current Item'}
            sx={{ borderColor: brand200, backgroundColor: brand50 }}
          />
        )}
      </Box>
    }
  />
);

StyledTreeItemBase.propTypes = {
  label: PropTypes.node,
  currentId: PropTypes.string,
  itemId: PropTypes.string, // provided by MUI TreeItem
};

const StyledTreeItem = styled(StyledTreeItemBase)(() => ({
  color: gray500,
  [`& .${treeItemClasses.content}`]: {
    [`& .${treeItemClasses.label}`]: { fontSize: '0.875rem', fontWeight: 400 },
  },
  [`& .${treeItemClasses.groupTransition}`]: { marginLeft: 14 },
}));

const CustomizedTreeView = ({ items = [], loading = false, currentId = null }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={2}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <RichTreeView
      aria-label="customized"
      defaultExpandedItems={items.length ? [items[0].id] : []}
      items={items}
      slots={{
        item: StyledTreeItem,
        expandIcon: ChevronRightOutlinedIcon,
        collapseIcon: ExpandLessOutlinedIcon
      }}
      slotProps={{
        item: { currentId },
      }}
    />
  );
};

CustomizedTreeView.propTypes = {
  items: PropTypes.array,
  loading: PropTypes.bool,
  currentId: PropTypes.string,
};

export default CustomizedTreeView;
