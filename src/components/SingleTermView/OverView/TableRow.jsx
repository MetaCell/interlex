import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import MergeStatusContainer from "../MergeStatusContainer";

const TableRow = ({ tableStyles, data, comparingData, onDragStart, onDragEnter, onDragEnd, index, statusType }) => {
  const { id, subject, predicate, object } = data;
  const [isHovered, setIsHovered] = useState(false);

  const renderContent = (content, compareContent) => {
    const shouldWrapInMergeStatus = (comparingData || statusType) && compareContent !== content;

    const contentElement = <Typography>{content}</Typography>;

    return shouldWrapInMergeStatus ? (
      <MergeStatusContainer status={statusType}>
        {contentElement}
      </MergeStatusContainer>
    ) : contentElement;
  };

  return (
    <Box sx={tableStyles.root}
      draggable={true}
      onDragStart={e => onDragStart(id, index, e)}
      onDragEnter={e => onDragEnter(id, index, e)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box sx={{ paddingLeft: "0 !important" }}>
        {renderContent(subject, comparingData?.subject)}
      </Box>
      <Box>
        {renderContent(predicate, comparingData?.predicate)}
      </Box>
      <Box display="flex" justifyContent="flex-end" sx={{ paddingRight: "0 !important" }}>
        {
          isHovered && (
            <Tooltip placement='right' title={"Help"}>
              <IconButton>
                <HelpOutlineOutlinedIcon fontSize='small' />
              </IconButton>
            </Tooltip>
          )
        }
      </Box>
    </Box>);
};

export default TableRow;