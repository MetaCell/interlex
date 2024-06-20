import React from "react";
import { Pagination, PaginationItem, Typography } from "@mui/material";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const CustomPagination = ({ rowCount, rowsPerPage, page, onPageChange }) => {
    return (
        <Pagination
            count={Math.ceil(rowCount / rowsPerPage)}
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