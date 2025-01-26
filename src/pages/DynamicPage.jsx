import React, { useState } from 'react';
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
import { Plus, Trash2 } from "lucide-react";

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
            // Generate new ID for new item
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{title}</h1>
                <Button onClick={handleAdd} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Ajouter
                </Button>
            </div>

            <Table className="border rounded-lg">
                <TableHeader>
                    <TableRow>
                        {data.columns.map((column) => (
                            <TableHead key={column}>{column}</TableHead>
                        ))}
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.people.map((item) => (
                        <TableRow
                            key={item[idField]}
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => handleEdit(item)}
                        >
                            {data.columns.map((column) => (
                                <TableCell key={`${item[idField]}-${column}`}>
                                    {item[column]}
                                </TableCell>
                            ))}
                            <TableCell>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(item[idField]);
                                    }}
                                    className="flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Supprimer
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

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