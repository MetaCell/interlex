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
            if (order === 'desc') {
                return bValue < aValue ? -1 : 1;
            } else {
                return aValue < bValue ? -1 : 1;
            }
        }
    };
};


// stableSort brings sort stability to non-modern browsers
export const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}