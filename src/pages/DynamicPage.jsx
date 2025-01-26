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

// Garder les fonctions de fetch existantes...
const fetchLocationsHierarchy = () => {
    const storedData = localStorage.getItem("locationsHierarchy");
    return storedData ? JSON.parse(storedData) : null;
};

const fetchLocationDataFromServer = (id) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockLocationData = {
                locationInfo: {
                    label: "Informations générales",
                    data: { ID: id, Nom: `Location ${id}`, Type: "Store" },
                    columnsSchema: [
                        { name: "ID", type: "Number", maxLength: 10, required: true },
                        { name: "Nom", type: "String", maxLength: 50, required: true },
                        { name: "Type", type: "Dropdown", required: true, dropdownOptions: ["Chain", "Store", "Region", "District"] }
                    ]
                },
                address: {
                    label: "Adresse",
                    data: { Adresse: `Adresse ${id}`, Ville: "Paris" },
                    columnsSchema: [
                        { name: "Adresse", type: "String", maxLength: 100, required: false },
                        { name: "Ville", type: "Dropdown", required: false, dropdownOptions: ["Paris", "Marseille", "Lyon"] }
                    ]
                }
            };
            resolve(mockLocationData);
        }, 1500);
    });
};

// Structure pour un nouveau formulaire vide
const emptyFormData = {
    locationInfo: {
        label: "Informations générales",
        data: { ID: "", Nom: "", Type: "" },
        columnsSchema: [
            { name: "ID", type: "Number", maxLength: 10, required: true },
            { name: "Nom", type: "String", maxLength: 50, required: true },
            { name: "Type", type: "Dropdown", required: true, dropdownOptions: ["Chain", "Store", "Region", "District"] }
        ]
    },
    address: {
        label: "Adresse",
        data: { Adresse: "", Ville: "" },
        columnsSchema: [
            { name: "Adresse", type: "String", maxLength: 100, required: false },
            { name: "Ville", type: "Dropdown", required: false, dropdownOptions: ["Paris", "Marseille", "Lyon"] }
        ]
    }
};

const DynamicPage = () => {
    const [locationsHierarchy, setLocationsHierarchy] = useState(fetchLocationsHierarchy());
    const [selected, setSelected] = useState(null);
    const [locationData, setLocationData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [tab, setTab] = useState("locationInfo");

    const getAllNodeIds = (node) => {
        let ids = [node.id];
        if (node.children?.length > 0) {
            node.children.forEach((child) => {
                ids = ids.concat(getAllNodeIds(child));
            });
        }
        return ids;
    };
    const allNodeIds = getAllNodeIds(locationsHierarchy);

    const renderTree = (node) => (
        <TreeItem key={node.id} itemId={node.id} label={node.label}>
            {node.children?.map((child) => renderTree(child))}
        </TreeItem>
    );

    const handleNodeSelect = async (event, itemIds) => {
        const selectedId = itemIds.length > 0 ? itemIds[0] : null;
        setSelected(selectedId);

        if (selectedId) {
            setIsLoading(true);
            const data = await fetchLocationDataFromServer(selectedId);
            setLocationData(data);
            setIsLoading(false);
        } else {
            setLocationData({});
        }
    };

    const handleAdd = () => {
        setSelected("new");
        setLocationData(emptyFormData);
        setTab("locationInfo"); // Réinitialiser l'onglet actif
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

    const handleSave = () => {
        console.log("Données enregistrées :", locationData);
    };

    return (
        <div className="flex flex-col items-center space-y-6 mt-6">
            <Card className="w-[500px] p-4">
                <h2 className="text-lg font-semibold">Sélectionner une location</h2>

                <SimpleTreeView defaultExpandedItems={allNodeIds} onItemClick={handleNodeSelect}>
                    {renderTree(locationsHierarchy)}
                </SimpleTreeView>

                <div className="mt-4 flex justify-center gap-4">
                    <Button onClick={handleAdd} disabled={!selected && locationsHierarchy && Object.keys(locationsHierarchy).length > 0}>
                        Ajouter
                    </Button>
                    <Button variant="destructive" disabled={!selected || selected === "new"}>
                        Supprimer
                    </Button>
                </div>

            </Card>

            {isLoading && (
                <div className="flex justify-center items-center h-32">
                    <Spinner size={48} className="text-black dark:text-white" />
                </div>
            )}

            {!isLoading && selected && (
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
                                    {locationData[key].columnsSchema.map(({ name, type, dropdownOptions }) =>
                                        type === "Dropdown" ? (
                                            <div key={name}>
                                                <Label>{name}</Label>
                                                <Select onValueChange={(value) => handleInputChange(key, name, value)} value={locationData[key].data[name] || ""}>
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
                                            <div key={name}>
                                                <Label>{name}</Label>
                                                <Input value={locationData[key].data[name] || ""} onChange={(e) => handleInputChange(key, name, e.target.value)} />
                                            </div>
                                        )
                                    )}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>

                    <Button className="mt-6 w-full" onClick={handleSave} disabled={!locationData.locationInfo.data.ID || !locationData.locationInfo.data.Nom || !locationData.locationInfo.data.Type}>
                        Enregistrer
                    </Button>

                </Card>
            )}
        </div>
    );
};

export default DynamicPage;