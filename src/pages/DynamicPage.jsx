import React, { useState, useMemo } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
} from "@tanstack/react-table";

// Données de test
const testData = {
    "columns": ["ID", "Last Name", "First Name", "Age", "Email"],
    "people": [
        {
            "ID": 1,
            "Last Name": "Dupont",
            "First Name": "Jean",
            "Age": 30,
            "Email": "jean.dupont@example.com"
        },
        {
            "ID": 2,
            "Last Name": "Martin",
            "First Name": "Sophie",
            "Age": 25,
            "Email": "sophie.martin@example.com"
        },
        {
            "ID": 3,
            "Last Name": "Bernard",
            "First Name": "Louis",
            "Age": 40,
            "Email": "louis.bernard@example.com"
        },
        {
            "ID": 4,
            "Last Name": "Lemoine",
            "First Name": "Emma",
            "Age": 35,
            "Email": "emma.lemoine@example.com"
        }
    ]
};

const GenericDataTable = ({
                              initialData = testData,
                              title = "Données",
                              idField = "ID"
                          }) => {
    const [data, setData] = useState(initialData);
    const [editingItem, setEditingItem] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');

    const columns = useMemo(() => {
        if (!data?.columns) return [];
        return data.columns.map((col) => ({
            accessorKey: col,
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="hover:bg-transparent"
                    >
                        {col}
                        {column.getIsSorted() === "asc" ? (
                            <ArrowUp className="ml-2 h-4 w-4" />
                        ) : column.getIsSorted() === "desc" ? (
                            <ArrowDown className="ml-2 h-4 w-4" />
                        ) : (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                    </Button>
                );
            },
        }));
    }, [data?.columns]);

    const table = useReactTable({
        data: data?.people || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: (row, columnId, filterValue) => {
            const value = row.getValue(columnId);
            if (value === null || value === undefined) return false;
            return String(value)
                .toLowerCase()
                .includes(String(filterValue).toLowerCase());
        },
        state: {
            sorting,
            globalFilter,
        },
    });

    const createEmptyItem = () => {
        return data.columns.reduce((acc, column) => {
            acc[column] = "";
            return acc;
        }, {});
    };

    const [newItem, setNewItem] = useState(createEmptyItem());

    const handleEdit = (item) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };

    const handleDelete = (id) => {
        setData(prevData => ({
            ...prevData,
            people: prevData.people.filter(item => item[idField] !== id)
        }));
    };

    const handleSave = () => {
        if (editingItem) {
            setData(prevData => ({
                ...prevData,
                people: prevData.people.map(item =>
                    item[idField] === editingItem[idField] ? editingItem : item
                )
            }));
        } else {
            const newId = data.people.length > 0
                ? Math.max(...data.people.map(item => item[idField])) + 1
                : 1;

            const itemToAdd = {
                ...newItem,
                [idField]: newId
            };

            setData(prevData => ({
                ...prevData,
                people: [...prevData.people, itemToAdd]
            }));
        }

        setIsDialogOpen(false);
        setEditingItem(null);
        setNewItem(createEmptyItem());
    };

    const handleInputChange = (field, value) => {
        if (editingItem) {
            setEditingItem(prev => ({
                ...prev,
                [field]: value
            }));
        } else {
            setNewItem(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleAdd = () => {
        setEditingItem(null);
        setNewItem(createEmptyItem());
        setIsDialogOpen(true);
    };

    if (!data?.columns?.length) {
        return (
            <div className="p-8 text-center">
                <p>Aucune donnée disponible</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex flex-col gap-6 mb-6">
                <h1 className="text-2xl font-bold">{title}</h1>
                <div className="flex justify-between items-center">
                    <div className="relative">
                        <Input
                            placeholder="Rechercher..."
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="w-[300px] pl-3 pr-10"
                        />
                        <Search className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <Button onClick={handleAdd} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Ajouter
                    </Button>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleEdit(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
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
                                                handleDelete(row.original[idField]);
                                            }}
                                            className="flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Supprimer
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length + 1}
                                    className="h-24 text-center"
                                >
                                    Aucun résultat.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? "Modifier l'élément" : "Ajouter un élément"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingItem
                                ? "Modifiez les informations ci-dessous puis cliquez sur Enregistrer"
                                : "Remplissez les informations ci-dessous puis cliquez sur Ajouter"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {data.columns
                            .filter(field => field !== idField)
                            .map((field) => (
                                <div key={field} className="space-y-2">
                                    <label className="text-sm font-medium">{field}</label>
                                    <Input
                                        value={editingItem ? editingItem[field] : newItem[field]}
                                        onChange={(e) => handleInputChange(field, e.target.value)}
                                        placeholder={`Entrez ${field.toLowerCase()}`}
                                        className="w-full"
                                    />
                                </div>
                            ))}
                    </div>
                    <DialogFooter className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleSave}>
                            {editingItem ? "Enregistrer" : "Ajouter"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default GenericDataTable;