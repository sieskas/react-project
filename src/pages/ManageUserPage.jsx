// ManageUserPage.jsx
import React, { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";

// Données de test - stockées en dehors du composant
let allTestData = [
    { ID: 1, Nom: "Dupont", Prénom: "Jean", Âge: 35, Email: "jean.dupont@example.com", Ville: "Paris" },
    { ID: 2, Nom: "Martin", Prénom: "Sophie", Âge: 28, Email: "sophie.martin@example.com", Ville: "Marseille" },
    { ID: 3, Nom: "Lemoine", Prénom: "Paul", Âge: 42, Email: "paul.lemoine@example.com", Ville: "Lyon" },
    { ID: 4, Nom: "Bernard", Prénom: "Marie", Âge: 31, Email: "marie.bernard@example.com", Ville: "Paris" },
    { ID: 5, Nom: "Thomas", Prénom: "Lucas", Âge: 45, Email: "lucas.thomas@example.com", Ville: "Lyon" },
    { ID: 6, Nom: "Robert", Prénom: "Emma", Âge: 29, Email: "emma.robert@example.com", Ville: "Marseille" },
    { ID: 7, Nom: "Dubois", Prénom: "Louis", Âge: 38, Email: "louis.dubois@example.com", Ville: "Paris" },
    { ID: 8, Nom: "Petit", Prénom: "Alice", Âge: 33, Email: "alice.petit@example.com", Ville: "Marseille" },
    { ID: 9, Nom: "Richard", Prénom: "Hugo", Âge: 27, Email: "hugo.richard@example.com", Ville: "Lyon" },
    { ID: 10, Nom: "Moreau", Prénom: "Léa", Âge: 36, Email: "lea.moreau@example.com", Ville: "Paris" }
];

const columnsSchema = [
    { name: "ID", type: "Number", maxLength: 10, required: true },
    { name: "Nom", type: "String", maxLength: 50, required: true },
    { name: "Prénom", type: "String", maxLength: 50, required: false },
    { name: "Âge", type: "Number", maxLength: 3, required: true },
    { name: "Email", type: "String", maxLength: 100, required: true },
    {
        name: "Ville",
        type: "Dropdown",
        required: false,
        // Clé contenant les valeurs de la dropdown
        dropdownOptions: ["Paris", "Marseille", "Lyon"]
    }
];

const generateData = (pageIndex = 0, pageSize = 3) => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    const paginatedData = allTestData.slice(start, end);

    return {
        columns: columnsSchema,
        content: paginatedData,
        pageable: {
            pageNumber: pageIndex,
            pageSize: pageSize
        },
        totalElements: allTestData.length,
        totalPages: Math.ceil(allTestData.length / pageSize),
        last: end >= allTestData.length,
        size: pageSize,
        number: pageIndex,
        numberOfElements: paginatedData.length,
        first: pageIndex === 0,
        empty: paginatedData.length === 0
    };
};

const ManageUserPage = () => {
    const [tableData, setTableData] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(3);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const fetchData = async (page = 0, size = 3) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const response = generateData(page, size);
            setTableData(response);
        } catch (error) {
            console.error("Erreur lors du chargement des données:", error);
        }
    };

    useEffect(() => {
        fetchData(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const handlePageChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
        fetchData(pageIndex, newPageSize);
    };

    const handleDelete = async (id) => {
        try {
            console.log("delete")
            await new Promise(resolve => setTimeout(resolve, 500));
            // Mettre à jour les données de test
            allTestData = allTestData.filter(item => item.ID !== id);
            // Recharger les données
            fetchData(currentPage, pageSize);
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
        }
    };

    const handleSave = async (formData, isEditing) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            if (isEditing) {
                console.log("edit")
                // Mise à jour
                allTestData = allTestData.map(item =>
                    item.ID === formData.ID ? formData : item
                );
            } else {
                console.log("add")
                // Ajout
                const newId = Math.max(...allTestData.map(item => item.ID)) + 1;
                allTestData = [...allTestData, { ...formData, ID: newId }];
            }

            // Recharger les données
            fetchData(currentPage, pageSize);
            setIsDialogOpen(false);
            setEditingItem(null);
        } catch (error) {
            console.error("Erreur lors de la sauvegarde:", error);
        }
    };

    if (!tableData) return <div>Chargement...</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Tableau des Utilisateurs</h1>
            <DataTable
                initialData={tableData}
                title="Utilisateurs"
                idField="ID"
                onPageChange={handlePageChange}
                onDelete={handleDelete}
                onSave={handleSave}
                isDialogOpen={isDialogOpen}
                setIsDialogOpen={setIsDialogOpen}
                editingItem={editingItem}
                setEditingItem={setEditingItem}
            />
        </div>
    );
};

export default ManageUserPage;