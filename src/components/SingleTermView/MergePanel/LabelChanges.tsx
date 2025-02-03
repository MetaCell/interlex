import React from "react";
import { Stack, Typography } from "@mui/material";
import MergeStatusWrapper from "./MergeStatusWrapper";
import { compareStrings } from "../../../utils";
import { vars } from "../../../theme/variables";

const { gray500, gray800 } = vars;


const LabelChanges = ({ title, data, compareData, status }) => {
  const differences = compareStrings(data, compareData)

  return (<Stack spacing=".75rem">
    <Typography color={gray800} fontWeight={500}>
      {title}
    </Typography>
    {differences.length > 0 ? (
      <MergeStatusWrapper status={status}>
        <Typography fontSize=".875rem" color={gray500}>
          {data}
        </Typography>
      </MergeStatusWrapper>
      ) : (
      <Typography fontSize=".875rem" color={gray500}>
        {data}
      </Typography>
    )}
    </Stack>)
}
export default LabelChanges;