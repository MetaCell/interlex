import React from "react";
import { Stack, Typography } from "@mui/material";
import MergeStatusWrapper from "./MergeStatusWrapper";
import { compareSentences } from "../../../utils";
import { vars } from "../../../theme/variables";

const { gray500, gray800 } = vars;


const TextChanges = ({ title, data, compareData, status }) => {
  const differences = compareSentences(data, compareData)
  
  return (<Stack spacing=".75rem">
    <Typography color={gray800} fontWeight={500}>
      {title}
    </Typography>
    <Typography fontSize=".875rem" color={gray500}>
      {data.split(new RegExp(`(${differences.join('|')})`, 'g')).map((part, index) => {
        if (differences.includes(part)) {
          return (<MergeStatusWrapper key={`${part}-${index}`} status={status}>{part}</MergeStatusWrapper>);
        }
        return part;
      })}
    </Typography>
  </Stack>)
}
export default TextChanges;