import PropTypes from "prop-types";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { Box, Divider, Button } from "@mui/material";
import DialogContent from "@mui/material/DialogContent";

import { vars } from "../../../theme/variables";
const { gray600, gray200 } = vars;

const HeaderRightSideContent = ({ handleClose, handleSubmit }) => {
    return (
        <Box display='flex' alignItems='center' gap='.75rem'>
            <Button variant="outlined" onClick={handleClose}>Cancel</Button>
            <Button variant='contained' onClick={handleSubmit}>
                Save Changes
            </Button>
        </Box>
    );
};

HeaderRightSideContent.propTypes = {
    handleClose: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
};

const AccountSettingsDialog = ({
    children,
    title,
    open,
    handleClose,
    sx,
}) => {
    return (
        <Dialog
            onClose={handleClose}
            aria-labelledby="accounts-settings-dialog-title"
            open={open}
            sx={sx}
        >
            <Box
                sx={{
                    m: 0,
                    p: "1rem 1.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: `1px solid ${gray200}`,
                }}
                id="accounts-settings-title"
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <IconButton aria-label="close" onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{
                            margin: "0 1.5rem",
                        }}
                    />
                    <Typography fontWeight={500} fontSize="1.25rem" color={gray600}>
                        {title}
                    </Typography>
                </Box>
                <HeaderRightSideContent handleClose={handleClose} handleSubmit={handleClose}/>
            </Box>
            <DialogContent sx={{ padding: "2.25rem 3.25rem 2.5rem 3.25rem" }}>
                {children}
            </DialogContent>
        </Dialog>
    );
};

AccountSettingsDialog.propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    // HeaderRightSideContent: PropTypes.node,
    sx: PropTypes.object,
};

export default AccountSettingsDialog;
