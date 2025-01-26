// DialogForm.jsx
import React, { useState, useEffect, useRef } from "react";
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

// Imports pour Combobox (shadcn/ui)
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover.jsx";

import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command.jsx";

import { ChevronDownIcon } from "lucide-react"; // ou ChevronsUpDownIcon etc.

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
    const [openPopoverFor, setOpenPopoverFor] = useState("");
    // Permet de savoir quel champ Dropdown est ouvert, si nécessaire

    useEffect(() => {
        if (!data?.columns) return;

        setFormData(
            editingItem ||
            data.columns.reduce((acc, col) => {
                acc[col.name] = "";
                return acc;
            }, {})
        );
        setErrors({});
    }, [editingItem, data?.columns]);

    const handleInputChange = (field, value, type, maxLength, required) => {
        let newValue = value;

        if (type === "Number") {
            newValue = isNaN(parseInt(value, 10)) ? "" : parseInt(value, 10);
        }

        setErrors((prev) => ({
            ...prev,
            [field]: required && (!newValue || newValue === "none")
                ? "Ce champ est obligatoire"
                : null
        }));

        setFormData((prev) => ({
            ...prev,
            [field]: newValue
        }));
    };

    const handleSubmit = () => {
        let validationErrors = {};

        data.columns.forEach(({ name, type, required }) => {
            const value = formData[name];
            if (required) {
                // Pour un dropdown, on refuse 'none' comme valeur
                const isEmptyNumber = type === "Number" && isNaN(value);
                const isEmptyOrNone = !value || value === "none";
                if (isEmptyNumber || isEmptyOrNone) {
                    validationErrors[name] = "Ce champ est obligatoire";
                }
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
                    {data?.columns?.length > 0 ? (
                        data.columns
                            .filter((col) => col?.name && col.name !== idField)
                            .map(({ name, type, maxLength, required, dropdownOptions }) => {
                                const value = formData[name] ?? "";
                                const hasError = Boolean(errors[name]);

                                if (type === "Dropdown") {
                                    // On peut insérer "none" si ce n’est pas déjà dans dropdownOptions
                                    const options = dropdownOptions?.includes("none")
                                        ? dropdownOptions
                                        : ["none", ...(dropdownOptions ?? [])];

                                    return (
                                        <div key={name} className="space-y-1">
                                            <label className="text-sm font-medium">
                                                {name} {required && <span className="text-red-500">*</span>}
                                            </label>

                                            <Popover
                                                open={openPopoverFor === name}
                                                onOpenChange={(isOpen) =>
                                                    setOpenPopoverFor(isOpen ? name : "")
                                                }
                                            >
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={`w-full justify-between ${
                                                            hasError ? "border-red-500" : ""
                                                        }`}
                                                    >
                                                        {/*
                              Affiche la valeur choisie, ou un placeholder
                              s’il n’y a pas de valeur (ou si c’est "none")
                            */}
                                                        {value && value !== "none"
                                                            ? value
                                                            : `Choisissez ${name.toLowerCase()}`}
                                                        <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="p-0 w-full">
                                                    <Command>
                                                        <CommandInput placeholder="Tapez pour rechercher..." />
                                                        <CommandList>
                                                            <CommandEmpty>Aucune option trouvée.</CommandEmpty>
                                                            <CommandGroup>
                                                                {options.map((option) => (
                                                                    <CommandItem
                                                                        key={option}
                                                                        onSelect={() => {
                                                                            handleInputChange(
                                                                                name,
                                                                                option,
                                                                                type,
                                                                                maxLength,
                                                                                required
                                                                            );
                                                                            // Fermer la popover
                                                                            setOpenPopoverFor("");
                                                                        }}
                                                                    >
                                                                        {option}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>

                                            {hasError && (
                                                <p className="text-red-500 text-sm">{errors[name]}</p>
                                            )}
                                        </div>
                                    );
                                }

                                // Champ "classique"
                                return (
                                    <div key={name} className="space-y-1">
                                        <label className="text-sm font-medium">
                                            {name} {required && <span className="text-red-500">*</span>}
                                        </label>
                                        <Input
                                            type={type === "Number" ? "number" : "text"}
                                            value={value}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    name,
                                                    e.target.value,
                                                    type,
                                                    maxLength,
                                                    required
                                                )
                                            }
                                            placeholder={`Entrez ${name.toLowerCase()}`}
                                            className={`w-full ${hasError ? "border-red-500" : ""}`}
                                        />
                                        {maxLength && value?.toString().length > maxLength && (
                                            <p className="text-xs text-red-500">
                                                Limite: {maxLength} caractères
                                            </p>
                                        )}
                                        {hasError && (
                                            <p className="text-red-500 text-sm">{errors[name]}</p>
                                        )}
                                    </div>
                                );
                            })
                    ) : (
                        <p className="text-red-500">
                            Erreur : Les colonnes ne sont pas définies
                        </p>
                    )}
                </div>
                <DialogFooter className="flex gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Annuler
                    </Button>
                    <Button onClick={handleSubmit}>
                        {editingItem ? "Enregistrer" : "Ajouter"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DialogForm;
