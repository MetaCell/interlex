import { Box, Grid, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import DiscussionList from "./List";
import TimeLine from "./TimeLine";
import { vars } from "../../../theme/variables";
import { useState, useRef, useEffect } from "react";
import CommentEditor from "./CommentEditor";
import { getTermDiscussions } from "../../../api/endpoints/apiService";

const { gray25, gray200, gray700 } = vars;

const Discussion = (term) => {
  const [comments, setComments] = useState([]);
  const commentsEndRef = useRef(null);
  const [discussions, setDiscussions] = useState([]);
  const [showMockWarning, setShowMockWarning] = useState(true);

  const getDiscussions = async () =>  {
    const data = await getTermDiscussions("base", term)
    setDiscussions(data)
  }
  
  useEffect(() => {
    getDiscussions()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const addComment = (comment) => {
    setComments([...comments, comment]);
  };
  
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);
  
  return (
    <Box overflow="hidden">
      <Dialog open={showMockWarning} onClose={() => setShowMockWarning(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ConstructionOutlinedIcon color="warning" />
          Work in progress
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            This Discussion view is a mock frontend implementation. It currently displays
            placeholder data, is still in progress and needs to be completed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setShowMockWarning(false)}>Got it</Button>
        </DialogActions>
      </Dialog>
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
              {discussions.map((comment, index) => (
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
