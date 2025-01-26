import React, { useState, useMemo } from 'react';
import { Table } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel } from '@tanstack/react-table';
import TableHeader from './components/TableHeader';
import TableBody from './components/TableBody';
import TablePagination from './components/TablePagination';
import TableToolbar from './components/TableToolbar';
import DialogForm from '../DialogForm';

const DataTable = ({
                       initialData,
                       title,
                       idField,
                       onPageChange,
                       onDelete,
                       onSave,
                       editingItem,
                       setEditingItem
                   }) => {
    const [data, setData] = useState(initialData);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [{ pageIndex, pageSize }, setPagination] = useState({
        pageIndex: initialData.pageable.pageNumber,
        pageSize: initialData.pageable.pageSize,
    });

    const columns = useMemo(() => {
        if (!data?.columns) return [];

        return data.columns.map((col) => ({
            accessorKey: col.name || col, // Vérifie si `col` est un objet ou un simple string
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    {col.name || col} {/* Assure que l'en-tête a toujours une valeur */}
                </Button>
            ),
        }));
    }, [data?.columns]);


    const table = useReactTable({
        data: data.content,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: { sorting, globalFilter, pagination: { pageIndex, pageSize } },
        onSortingChange: setSorting,
        onPaginationChange: (updater) => {
            const newPagination = typeof updater === 'function'
                ? updater({ pageIndex, pageSize })
                : updater;
            setPagination(newPagination);
            onPageChange?.(newPagination.pageIndex, newPagination.pageSize);
        },
        onGlobalFilterChange: setGlobalFilter,
        manualPagination: true,
        pageCount: data.totalPages,
    });

    return (
        <div className="p-8">
            <TableToolbar
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                setIsDialogOpen={setIsDialogOpen}
            />
            <div className="rounded-md border">
                <Table>
                    <TableHeader table={table} />
                    <TableBody
                        table={table}
                        setEditingItem={setEditingItem}
                        setIsDialogOpen={setIsDialogOpen}
                        onDelete={onDelete}
                        idField={idField}
                    />
                </Table>
            </div>
            <TablePagination
                table={table}
                data={data}
                onPageChange={onPageChange}
            />
            <DialogForm
                open={isDialogOpen}
                setOpen={setIsDialogOpen}
                data={data}
                onSave={onSave}
                editingItem={editingItem}
                setEditingItem={setEditingItem}
                idField={idField}
            />
        </div>
    );
};

export default DataTable;
