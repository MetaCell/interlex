export const getStatusProps = (responseStatus) => ({
    statusResponse: responseStatus,
    successMessage: "Bulk terms edit successful",
    failureMessage: "Unable to create the bulk term",
    successDescription: `Your changes has been applied. Click finish to close the modal, or restart editing.`,
    failureDescription: `Your changes hasn't been applied. Click finish to close the modal, or restart editing.`,
    actionButtonMessage: responseStatus?.success ? "Edit bulk terms" : null,
    isTryButtonVisible: responseStatus?.success ? false : true,
});
