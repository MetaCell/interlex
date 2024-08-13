import React from "react";
import PropTypes from "prop-types";
import { Pagination, PaginationItem, Typography } from "@mui/material";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const CustomPagination = ({ rowCount = 0, rowsPerPage = 10, page = 1, onPageChange }) => {
    // Ensure rowCount and rowsPerPage are valid numbers
    const validRowCount = typeof rowCount === 'number' && !isNaN(rowCount) ? rowCount : 0;
    const validRowsPerPage = typeof rowsPerPage === 'number' && !isNaN(rowsPerPage) ? rowsPerPage : 10;

    const pageCount = Math.ceil(validRowCount / validRowsPerPage) || 1; // Ensure at least 1 page

    return (
        <Pagination
            count={pageCount}
            page={page}
            onChange={onPageChange}
            shape="rounded"
            renderItem={(item) => (
                <PaginationItem
                    slots={{
                        previous: () => (
                            <>
                                <ChevronLeftIcon />
                                <Typography variant="label">Previous</Typography>
                            </>
                        ),
                        next: () => (
                            <>
                                <Typography variant="label">
                                    Next
                                </Typography>
                                <ChevronRightIcon />
                            </>
                        ),
                    }}
                    {...item}
                />
            )}
        />
    );
};

// PropTypes validation
CustomPagination.propTypes = {
    rowCount: PropTypes.number,
    rowsPerPage: PropTypes.number,
    page: PropTypes.number,
    onPageChange: PropTypes.func.isRequired
};

export default CustomPagination;
