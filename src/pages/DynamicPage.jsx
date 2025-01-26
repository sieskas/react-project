import React, {useState, useMemo} from 'react';
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
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Plus, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Search} from "lucide-react";
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";

// Fonction de génération des données de test
const generateTestData = (count = 35) => {
    const firstNames = ["Jean", "Sophie", "Louis", "Emma", "Thomas", "Marie", "Paul", "Julie", "Pierre", "Clara"];
    const lastNames = ["Dupont", "Martin", "Bernard", "Lemoine", "Dubois", "Moreau", "Laurent", "Simon", "Michel", "Robert"];

    const content = Array.from({length: count}, (_, i) => ({
        "ID": i + 1,
        "Last Name": lastNames[Math.floor(Math.random() * lastNames.length)],
        "First Name": firstNames[Math.floor(Math.random() * firstNames.length)],
        "Age": Math.floor(Math.random() * (60 - 20) + 20),
        "Email": `user${i + 1}@example.com`
    }));

    const pageSize = 10;
    const totalPages = Math.ceil(count / pageSize);

    return {
        "columns": ["ID", "Last Name", "First Name", "Age", "Email"],
        "content": content,
        "pageable": {
            "pageNumber": 0,
            "pageSize": pageSize,
            "sort": {
                "empty": true,
                "sorted": false,
                "unsorted": true
            },
        },
        "totalElements": count,
        "totalPages": totalPages,
        "last": true,
        "size": pageSize,
        "number": 0,
        "numberOfElements": count,
        "first": true,
        "empty": false
    };
};

// Données de test initiales
const testData = generateTestData();

const GenericDataTable = ({
                              initialData = testData,
                              title = "Données",
                              idField = "ID",
                              onPageChange = (pageIndex, pageSize) => console.log("Page changed:", pageIndex, pageSize),
                              onSortChange = (sort) => console.log("Sort changed:", sort)
                          }) => {
    const [data, setData] = useState(initialData);
    const [editingItem, setEditingItem] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [{pageIndex, pageSize}, setPagination] = useState({
        pageIndex: initialData.pageable.pageNumber,
        pageSize: initialData.pageable.pageSize,
    });

    const columns = useMemo(() => {
        if (!data?.columns) return [];
        return data.columns.map((col) => ({
            accessorKey: col,
            header: ({column}) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            column.toggleSorting(column.getIsSorted() === "asc");
                            const newSort = column.getIsSorted() === "asc" ? "desc" : "asc";
                            onSortChange({field: col, direction: newSort});
                        }}
                        className="hover:bg-transparent"
                    >
                        {col}
                        {column.getIsSorted() === "asc" ? (
                            <ArrowUp className="ml-2 h-4 w-4"/>
                        ) : column.getIsSorted() === "desc" ? (
                            <ArrowDown className="ml-2 h-4 w-4"/>
                        ) : (
                            <ArrowUpDown className="ml-2 h-4 w-4"/>
                        )}
                    </Button>
                );
            },
        }));
    }, [data?.columns, onSortChange]);

    const table = useReactTable({
        data: data?.content || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            globalFilter,
            pagination: {
                pageIndex,
                pageSize,
            },
        },
        pageCount: Math.ceil(data?.totalElements / pageSize),
        manualPagination: false,
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
        setData(prevData => {
            const newContent = prevData.content.filter(item => item[idField] !== id);
            const newTotalElements = newContent.length;
            const newTotalPages = Math.ceil(newTotalElements / pageSize);

            return {
                ...prevData,
                content: newContent,
                totalElements: newTotalElements,
                totalPages: newTotalPages
            };
        });
    };

    const handleSave = () => {
        if (editingItem) {
            setData(prevData => ({
                ...prevData,
                content: prevData.content.map(item =>
                    item[idField] === editingItem[idField] ? editingItem : item
                )
            }));
        } else {
            const newId = data.content.length > 0
                ? Math.max(...data.content.map(item => item[idField])) + 1
                : 1;

            const itemToAdd = {
                ...newItem,
                [idField]: newId
            };

            setData(prevData => {
                const newContent = [...prevData.content, itemToAdd];
                const newTotalElements = newContent.length;
                const newTotalPages = Math.ceil(newTotalElements / pageSize);

                return {
                    ...prevData,
                    content: newContent,
                    totalElements: newTotalElements,
                    totalPages: newTotalPages
                };
            });
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
                        <Search className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2"/>
                    </div>
                    <Button onClick={handleAdd} className="flex items-center gap-2">
                        <Plus className="w-4 h-4"/>
                        Ajouter
                    </Button>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {table.getHeaderGroups()[0].headers.map((header) => (
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
                                            <Trash2 className="w-4 h-4"/>
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

            <div className="flex items-center justify-between py-4">
                <div className="text-sm text-gray-500">
                    {pageSize * pageIndex + 1}-{Math.min(pageSize * (pageIndex + 1), data.totalElements)} sur {data.totalElements} éléments
                </div>
                <div className="flex items-center gap-4 ml-auto">
                    <Pagination>
                        <PaginationContent className="flex gap-2">
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                />
                            </PaginationItem>

                            {Array.from({ length: data.totalPages }, (_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        onClick={() => table.setPageIndex(i)}
                                        isActive={pageIndex === i}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
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