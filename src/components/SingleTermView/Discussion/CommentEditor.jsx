import { useState } from 'react';
import PropTypes from 'prop-types';
import RichTextEditor from 'react-rte';
import {SendComment} from "../../../Icons";
import { Button, Box } from '@mui/material';

const CommentEditor = ({ onAddComment }) => {
  const [editorState, setEditorState] = useState(RichTextEditor.createEmptyValue());

  const handleEditorChange = (value) => {
    setEditorState(value);
  };

  const handleAddComment = () => {
    const htmlContent = editorState.toString('html');
    onAddComment(htmlContent);
    setEditorState(RichTextEditor.createEmptyValue());
  };

  return (
    <Box position='relative'>
      <RichTextEditor
        value={editorState}
        onChange={handleEditorChange}
        toolbarConfig={{
          display: []
        }}
        toolbarClassName="custom-toolbar"
      />
      <Button
        onClick={handleAddComment}
        variant="outlined"
        color="primary"
        endIcon={<SendComment />}
        disableRipple
        disableFocusRipple
        disableElevation
        disableTouchRipple
        sx={{
          marginTop: '10px',
          position: 'absolute',
          right: '.75rem',
          bottom: '.75rem',
        }}
      >
        Send Comment
      </Button>
    </Box>
  );
};

CommentEditor.propTypes = {
  onAddComment: PropTypes.func.isRequired,
};

export default CommentEditor;
