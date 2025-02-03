import React from "react"
import { Stack, Typography, Chip, Box } from "@mui/material"
import MergeStatusWrapper from "./MergeStatusWrapper"
import { compareArrays } from "../../../utils"
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined"
import { vars } from "../../../theme/variables"

const { gray800 } = vars

interface ChipChangesProps {
  data: string[]
  compareData: string[]
  status: string
  type: "existingID" | "synonym"
}

const ChipChanges: React.FC<ChipChangesProps> = ({ data, compareData, status, type }) => {
  const differences = compareArrays(data, compareData)
  
  const title = type === "existingID" ? "Existing IDs" : "Synonyms"
  
  return (
    <Stack spacing=".75rem">
      <Typography color={gray800} fontWeight={500}>
        {title}
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={type === "existingID" ? 0.5 : 1}>
        {data.map((item: string, index: number) => {
          const isDifferent = differences.includes(item)
          const chipContent = (
            <Chip
              key={index}
              variant="outlined"
              className={`rounded ${type === "existingID" ? "IDchip-outlined" : "synonyms"}`}
              label={
                type === "existingID" ? (item) : (<span>{item} <span>{item}</span></span>)
              }
              icon={type === "existingID" ? <OpenInNewOutlinedIcon /> : undefined}
            />
          )
          return isDifferent ? (
            <MergeStatusWrapper key={index} status={status}>
                {chipContent}
            </MergeStatusWrapper>
          ) : ( chipContent )
        })}
      </Box>
    </Stack>
  )
}

export default ChipChanges;

