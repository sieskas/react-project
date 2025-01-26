import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";

const DialogForm = ({
                        open,
                        setOpen,
                        data,
                        onSave,
                        editingItem,
                        setEditingItem,
                        idField
                    }) => {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!data?.columns) return;

        setFormData(editingItem || data.columns.reduce((acc, col) => {
            acc[col.name] = "";
            return acc;
        }, {}));

        setErrors({});
    }, [editingItem, data?.columns]);

    const handleInputChange = (field, value, type, maxLength, required) => {
        let newValue = type === "Number" ? (isNaN(parseInt(value, 10)) ? "" : parseInt(value, 10)) : value;

        setErrors(prev => ({
            ...prev,
            [field]: required && !newValue ? "Ce champ est obligatoire" : null
        }));

        setFormData(prev => ({
            ...prev,
            [field]: newValue
        }));
    };

    const handleSubmit = () => {
        let validationErrors = {};

        data.columns.forEach(({ name, type, required }) => {
            const value = formData[name];
            if (required && (!value || (type === "Number" && isNaN(value)))) {
                validationErrors[name] = "Ce champ est obligatoire";
            }
        });

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            onSave(formData, Boolean(editingItem));
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{editingItem ? "Modifier l'élément" : "Ajouter un élément"}</DialogTitle>
                    <DialogDescription>
                        {editingItem
                            ? "Modifiez les informations ci-dessous puis cliquez sur Enregistrer"
                            : "Remplissez les informations ci-dessous puis cliquez sur Ajouter"}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {data?.columns?.length > 0 ? (
                        data.columns
                            .filter(col => col?.name && col.name !== idField)
                            .map(({ name, type, maxLength, required }) => (
                                <div key={name} className="space-y-1">
                                    <label className="text-sm font-medium">
                                        {name} {required && <span className="text-red-500">*</span>}
                                    </label>
                                    <Input
                                        type={type === "Number" ? "number" : "text"}
                                        value={formData[name] || ""}
                                        onChange={(e) => handleInputChange(name, e.target.value, type, maxLength, required)}
                                        placeholder={`Entrez ${name.toLowerCase()}`}
                                        className={`w-full ${errors[name] ? "border-red-500" : ""}`}
                                    />
                                    {maxLength && formData[name]?.toString().length > maxLength && (
                                        <p className="text-xs text-red-500">
                                            Limite: {maxLength} caractères
                                        </p>
                                    )}
                                    {errors[name] && <p className="text-red-500 text-sm">{errors[name]}</p>}
                                </div>
                            ))
                    ) : (
                        <p className="text-red-500">Erreur : Les colonnes ne sont pas définies</p>
                    )}
                </div>
                <DialogFooter className="flex gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                    <Button onClick={handleSubmit}>
                        {editingItem ? "Enregistrer" : "Ajouter"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DialogForm;