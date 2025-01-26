import { useState, useEffect } from "react";
import { FaEdit, FaSave } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

export default function DynamicPage() {
    const [fields, setFields] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [newField, setNewField] = useState({
        id: "",
        label: { en: "", fr: "", es: "" },
        type: "text",
    });

    // Ouvre le panneau et prépare l'édition si nécessaire
    const openEditPanel = (index = null) => {
        if (index !== null) {
            setIsEditing(true);
            setEditIndex(index);
            // Clone de l'objet pour éviter une mutation directe
            setNewField({ ...fields[index], label: { ...fields[index].label } });
        } else {
            setIsEditing(false);
            setNewField({ id: "", label: { en: "", fr: "", es: "" }, type: "text" });
        }
        setIsSheetOpen(true);
    };

    // Met à jour `newField` lorsqu'on édite un champ
    useEffect(() => {
        if (isEditing && editIndex !== null) {
            setNewField({ ...fields[editIndex], label: { ...fields[editIndex].label } });
        }
    }, [editIndex]);

    // Mise à jour des valeurs du formulaire
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith("label")) {
            const lang = name.split(".")[1];
            setNewField((prev) => ({
                ...prev,
                label: { ...prev.label, [lang]: value },
            }));
        } else {
            setNewField((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Sauvegarde ou mise à jour du champ
    const handleSaveField = () => {
        let updatedFields;
        if (isEditing) {
            updatedFields = [...fields];
            updatedFields[editIndex] = { ...newField, label: { ...newField.label } };
        } else {
            updatedFields = [...fields, { ...newField, label: { ...newField.label } }];
        }
        setFields(updatedFields);
        setNewField({ id: "", label: { en: "", fr: "", es: "" }, type: "text" });
        setIsEditing(false);
        setIsSheetOpen(false);
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6 relative">
            {/* Boutons en haut à droite */}
            <div className="absolute top-4 right-4 flex space-x-2">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" onClick={() => openEditPanel()}>
                            <FaEdit className="text-gray-600 text-lg" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                        <h2 className="text-lg font-bold mb-4">{isEditing ? "Modifier un champ" : "Ajouter un champ"}</h2>

                        {/* Formulaire standardisé */}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="id">ID</Label>
                                <Input id="id" name="id" value={newField.id} onChange={handleChange} />
                            </div>

                            <div>
                                <Label htmlFor="label-en">Label (Anglais)</Label>
                                <Input id="label-en" name="label.en" value={newField.label.en} onChange={handleChange} />
                            </div>

                            <div>
                                <Label htmlFor="label-fr">Label (Français)</Label>
                                <Input id="label-fr" name="label.fr" value={newField.label.fr} onChange={handleChange} />
                            </div>

                            <div>
                                <Label htmlFor="label-es">Label (Espagnol)</Label>
                                <Input id="label-es" name="label.es" value={newField.label.es} onChange={handleChange} />
                            </div>

                            <div>
                                <Label htmlFor="type">Type d'input</Label>
                                <select
                                    id="type"
                                    name="type"
                                    value={newField.type}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="text">Texte</option>
                                    <option value="number">Numérique</option>
                                    <option value="textarea">Zone de texte</option>
                                </select>
                            </div>
                        </div>

                        {/* Boutons */}
                        <div className="flex justify-end space-x-2 mt-4">
                            <Button variant="outline" onClick={() => setIsSheetOpen(false)}>Annuler</Button>
                            <Button onClick={handleSaveField}>{isEditing ? "Mettre à jour" : "Sauvegarder"}</Button>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Bouton pour sauvegarder le formulaire (backend plus tard) */}
                <Button variant="default">
                    <FaSave className="mr-2" /> Sauvegarder
                </Button>
            </div>

            {/* Titre du formulaire */}
            <h1 className="text-2xl font-bold">Formulaire dynamique</h1>
            <p className="text-gray-600">Ajoutez et modifiez des champs dynamiques.</p>

            {/* Formulaire principal */}
            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={index} className="flex items-center space-x-4">
                        <div className="flex-1">
                            <Label className="text-sm font-semibold">
                                {field.label.fr || field.label.en || field.label.es}
                            </Label>
                            {field.type === "textarea" ? (
                                <Textarea placeholder={field.label.en} className="w-full" />
                            ) : (
                                <Input type={field.type} placeholder={field.label.en} className="w-full" />
                            )}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => openEditPanel(index)}>
                            <FaEdit className="text-gray-500" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
