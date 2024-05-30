import { styled } from '@mui/material/styles';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import {vars} from "../../theme/variables";
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import {Box, Chip} from "@mui/material";
import React from "react";

const {gray500, brand200, brand50} = vars

const ITEMS = [
  {
    id: '1',
    label: 'Central nervous system',
    children: [
      { id: '2', label: 'Hello' },
      {
        id: '3',
        label: 'Subtree with children',
        children: [
          { id: '6', label: 'Hello' },
          {
            id: '7',
            label: 'Sub-subtree with children',
            children: [
              { id: '9', label: 'Child 1' },
              { id: '10', label: 'Child 2' },
              { id: '11', label: 'Child 3' },
            ],
          },
          { id: '8', label: 'Hello' },
        ],
      },
      { id: '4', label: 'World' },
      { id: '5', label: 'Something something' },
    ],
  },
  {
    id: '12',
    label: 'Main',
    children: [
      { id: '22', label: 'Hello' },
      {
        id: '32',
        label: 'Subtree with children',
        children: [
          { id: '62', label: 'Hello' },
          {
            id: '72',
            label: 'Sub-subtree with children',
            children: [
              { id: '92', label: 'Child 1' },
              { id: '102', label: 'Child 2' },
              { id: '112', label: 'Child 3' },
            ],
          },
          { id: '82', label: 'Hello' },
        ],
      },
      { id: '42', label: 'World' },
      { id: '52', label: 'Something something' },
    ],
  },
];

const StyledTreeItem = styled((props) =>  (
  <TreeItem
    {...props}
    label={<Box display='flex' alignItems='center' gap='.5rem'>
      <span>{props.label}</span>
      {
        props.itemId === '1' &&  <Chip
          className="rounded"
          variant="outlined"
          label={'Current Item'}
          sx={{
            borderColor: brand200,
            backgroundColor: brand50
          }}
          
        />
      }
    </Box>}
  />
))(() => ({
  color: gray500,

  [`& .${treeItemClasses.content}`]: {
    [`& .${treeItemClasses.label}`]: {
      fontSize: '0.875rem',
      fontWeight: 400,
    },
  },
  [`& .${treeItemClasses.groupTransition}`]: {
    marginLeft: 14,
  },
}));

const CustomizedTreeView = () => {
  return (
    <RichTreeView
      aria-label="customized"
      defaultExpandedItems={['1']}
      items={ITEMS}
      slots={{
        item: StyledTreeItem,
        expandIcon: ChevronRightOutlinedIcon,
        collapseIcon: ExpandLessOutlinedIcon
      }}
    />
  );
}

export default CustomizedTreeView