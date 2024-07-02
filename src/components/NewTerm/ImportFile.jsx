import React, { useEffect, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const styles = {
    dragDrop: {
        background: "#fff",
        border: "1px solid #BDC2C1",
        borderRadius: "0.75rem"
    },
    documentUploader: {
        padding: "24px",
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
        color: '#515252',
        cursor: 'default'
    },
    uploadText: {
        color: '#0D4037',
        fontWeight: 600,
        cursor: 'pointer'
    }
}

const ImportFile = ({ onFilesSelected }) => {
    const [files, setFiles] = useState([]);

    const handleFileChange = (event) => {
        const selectedFiles = event.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            const newFiles = Array.from(selectedFiles);
            setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        }
    };
    const handleDrop = (event) => {
        event.preventDefault();
        const droppedFiles = event.dataTransfer.files;
        if (droppedFiles.length > 0) {
            const newFiles = Array.from(droppedFiles);
            setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        }
    };

    const handleRemoveFile = (index) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    useEffect(() => {
        onFilesSelected(files);
    }, [files, onFilesSelected]);

    return (
        <Box sx={{ width: "100%", height: "142px", ...styles.dragDrop }}>
            <div
                onDrop={handleDrop}
                style={styles.documentUploader}
                onDragOver={(event) => event.preventDefault()}
            >
                <>
                    <Box sx={styles.uploadInfo}>
                        <Box>
                            <IconButton sx={{ padding: '10px', color: '#313534', border: '1px solid #BDC2C1' }}>
                                <ErrorOutlineIcon />
                            </IconButton>
                        </Box>
                    </Box>
                    <input
                        type="file"
                        hidden
                        id="browse"
                        onChange={handleFileChange}
                        // accept=".pdf,.docx,.pptx,.txt,.xlsx"
                        accept=".csv"
                        multiple
                    />
                    <Box display="flex" sx={styles.uploadLabel} gap={0.50}>
                        <label htmlFor="browse">
                            <span style={styles.uploadText}>Click to upload</span>
                        </label>
                        <span>or drag and drop</span>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#515252', cursor: 'default' }}>CSV (max. 800MB)</Typography>
                </>
            </div>
        </Box>
    );
};

export default ImportFile;
