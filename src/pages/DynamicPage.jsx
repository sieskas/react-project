import React, { useState, useEffect } from "react";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import Spinner from "@/components/Spinner.jsx";
import { useAuth } from "@/contexts/AuthContext.jsx";

// Fonction pour récupérer la hiérarchie des locations depuis le cache
const fetchLocationsHierarchy = () => {
    try {
        const storedData = localStorage.getItem("locationsHierarchy");
        console.log(storedData);
        if (!storedData) return [];

        const parsedData = JSON.parse(storedData);
        // Si c'est un objet unique, on le met dans un tableau
        return Array.isArray(parsedData) ? parsedData : [parsedData];
    } catch (error) {
        console.error("Erreur lors de la récupération des locations du cache:", error);
        return [];
    }
};


const DynamicPage = () => {
    const [locationsHierarchy, setLocationsHierarchy] = useState(fetchLocationsHierarchy());
    const [selected, setSelected] = useState(null);
    const [locationData, setLocationData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [tab, setTab] = useState("locationInfo");
    const { api } = useAuth();

    const fetchLocationById = async (id) => {
        try {
            setIsLoading(true);
            const response = await api.get(`/api/v1/locations/${id}`);
            const { structure } = response.data;

            // Formatage dynamique des données
            const formattedData = {};

            // Pour chaque section dans la structure (locationInfo, address, etc.)
            Object.entries(structure).forEach(([sectionKey, sectionValue]) => {
                formattedData[sectionKey] = {
                    label: sectionValue.label,
                    columnsSchema: sectionValue.columnsSchema,
                    data: {}
                };

                // Pour chaque colonne dans la section
                sectionValue.columnsSchema.forEach(column => {
                    const apiField = column.apiField;
                    // Utilise directement la valeur stockée dans la structure
                    formattedData[sectionKey].data[apiField] = column.value ?? '';
                });
            });

            console.log('Formatted Data:', formattedData);
            setLocationData(formattedData);
        } catch (error) {
            console.error("Erreur lors de la récupération de la location:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Récupère la structure des données pour la création
    const fetchLocationStructure = async () => {
        try {
            const response = await api.get('/api/v1/locations/structure');
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération de la structure :", error);
            return null;
        }
    };

    const getAllNodeIds = (node) => {
        if (!node || !node.id) return [];
        let ids = [node.id];
        if (node.children?.length > 0) {
            node.children.forEach((child) => {
                ids = ids.concat(getAllNodeIds(child));
            });
        }
        return ids;
    };
    const allNodeIds = locationsHierarchy.length > 0 ? getAllNodeIds(locationsHierarchy) : [];

    const renderTree = (node) => {
        if (!node || !node.id) return null;
        return (
            <TreeItem key={node.id} itemId={String(node.id)} label={node.label}>
                {node.children?.map((child) => renderTree(child))}
            </TreeItem>
        );
    };

    const handleNodeSelect = async (event, itemId) => {
        console.log(itemId);
        setSelected(itemId);

        if (itemId && itemId !== "new") {
            await fetchLocationById(itemId);
        }
    };

    const handleAdd = async () => {
        console.log(selected)
        if(!setSelected) {
            setSelected("new");
        }
        setTab("locationInfo");

        setIsLoading(true);
        const structure = await fetchLocationStructure();
        setIsLoading(false);

        if (structure) {
            // Génère les données vides basées sur la structure
            const formattedData = Object.keys(structure).reduce((acc, key) => {
                acc[key] = {
                    ...structure[key],
                    data: structure[key].columnsSchema.reduce((dataAcc, column) => {
                        dataAcc[column.label] = "";
                        return dataAcc;
                    }, {})
                };
                return acc;
            }, {});

            setLocationData(formattedData);
        } else {
            console.error("Erreur : Impossible de charger la structure des données.");
        }
    };

    const handleInputChange = (section, field, value) => {
        setLocationData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                data: { ...prev[section].data, [field]: value }
            }
        }));
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);

            console.log(selected)
            const locationPayload = {
                label: locationData.locationInfo.data.Nom,
                typeId: locationData.locationInfo.data.Type,
                parentId: selected === "new" ? null : selected,
               // address: locationData.address.data.Adresse,
                //city: locationData.address.data.Ville
            };

            await api.post('/api/v1/locations', locationPayload);

            console.log("Données enregistrées :", locationData);

            setSelected(null);
            setLocationData({});
            const updatedHierarchy = await api.get('/api/v1/locations/tree');
            setLocationsHierarchy(updatedHierarchy.data);
            localStorage.setItem("locationsHierarchy", JSON.stringify(updatedHierarchy.data));
        } catch (error) {
            console.error("Erreur lors de l'enregistrement :", error);
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = () => {
        if (!locationData) return false;
        return Object.values(locationData).every(section =>
            section.columnsSchema.every(column =>
                !column.required || (section.data && section.data[column.label])
            )
        );
    };

    return (
        <div className="flex flex-col items-center space-y-6 mt-6">
            <Card className="w-[500px] p-4">
                <h2 className="text-lg font-semibold">Sélectionner une location</h2>

                {locationsHierarchy.length === 0 ? (
                    <div className="text-gray-500 text-center">Aucune location disponible</div>
                ) : (
                    <SimpleTreeView defaultExpandedItems={allNodeIds} onItemClick={handleNodeSelect} multiSelect={false}>
                        {locationsHierarchy.map(renderTree)}
                    </SimpleTreeView>
                )}

                <div className="mt-4 flex justify-center gap-4">
                    <Button onClick={handleAdd}>Ajouter</Button>
                    <Button variant="destructive" disabled={!selected || selected === "new"}>Supprimer</Button>
                </div>
            </Card>

            {isLoading && (
                <div className="flex justify-center items-center h-32">
                    <Spinner size={48} className="text-black dark:text-white" />
                </div>
            )}

            {!isLoading && selected && locationData && (
                <Card className="w-[800px] p-6">
                    <Tabs value={tab} onValueChange={setTab} className="w-full">
                        <TabsList className="flex justify-start mb-4 border-b">
                            {Object.keys(locationData).map((key) => (
                                <TabsTrigger key={key} value={key}>
                                    {locationData[key].label}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {Object.keys(locationData).map((key) => (
                            <TabsContent key={key} value={key}>
                                <h3 className="text-lg font-medium mb-4">{locationData[key].label}</h3>
                                <div className="space-y-4">
                                    {locationData[key].columnsSchema.map(({ apiField, name, type, dropdownOptions }) =>
                                        type === "Dropdown" ? (
                                            <div key={apiField}>
                                                <Label>{name}</Label>
                                                <Select
                                                    onValueChange={(value) => handleInputChange(key, apiField, value)}
                                                    value={locationData[key].data[apiField] || ""}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={`Sélectionnez ${name.toLowerCase()}`} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {dropdownOptions.map((option) => (
                                                            <SelectItem key={option} value={option}>
                                                                {option}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        ) : (
                                            <div key={apiField}>
                                                <Label>{name}</Label>
                                                <Input
                                                    value={locationData[key].data[apiField] || ""}
                                                    onChange={(e) => handleInputChange(key, apiField, e.target.value)}
                                                />
                                            </div>
                                        )
                                    )}

                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>

                    <Button className="mt-6 w-full" onClick={handleSave} disabled={!isFormValid()}>Enregistrer</Button>
                </Card>
            )}
        </div>
    );
};

export default DynamicPage;
