import PropTypes from 'prop-types';
import LinkIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Box, IconButton, Tooltip, Button } from '@mui/material';

import { vars } from "../../theme/variables";
import { iriLink } from "../CellCards/config/gridConfig";
import { useTermLinkContext } from "../../hooks/useContextOntology";
const { brand700 } = vars

// Shows and copies the canonical IRI (the identifier people cite), but opens it in this app:
// uri.interlex.org may serve another InterLex implementation.
const CopyLinkComponent = ({ url }) => {
  const href = iriLink(url, useTermLinkContext());
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
        },
        padding: 0
      }}>
        {href ? <a href={href} target="_blank" rel="noopener noreferrer">{url}</a> : url}
      </Button>
      <Tooltip title="Copy to clipboard">
        <IconButton onClick={handleCopy} aria-label="copy" p={0}>
          <ContentCopyIcon fontSize='medium' sx={{
            color: brand700
          }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

CopyLinkComponent.propTypes = {
  url: PropTypes.string.isRequired
}

export default CopyLinkComponent;
