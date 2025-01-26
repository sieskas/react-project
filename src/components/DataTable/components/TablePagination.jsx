// components/data-table/table-pagination.jsx
import React from 'react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
    PaginationLink,
    PaginationEllipsis
} from '@/components/ui/pagination';

const TablePagination = ({ table, data, onPageChange }) => {
    const pageIndex = table.getState().pagination.pageIndex;
    const pageSize = table.getState().pagination.pageSize;

    const handlePageChange = (newPage) => {
        table.setPageIndex(newPage);
        onPageChange?.(newPage, pageSize);
    };

    return (
        <div className="flex items-center justify-between py-4">
            <div className="text-sm text-gray-500">
                {pageSize * pageIndex + 1}-{Math.min(pageSize * (pageIndex + 1), data.totalElements)} sur {data.totalElements} éléments
            </div>
            <div className="flex items-center gap-4 ml-auto">
                <Pagination>
                    <PaginationContent className="flex gap-2">
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => handlePageChange(pageIndex - 1)}
                                disabled={!table.getCanPreviousPage()}
                            />
                        </PaginationItem>

                        {Array.from({ length: data.totalPages }, (_, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink
                                    onClick={() => handlePageChange(i)}
                                    isActive={pageIndex === i}
                                >
                                    {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}

                        <PaginationItem>
                            <PaginationNext
                                onClick={() => handlePageChange(pageIndex + 1)}
                                disabled={!table.getCanNextPage()}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
};

export default TablePagination;