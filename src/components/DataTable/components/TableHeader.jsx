import React from 'react';
import { TableHeader, TableRow, TableHead } from '@/components/ui/table.jsx';

const TableHeaderComponent = ({ table }) => {
    const headerGroups = table.getHeaderGroups();
    if (!headerGroups.length) return null; // Si pas d'en-tête, ne pas rendre le composant

    return (
        <TableHeader>
            <TableRow>
                {headerGroups[0].headers.map((header) => (
                    <TableHead key={header.id}>
                        {header.isPlaceholder ? null : header.column.columnDef.header({ column: header.column })}
                    </TableHead>
                ))}
                <TableHead>Actions</TableHead>
            </TableRow>
        </TableHeader>
    );
};

export default TableHeaderComponent;
