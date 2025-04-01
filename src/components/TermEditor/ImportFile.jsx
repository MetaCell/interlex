import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import { vars } from "../../theme/variables";
const { white, gray300, brand700, gray600, gray700 } = vars;

const MAX_FILE_SIZE_MB = 800;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const styles = {
    dragDrop: {
        background: white,
        border: `1px solid ${gray300}`,
        borderRadius: "0.75rem"
    },
    documentUploader: {
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        borderRadius: "0.5rem",
        cursor: "pointer",
        height: '100%',
        '&:active': {
            borderColor: "#6dc24b"
        }
    },
    uploadInfo: {
        display: "flex",
        alignItems: "center",
        marginBottom: "1rem",
        height: '100%'
    },
    uploadLabel: {
        fontSize: '0.875rem',
        color: gray600,
        cursor: 'default'
    },
    uploadText: {
        color: brand700,
        fontWeight: 600,
        cursor: 'pointer'
    }
}

const ImportFile = ({ onFilesSelected }) => {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState("");

    const handleFileChange = (event) => {
        const selectedFiles = event.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            const newFiles = Array.from(selectedFiles);
            const validFiles = newFiles.filter(file => file.size <= MAX_FILE_SIZE_BYTES);

            if (validFiles.length < newFiles.length) {
                setError(`Some files were too large and were not added (max size is ${MAX_FILE_SIZE_MB}MB).`);
            } else {
                setError("");
            }

            setFiles((prevFiles) => [...prevFiles, ...validFiles]);
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const droppedFiles = event.dataTransfer.files;
        if (droppedFiles.length > 0) {
            const newFiles = Array.from(droppedFiles);
            const validFiles = newFiles.filter(file => file.size <= MAX_FILE_SIZE_BYTES);

            if (validFiles.length < newFiles.length) {
                setError(`Some files were too large and were not added (max size is ${MAX_FILE_SIZE_MB}MB).`);
            } else {
                setError("");
            }

            setFiles((prevFiles) => [...prevFiles, ...validFiles]);
        }
    };


    // eslint-disable-next-line no-unused-vars
    const handleRemoveFile = (index) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    useEffect(() => {
        onFilesSelected(files);
    }, [files, onFilesSelected]);

    return (
        <Box sx={{ width: "100%", height: "8.875rem", ...styles.dragDrop }}>
            <div
                onDrop={handleDrop}
                style={styles.documentUploader}
                onDragOver={(event) => event.preventDefault()}
            >
                <>
                    <Box sx={styles.uploadInfo}>
                        <Box>
                            <IconButton sx={{ padding: '0.625rem', color: gray700, border: '1px solid #BDC2C1' }}>
                                <ErrorOutlineIcon />
                            </IconButton>
                        </Box>
                    </Box>
                    <input
                        type="file"
                        hidden
                        id="browse"
                        onChange={handleFileChange}
                        accept=".csv"
                        multiple
                    />
                    <Box display="flex" sx={styles.uploadLabel} gap={0.50}>
                        <label htmlFor="browse">
                            <span style={styles.uploadText}>Click to upload</span>
                        </label>
                        <span>or drag and drop</span>
                    </Box>
                    <Typography variant="caption" sx={{ color: gray600, cursor: 'default' }}>CSV (max. 800MB)</Typography>
                    {error && <Typography variant="caption" sx={{ color: 'red' }}>{error}</Typography>}
                </>
            </div>
        </Box>
    );
};

ImportFile.propTypes = {
    onFilesSelected: PropTypes.func.isRequired,
};

export default ImportFile;
