export const getTermStatusProps = (responseStatus, termValue) => ({
    statusResponse: responseStatus,
    successMessage: "Term successfully created",
    failureMessage: "Unable to create the term",
    successDescription: `Your term “${termValue.charAt(0).toUpperCase() + termValue.slice(1)}” has been added. Go to your term or add a new one.`,
    failureDescription: `Your term “${termValue.charAt(0).toUpperCase() + termValue.slice(1)}” has can’t be added. Close or try again.`,
    actionButtonMessage: responseStatus?.success? "Add a new term" : null,
    isCloseButtonVisible: responseStatus?.success? false: true,
    isTryButtonVisible: responseStatus?.success? false: true,
});
