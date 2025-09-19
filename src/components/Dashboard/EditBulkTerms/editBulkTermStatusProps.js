export const getStatusProps = (batchResults, isUpdating = false) => {
    if (!batchResults) {
        return {
            statusResponse: { success: false },
            successMessage: "Bulk terms edit in progress",
            failureMessage: "Bulk terms edit in progress",
            successDescription: "Please wait while changes are being applied...",
            failureDescription: "Please wait while changes are being applied...",
            actionButtonMessage: null,
            isTryButtonVisible: false,
        };
    }

    const isSuccess = batchResults.failed.length === 0;
    const successCount = batchResults.successful.length;
    const failureCount = batchResults.failed.length;
    const totalCount = batchResults.total;

    // If currently updating (retry in progress), show appropriate messages
    if (isUpdating) {
        return {
            statusResponse: { success: false },
            successMessage: "Retrying failed updates...",
            failureMessage: "Retrying failed updates...",
            successDescription: `Retrying ${failureCount} failed term updates. Please wait...`,
            failureDescription: `Retrying ${failureCount} failed term updates. Please wait...`,
            actionButtonMessage: null,
            isTryButtonVisible: false,
        };
    }

    return {
        statusResponse: { success: isSuccess },
        successMessage: isSuccess 
            ? `Bulk terms edit successful - ${successCount}/${totalCount} terms updated`
            : `Bulk terms edit partially successful - ${successCount}/${totalCount} terms updated`,
        failureMessage: `Bulk terms edit failed - ${failureCount}/${totalCount} terms failed to update`,
        successDescription: isSuccess 
            ? `All ${successCount} term changes have been successfully applied. Click finish to close the modal, or restart editing.`
            : `${successCount} terms were updated successfully, but ${failureCount} failed. You can try again for the failed terms. Click finish to close the modal, or restart editing.`,
        failureDescription: `${failureCount} out of ${totalCount} term updates failed. Check the error details and try again for the failed terms. Click finish to close the modal, or restart editing.`,
        actionButtonMessage: "Edit bulk terms",
        isTryButtonVisible: !isSuccess && failureCount > 0,
        batchDetails: {
            successful: batchResults.successful,
            failed: batchResults.failed,
            total: totalCount
        }
    };
};
