import {Box, IconButton, Tooltip, Button} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LinkIcon from '@mui/icons-material/Link';
import {vars} from "../../theme/variables";

const {brand700} = vars
const CopyLinkComponent = ({ url }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(url)
  };
  
  return (
    <Box display="flex" alignItems="center">
        <Button startIcon={<LinkIcon />} type='text' color='secondary' sx={{
          '& a': {
            color: 'inherit',
          },
          '&:hover': {
            background: 'transparent',
          }
        }}>
          <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
          <Tooltip title="Copy to clipboard">
          <IconButton onClick={handleCopy} aria-label="copy" p={0}>
            <ContentCopyIcon fontSize='medium' sx={{
              color: brand700
            }} />
          </IconButton>
        </Tooltip>
        </Button>
    </Box>
  );
};

export default CopyLinkComponent;