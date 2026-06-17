export const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

export const getComparator = (order, orderBy) => {
    return (a, b) => {
        const aValue = a[orderBy];
        const bValue = b[orderBy];

        if (aValue === '' && bValue === '') {
            return 0;
        } else if (aValue === '') {
            return 1;
        } else if (bValue === '') {
            return -1;
        } else {
            // Convert to lowercase for case-insensitive comparison
            const aLower = typeof aValue === 'string' ? aValue.toLowerCase() : aValue;
            const bLower = typeof bValue === 'string' ? bValue.toLowerCase() : bValue;
            
            if (order === 'desc') {
                return bLower < aLower ? -1 : 1;
            } else {
                return aLower < bLower ? -1 : 1;
            }
        }
    };
};


// stableSort brings sort stability to non-modern browsers
export const stableSort = (array, comparator) => {
    const stabilizedThis = (array ?? []).map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

export function compareArrays(originalArray, modifiedArray) {
    if (!Array.isArray(originalArray) || !Array.isArray(modifiedArray)) {
        console.warn("compareArrays received invalid input", { originalArray, modifiedArray });
        return [];
    }

    return originalArray.filter(item => !modifiedArray.includes(item));
}

export function compareSentences(originalText, modifiedText) {
    // Split texts into sentences
    const originalSentences = originalText.match(/[^.!?]+[.!?]+/g) || [];
    const modifiedSentences = modifiedText.match(/[^.!?]+[.!?]+/g) || [];

    // Find sentences in original that are not in modified
    const uniqueSentences = originalSentences.filter(sentence =>
        !modifiedSentences.some(modSentence =>
            sentence.trim().toLowerCase() === modSentence.trim().toLowerCase()
        )
    );
    return uniqueSentences;
}

export function compareStrings(originalString, modifiedString) {
    return originalString !== modifiedString ? [originalString] : []
}

export function compareObjects(originalObject, modifiedObject) {
    return Object.keys(originalObject).filter((key) => originalObject[key] !== modifiedObject[key])
}

export function getDataType(data) {
    if (Array.isArray(data)) return "array"
    if (typeof data === "string") return "string"
    if (typeof data === "number") return "number"
    if (typeof data === "boolean") return "boolean"
    if (data === null) return "null"
    if (typeof data === "object") return "object"
    return "unknown"
}

export function formatTimestamp(rawDate) {
    if (!rawDate || typeof rawDate !== 'string') return 'Invalid date';

    try {
        const cleanedDateStr = rawDate.replace(',', '.');
        const date = new Date(cleanedDateStr);

        if (isNaN(date)) return 'Invalid date';

        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');

        return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    } catch (e) {
        return 'Invalid date';
    }
}

