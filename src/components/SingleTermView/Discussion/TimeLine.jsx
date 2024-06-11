import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import { timelineItemClasses } from "@mui/lab";
import { Box, Typography } from "@mui/material";
import { vars } from "../../../theme/variables";

const { gray100, gray600, gray700, gray200, gray50 } = vars;

const TimeLine = ({ comment, hideConnector }) => {
  return (
    <Timeline sx={{
      padding: 0,
      [`& .${timelineItemClasses.root}:before`]: {
        flex: 0,
        padding: 0,
      },
      '& .MuiTimelineDot-root': {
        margin: 0,
        padding: 0,
        width: '2rem',
        height: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'none',
        backgroundColor: gray100,
        border: '.5px solid rgba(0,0,0,0.08)',
        color: gray600,
        fontSize: '0.75rem',
        fontWeight: 600,
      },
      '& .MuiTimelineConnector-root': {
        width: '0.125rem',
        borderRadius: '0.125rem',
        backgroundColor: gray200,
        margin: '.75rem 0'
      },
      '& .MuiTimelineContent-root': {
        display: 'flex',
        flexDirection: 'column',
        gap: '.375rem'
      },
      '& .thread-header': {
        color: gray700,
        fontSize: '0.875rem',
        fontWeight: 500
      },
      '& .message-container': {
        padding: '.625rem .75rem',
        borderRadius: '0rem .5rem .5rem .5rem',
        border: `1px solid ${gray200}`,
        boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)'
      },
      '& .comment': {
        backgroundColor: gray50
      },
      '& .message': {
        backgroundColor: 'white'
      }
    }}>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot>OR</TimelineDot>
          {!hideConnector && <TimelineConnector/>}
        </TimelineSeparator>
        <TimelineContent component='div'>
          <Typography className='thread-header'>Olivia Rhye replied to Phoenix Baker</Typography>
          <Box className='message-container comment'>
            <Typography className='thread-header' dangerouslySetInnerHTML={{ __html: comment }} />
          </Box>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  );
};

export default TimeLine;
