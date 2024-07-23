import React from "react";
import { Pagination, PaginationItem, Typography } from "@mui/material";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const CustomPagination = ({ rowCount, rowsPerPage = 10, page, onPageChange }) => {
    const pageCount = Math.ceil(rowCount / (rowsPerPage || 1)); // Prevent division by zero

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
    )
}

export default CustomPagination;