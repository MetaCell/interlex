export const getTermStatusProps = (responseStatus, termValue) => ({
    responseStatus,
    termValue: termValue.charAt(0).toUpperCase() + termValue.slice(1),
    successMessage: "Term successfully created",
    failureMessage: "Unable to create the term",
    successDescription: `Your term “${termValue.charAt(0).toUpperCase() + termValue.slice(1)}” has been added. Go to your term or add a new one.`,
    addButtonMessage: "Add a new term",
    isAddButtonVisible: responseStatus === "success",
    isCloseButtonVisible: responseStatus !== "success",
    isTryAgainButtonVisible: responseStatus !== "success"
});
