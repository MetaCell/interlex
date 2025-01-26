import React from "react"
import { Box, Chip, Stack, Typography } from "@mui/material";
import MergeStatusWrapper from "./MergeStatusWrapper";
import { getDataType } from "../../../utils.js";
import { compareData } from "../../../utils.js";
import { vars } from "../../../theme/variables";

const { gray800, gray500 } = vars

interface MergePanelSectionProps {
  title: string
  data: any
  comparingData: any
  statusType: string
  content?: any
}

const MergePanelSection: React.FC<MergePanelSectionProps> = ({ title, data, comparingData, statusType, content }) => {
  const dataType = getDataType(data)
  const differences = compareData(data, comparingData)

  const renderContent = () => {
    switch (dataType) {
      case "array":
        return (
          <Box display="flex" flexWrap="wrap" gap=".5rem">
            {data.map((item: string, index: number) => {
              const isDifferent = differences.includes(item)
              const chipContent = (
                <Chip
                  key={index}
                  variant="outlined"
                  className="rounded synonyms"
                  label={
                    <span>
                      {item} <span>{item}</span>
                    </span>
                  }
                />
              )

              return isDifferent ? (
                <MergeStatusWrapper key={index} status={statusType}>
                  {chipContent}
                </MergeStatusWrapper>
              ) : (
                chipContent
              )
            })}
          </Box>
        )
      case "string":
        return differences.length > 0 ? (
          <MergeStatusWrapper status={statusType}>
            <Typography fontSize=".875rem" color={gray500}>
              {data}
            </Typography>
          </MergeStatusWrapper>
        ) : (
          <Typography fontSize=".875rem" color={gray500}>
            {data}
          </Typography>
        )
      case "object":
        return (
          <Box>
            {Object.entries(data).map(([key, value]) => {
              const isDifferent = differences.includes(key)
              const content = (
                <Typography key={key} fontSize=".875rem" color={gray500}>
                  {key}: {String(value)}
                </Typography>
              )

              return isDifferent ? (
                <MergeStatusWrapper key={key} status={statusType}>
                  {content}
                </MergeStatusWrapper>
              ) : (
                content
              )
            })}
          </Box>
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
    <Stack spacing=".75rem">
      <Typography color={gray800} fontWeight={500}>
        {title}
      </Typography>
      {renderContent()}
    </Stack>
  )
}

export default MergePanelSection;

