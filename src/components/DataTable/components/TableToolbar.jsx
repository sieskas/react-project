import React from 'react';
import { Input } from '@/components/ui/input.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Plus, Search } from 'lucide-react';

const TableToolbar = ({ globalFilter, setGlobalFilter, setIsDialogOpen }) => (
    <div className="flex justify-between items-center mb-4">
        <div className="relative">
            <Input placeholder="Rechercher..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4" /> Ajouter
        </Button>
    </div>
);

export default TableToolbar;
