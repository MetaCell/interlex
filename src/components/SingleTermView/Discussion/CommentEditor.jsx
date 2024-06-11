import { useState } from 'react';
import { Button, Box } from '@mui/material';
import RichTextEditor from 'react-rte';
import {SendComment} from "../../../Icons";

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
          display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS'],
          INLINE_STYLE_BUTTONS: [
            { label: 'Bold', style: 'BOLD', className: 'custom-css-class' },
            { label: 'Italic', style: 'ITALIC' },
            { label: 'Underline', style: 'UNDERLINE' }
          ],
          BLOCK_TYPE_BUTTONS: [
            { label: 'UL', style: 'unordered-list-item' },
            { label: 'OL', style: 'ordered-list-item' }
          ]
        }}
        
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

export default CommentEditor;
