import React from "react"
import { Stack, Typography, Chip, Box } from "@mui/material"
import MergeStatusWrapper from "./MergeStatusWrapper"
import { compareArrays } from "../../../utils"
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined"
import { vars } from "../../../theme/variables"

const { gray800 } = vars

interface ChipChangesProps {
  data: string | string[]
  compareData?: string | string[]
  status: string
  type?: string
  title: string
}

// termParser collapses a single-valued predicate to a scalar, so the same field arrives as a
// string on one side and an array on the other; both sides are compared as lists.
const asList = (value?: string | string[]): string[] =>
  Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];

const ChipChanges: React.FC<ChipChangesProps> = ({ data, compareData = [], status, type="", title }) => {
  const items = asList(data);
  const differences = compareArrays(items, asList(compareData)) || [];
  return (
    <Stack spacing=".75rem">
      <Typography color={gray800} fontWeight={500}>
        {title}
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={type === "chip-link" ? 0.5 : 1}>
        {items.map((item: string, index: number) => {
          const isDifferent = differences.includes(item) || false
          const chipContent = (
            <Chip
              key={`${item}-${status}-${index}`}
              variant="outlined"
              className={`rounded ${type === "dual-text-chip" ? "dual-text-chip" : "IDchip-outlined"}`}
              // The mock rendered the value twice (the theme dims a second, secondary span);
              // a real synonym carries one value, so show it once.
              label={item}
              icon={type === "chip-link" ? <OpenInNewOutlinedIcon /> : undefined}
            />
          )
          return isDifferent ? (
            <MergeStatusWrapper key={`${item}-${status}-${index}`} status={status}>
                {chipContent}
            </MergeStatusWrapper>
          ) : ( chipContent )
        })}
      </Box>
    </Stack>
  )
}

export default ChipChanges;

