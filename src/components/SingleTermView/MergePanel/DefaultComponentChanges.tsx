import React from "react";
import { Stack, Typography, Box } from "@mui/material";
import MergeStatusWrapper from "./MergeStatusWrapper";
import ChipChanges from "./ChipChanges";
import LabelChanges from "./LabelChanges";
import TextChanges from "./TextChanges";
import { getDataType, compareObjects } from "../../../utils";
import { vars } from "../../../theme/variables";

const { gray500, gray800 } = vars;

const isSentence = (text: string) => {
  return /\s/.test(text.trim());
};

const DefaultComponentChanges = ({ title, data, compareData, status }) => {
  const dataType = getDataType(data)
  const differences = compareObjects(data, compareData)

  const renderContent = () => {
    switch (dataType) {
      case "array":
        return <ChipChanges data={data} compareData={compareData} status={status} title={title} />
      case "string":
        return isSentence(data) ? (
          <TextChanges title={title} data={data} compareData={compareData} status={status} />
        ) : (
          <LabelChanges title={title} data={data} compareData={compareData} status={status} />
        )
      case "number": 
        return <LabelChanges title={title} data={data} compareData={compareData} status={status} />
      case "object":
        return (
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              {title}
            </Typography>
            {Object.entries(data).map(([key, value]) => {
              const isDifferent = differences.includes(key)
              const content = (
                <Typography key={key} fontSize=".875rem" color={gray500}>
                  {String(value)}
                </Typography>
              )
              return isDifferent ? (
                <MergeStatusWrapper key={key} status={status}>
                  {content}
                </MergeStatusWrapper>
              ) : (
                content
              )
            })}
          </Stack>
        )
      default:
        return (
          <Typography fontSize=".875rem" color={gray500}>
            Unsupported data type
          </Typography>
        )
    }
  }
  return (
    <>{renderContent()}</>
  )
}
export default DefaultComponentChanges;