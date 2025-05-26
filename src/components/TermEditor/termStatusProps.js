export const getAddTermStatusProps = (response, termValue) => ({
    statusResponse: response,
    success : response?.status < 400,
    error : response?.status > 400 ,
    successMessage: "Term successfully created",
    failureMessage: "Unable to create the term : " + response?.data?.error,
    successDescription: `Your term “${termValue.charAt(0).toUpperCase() + termValue.slice(1)}” has been added. Go to your term or add a new one.`,
    failureDescription: `Your term “${termValue.charAt(0).toUpperCase() + termValue.slice(1)}” has can’t be added. Close or try again.` ,
    actionButtonMessage: response?.status < 400 ? "Add a new term" : null,
    isCloseButtonVisible: response?.status < 400 ? false : true,
    isTryButtonVisible: response?.status < 400 ? false : true,
});

export const getTermStatusProps = (responseStatus, termValue) => ({
    statusResponse: responseStatus,
    successMessage: "Changes successfully suggested",
    failureMessage: "Unable to suggest the change",
    successDescription: `The owner of “${termValue.charAt(0).toUpperCase() + termValue.slice(1)}” has received your suggestion.`,
    failureDescription: `The owner of “${termValue.charAt(0).toUpperCase() + termValue.slice(1)}” hasn't received your suggestion. Close or try again.`,
    isCloseButtonVisible: responseStatus?.success ? false : true,
    isTryButtonVisible: responseStatus?.success ? false : true,
})