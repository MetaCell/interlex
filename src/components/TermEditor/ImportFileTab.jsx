import PropTypes from "prop-types";
import ImportFile from "./ImportFile";
import { CSVIcon, CodeIcon } from "../../Icons";
import CustomFormField from "../common/CustomFormField";
import { Box, Stack, Typography, FormControl, Divider, IconButton } from "@mui/material";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { vars } from "../../theme/variables";
const { gray300, gray800, gray600, gray700, gray200 } = vars;

const getFileIcon = (fileName) => {
    if (!fileName || typeof fileName !== 'string') {
        return <CSVIcon />; // fallback for undefined/null/non-string
    }
    
    const lowerFileName = fileName.toLowerCase();
    if (lowerFileName.endsWith('.csv')) {
        return <CSVIcon />;
    } else if (lowerFileName.endsWith('.json') || lowerFileName.endsWith('.jsonld')) {
        return <CodeIcon />;
    }
    return <CSVIcon />; // fallback
};

const formatFileSize = (sizeBytes) => {
    if (!sizeBytes && sizeBytes !== 0) return '0';
    
    // If it's already a string (pre-formatted), return as is
    if (typeof sizeBytes === 'string') return sizeBytes;
    
    // If it's not a number, return '0'
    if (typeof sizeBytes !== 'number') return '0';
    
    // Convert bytes to KB
    const kb = sizeBytes / 1024;
    return kb.toFixed(1);
};

const ImportFileTab = ({ files, url, onFilesChange, onChangeUrl, onFileDelete }) => {
    const hasFiles = files && files.length > 0;



    return (
        <Box sx={{ width: '100%', mt: '2.75rem', display: 'flex', flexDirection: 'column', gap: '2.75rem' }}>
            <Stack direction="column" spacing={1.5}>
                <Typography sx={{ color: gray800, fontWeight: 500 }}>Import by URL</Typography>
                <Box display='flex'>
                    <FormControl sx={{
                        minWidth: '6.375rem',
                    }}>
                        <Box
                            sx={{
                                fontSize: '1rem',
                                border: `1px solid ${gray300}`,
                                borderRadius: '0.5rem',
                                borderRight: 0,
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0,
                                height: '2.5rem',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                color: gray600
                            }}
                        >
                            https://
                        </Box>
                    </FormControl>
                    <CustomFormField
                        value={url} 
                        onChange={onChangeUrl} 
                        placeholder={hasFiles ? 'Remove files to enable URL import' : 'Enter object string'}
                        disabled={hasFiles}
                        sx={{
                            width: 'auto',
                            flex: 1,
                            height: '2.5rem',
                            '& .MuiInputBase-input': {
                                borderTopLeftRadius: 0,
                                borderBottomLeftRadius: 0
                            }
                        }}
                    />
                </Box>
            </Stack>
            <Divider sx={{ borderColor: gray200, '& .MuiDivider-wrapper': { fontSize: '0.75rem', color: gray600 } }}>or</Divider>
            <Box>
                <ImportFile onFilesSelected={onFilesChange} />
                <Box mt={2.5}>
                    {files.map((file, index) => (
                        <Box key={file.id || `${file.name}-${index}`} sx={{ border: `1px solid ${gray300}`, borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1rem', mb: 2 }}>
                            <Box display="flex" gap={1.5}>
                                {getFileIcon(file.name)}
                                <Stack>
                                    <Typography variant="body2" sx={{ color: gray700, fontWeight: 500 }}>
                                        {file.name || 'Unknown file'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: gray600 }}>
                                        {formatFileSize(file.size)} KB – {file.progress || 100}% uploaded
                                    </Typography>
                                </Stack>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                                {onFileDelete && (
                                    <IconButton 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onFileDelete(index);
                                        }}
                                        size="small"
                                        sx={{ color: gray600, '&:hover': { color: 'error.main' } }}
                                        aria-label="Delete file"
                                    >
                                        <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                )}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    )
}

ImportFileTab.propTypes = {
    files: PropTypes.array.isRequired,
    url: PropTypes.string.isRequired,
    onFilesChange: PropTypes.func.isRequired,
    onChangeUrl: PropTypes.func.isRequired,
    onFileDelete: PropTypes.func
}

export default ImportFileTab;
