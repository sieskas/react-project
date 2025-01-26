import React from 'react';
import { TableBody, TableRow, TableCell } from '@/components/ui/table.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Trash2 } from 'lucide-react';
import { flexRender } from '@tanstack/react-table';

const TableBodyComponent = ({
                                table,
                                setEditingItem,
                                setIsDialogOpen,
                                onDelete,
                                idField
                            }) => {
    const rows = table.getRowModel()?.rows || [];
    const headerGroups = table.getHeaderGroups();

    return (
        <TableBody>
            {rows.length ? (
                rows.map(row => (
                    <TableRow
                        key={row.id}
                        onClick={() => {
                            setEditingItem(row.original);
                            setIsDialogOpen(true);
                        }}
                    >
                        {row.getVisibleCells().map(cell => (
                            <TableCell key={cell.id}>
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                            </TableCell>
                        ))}
                        <TableCell>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(row.original[idField]);
                                }}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell
                        colSpan={headerGroups.length > 0 ? headerGroups[0].headers.length + 1 : 1}
                        className="h-24 text-center"
                    >
                        Aucun résultat.
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
    );
};

export default TableBodyComponent;
