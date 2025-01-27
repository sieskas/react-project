import React, { useState, useMemo, useCallback, useEffect } from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronRight, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

const NestedSearchDropdown = ({ data }) => {
    // Convert data to array and check if it's empty
    const dataArray = useMemo(() => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        return typeof data === 'object' && '0' in data ? Object.values(data) : [];
    }, [data]);

    const isEmptyData = useMemo(() => {
        return !dataArray || dataArray.length === 0;
    }, [dataArray]);

    // States
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedItems, setExpandedItems] = useState(new Set());
    const [selectedId, setSelectedId] = useState(null);

    // Load selected id from cache and validate it
    useEffect(() => {
        const cachedId = localStorage.getItem('selectedLocationId');

        // Fonction pour vérifier si un ID existe dans l'arbre des données
        const checkIdExists = (items, targetId) => {
            for (const item of items) {
                if (item.id === Number(targetId)) return true;
                if (item.children?.length) {
                    const found = checkIdExists(item.children, targetId);
                    if (found) return true;
                }
            }
            return false;
        };

        if (cachedId && !isEmptyData && dataArray.length > 0) {
            // Vérifier si l'ID en cache existe dans les données actuelles
            const idExists = checkIdExists(dataArray, cachedId);
            if (idExists) {
                setSelectedId(Number(cachedId));
            } else {
                // Si l'ID en cache n'est pas valide, sélectionner le premier item
                const firstLocation = dataArray[0];
                if (firstLocation.children?.length > 0) {
                    setSelectedId(firstLocation.children[0].id);
                    localStorage.setItem('selectedLocationId', firstLocation.children[0].id.toString());
                } else {
                    setSelectedId(firstLocation.id);
                    localStorage.setItem('selectedLocationId', firstLocation.id.toString());
                }
            }
        } else if (!isEmptyData && dataArray.length > 0) {
            // Pas d'ID en cache, sélectionner le premier item
            const firstLocation = dataArray[0];
            if (firstLocation.children?.length > 0) {
                setSelectedId(firstLocation.children[0].id);
                localStorage.setItem('selectedLocationId', firstLocation.children[0].id.toString());
            } else {
                setSelectedId(firstLocation.id);
                localStorage.setItem('selectedLocationId', firstLocation.id.toString());
            }
        }
    }, [dataArray, isEmptyData]);

    // Search functionality
    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) {
            return { matches: new Set(), exactMatches: new Set() };
        }

        const matches = new Set();
        const exactMatches = new Set();
        const term = searchTerm.toLowerCase().trim();

        const searchRecursive = (item, parents = []) => {
            if (!item?.label) return;

            const currentPath = [...parents, item];
            const itemLabelLower = item.label.toLowerCase();

            if (itemLabelLower.includes(term)) {
                currentPath.forEach(pathItem => {
                    if (pathItem?.id !== undefined) matches.add(pathItem.id);
                });
                if (item.id !== undefined) exactMatches.add(item.id);
            }

            item.children?.forEach?.(child => searchRecursive(child, currentPath));
        };

        dataArray.forEach(item => searchRecursive(item));
        return { matches, exactMatches };
    }, [searchTerm, dataArray]);

    const toggleExpand = useCallback((id, e) => {
        e.stopPropagation();
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            newSet.has(id) ? newSet.delete(id) : newSet.add(id);
            return newSet;
        });
    }, []);

    const handleSelect = useCallback((id) => {
        setSelectedId(id);
        localStorage.setItem('selectedLocationId', id.toString());
        setOpen(false);
    }, []);

    const getSelectedItemName = useCallback(() => {
        const findItem = (items) => {
            for (const item of items) {
                if (item?.id === selectedId) return item.label;
                if (item?.children) {
                    const found = findItem(item.children);
                    if (found) return found;
                }
            }
            return null;
        };
        return findItem(dataArray) || "";
    }, [selectedId, dataArray]);

    const getButtonText = () => {
        if (isEmptyData) return "Aucune location";
        if (selectedId) return getSelectedItemName();
        return "Sélectionner une Location...";
    };

    const TreeItem = useCallback(({ item, depth = 0 }) => {
        if (!item?.id) return null;

        const hasChildren = item.children?.length > 0;
        const isExpanded = expandedItems.has(item.id);
        const isSelected = selectedId === item.id;
        const isMatch = searchResults.matches.has(item.id);
        const isExactMatch = searchResults.exactMatches.has(item.id);

        if (searchTerm && !isMatch) return null;

        return (
            <div>
                <div
                    onClick={() => handleSelect(item.id)}
                    className={cn(
                        'flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-sm transition-colors',
                        {
                            'bg-accent': isSelected,
                            'bg-blue-50 hover:bg-blue-100': isExactMatch && !isSelected,
                            'hover:bg-accent hover:text-accent-foreground': !isExactMatch && !isSelected,
                        }
                    )}
                    style={{ paddingLeft: `${(depth * 12) + 8}px` }}
                >
                    {hasChildren && (
                        <button
                            onClick={(e) => toggleExpand(item.id, e)}
                            className="p-1 hover:bg-muted rounded-sm"
                        >
                            {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                        </button>
                    )}
                    <span className={cn(
                        "flex-1 truncate",
                        { "font-medium": isExactMatch }
                    )}>
                        {item.label}
                    </span>
                </div>

                {hasChildren && (isExpanded || isMatch) && (
                    <div>
                        {item.children.map(child => (
                            <TreeItem
                                key={child.id || Math.random()}
                                item={child}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }, [expandedItems, selectedId, searchTerm, searchResults, handleSelect, toggleExpand]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-64 justify-between"
                    disabled={isEmptyData}
                >
                    <span className="truncate">
                        {getButtonText()}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="start">
                <div className="p-2 border-b">
                    <Input
                        placeholder="Rechercher une entité..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-8"
                    />
                </div>
                <ScrollArea className="h-72">
                    <div className="p-2">
                        {dataArray.map(item => (
                            <TreeItem
                                key={item.id || Math.random()}
                                item={item}
                            />
                        ))}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};

export default NestedSearchDropdown;