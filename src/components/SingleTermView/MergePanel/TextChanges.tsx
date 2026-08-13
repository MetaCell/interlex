import React from "react";
import { Stack, Typography } from "@mui/material";
import MergeStatusWrapper from "./MergeStatusWrapper";
import { vars } from "../../../theme/variables";

const { gray500, gray800 } = vars;

// Sentences are spliced back into the text through a RegExp, so anything the backend put in
// them (parentheses, +, ?, …) has to be neutralised first.
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Sentence-ish chunks, including a trailing fragment with no terminal punctuation — an edit
// appended to the end of a definition is exactly that, and dropping it would leave the two
// sides looking sentence-identical and flag the whole paragraph instead.
const segments = (text: string): string[] => text.match(/[^.!?]+(?:[.!?]+|$)/g) || [];

const sameSegment = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

const TextChanges = ({ title, data, compareData = "", status }) => {
  const text = typeof data === "string" ? data : String(data ?? "");
  const other = typeof compareData === "string" ? compareData : String(compareData ?? "");
  // Flag only the chunks this side carries that the other one doesn't; if the text cannot be
  // segmented at all but the two still differ, fall back to flagging the whole value.
  const otherSegments = segments(other)
  const segmentDifferences = segments(text).filter(
    segment => !otherSegments.some(candidate => sameSegment(candidate, segment))
  )
  const differences = segmentDifferences.length > 0
    ? segmentDifferences
    : (text && text !== other && !segments(text).length ? [text] : [])

  // No differing sentence: render the text as-is rather than splitting on an empty pattern,
  // which would match at every character boundary.
  const parts = differences.length > 0
    ? text.split(new RegExp(`(${differences.map(escapeRegExp).join('|')})`, 'g'))
    : [text];

  return (<Stack spacing=".75rem">
    <Typography color={gray800} fontWeight={500}>
      {title}
    </Typography>
    <Typography fontSize=".875rem" color={gray500}>
      {parts.map((part, index) => {
        if (differences.includes(part)) {
          return (<MergeStatusWrapper key={`${part}-${index}`} status={status}>{part}</MergeStatusWrapper>);
        }
        return part;
      })}
    </Typography>
  </Stack>)
}
export default TextChanges;
