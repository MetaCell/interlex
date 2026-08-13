import React from "react";
import { Box, Typography } from "@mui/material";
import { vars } from "../../../theme/variables";

const { white, error700, success700 } = vars;

const styles = {
    statusContainer: {
        position: "relative",
        width: "fit-content",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "2.25rem",
        borderRadius: "0 0.25rem 0.25rem 0.25rem",
    },
    overlay: (color: string) => ({
        position: "absolute" as const,
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: `${color}10`,
        zIndex: 2,
    }),
    childrenWrapper: {
        position: "relative" as const,
        zIndex: 1,
        minWidth: 0,
    },
    status: (color: string) => ({
        border: `2px solid ${color}`,
    }),
    label: (color: string) => ({
        position: "absolute" as const,
        padding: "0 0.25rem",
        left: "-2px",
        bottom: "100%",
        borderRadius: "0.25rem 0.25rem 0 0",
        fontSize: "0.75rem !important",
        lineHeight: "1.125rem",
        color: `${white} !important`,
        background: color,
        zIndex: 3
    }),
};


interface MergeStatusContainerProps {
    status: string;
    children: React.ReactNode;
    /** Stretch to the full row width — used when the whole triple row is the change. */
    fullWidth?: boolean;
}

const getStatusStyles = (status: string) => {
    if (status === "delete") {
        return {
            color: error700,
            label: "Deleted",
        };
    }
    return {
        color: success700,
        label: "Added",
    };
};

const MergeStatusWrapper: React.FC<MergeStatusContainerProps> = ({ children, status, fullWidth = false }) => {
    const { color, label } = getStatusStyles(status);

    return (
        <Box sx={{
            ...styles.statusContainer,
            ...styles.status(color),
            ...(fullWidth ? { width: "100%" } : {}),
        }}>
            <Box sx={styles.overlay(color)} />
            <Typography component="span" sx={styles.label(color)}>
                {label}
            </Typography>
            <Box sx={{ ...styles.childrenWrapper, ...(fullWidth ? { width: "100%" } : {}) }}>{children}</Box>
        </Box>
    );
};

export default MergeStatusWrapper;
