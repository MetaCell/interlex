import { Box, Grid, Typography } from "@mui/material";
import DiscussionList from "./List";
import TimeLine from "./TimeLine";
import { vars } from "../../../theme/variables";
import { useState, useRef, useEffect } from "react";
import CommentEditor from "./CommentEditor";

const { gray25, gray200, gray700 } = vars;

const Discussion = () => {
  const [comments, setComments] = useState([]);
  const commentsEndRef = useRef(null);
  
  const addComment = (comment) => {
    setComments([...comments, comment]);
  };
  
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);
  
  return (
    <Box overflow="hidden">
      <Grid container height="100%">
        <Grid item xs={12} lg={4} height="100%">
          <DiscussionList />
        </Grid>
        <Grid item xs={12} lg={8} height="100%">
          <Box
            display="flex"
            flexDirection="column"
            padding="2rem 5rem"
            sx={{
              borderTop: `1px solid ${gray200}`,
              borderLeft: `1px solid ${gray200}`,
              background: gray25,
              height: "100%",
              overflow: "auto",
            }}
          >
            <Box
              sx={{
                overflow: "auto",
                flexGrow: 1,
              }}
            >
              {comments.map((comment, index) => (
                <TimeLine key={index} comment={comment} hideConnector={index === comments.length - 1} />
              ))}
              <div ref={commentsEndRef} />
            </Box>
            <Box mt="2rem">
              <Typography fontSize='1rem' color={gray700} fontWeight={500} mb='.75rem'>Add a comment</Typography>
              <CommentEditor onAddComment={addComment} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Discussion;
