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
    // Validate and normalize input data
    const normalizedData = useMemo(() => {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return [{
                id: -1,
                label: 'Aucune location',
                children: []
            }];
        }
        return data;
    }, [data]);

    const isEmptyData = useMemo(() =>
            !data || !Array.isArray(data) || data.length === 0,
        [data]);

    // States
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedItems, setExpandedItems] = useState(new Set());
    const [selectedId, setSelectedId] = useState(null);

    // Charger l'ID sélectionné depuis le cache au démarrage
    useEffect(() => {
        const cachedSelectedId = localStorage.getItem('selectedLocationId');
        if (cachedSelectedId) {
            setSelectedId(Number(cachedSelectedId));
        }
    }, []);

    // Vérifier si l'ID existe dans les données
    const checkIfIdExists = useCallback((items, targetId) => {
        for (const item of items) {
            if (item.id === targetId) return true;
            if (Array.isArray(item.children)) {
                const found = checkIfIdExists(item.children, targetId);
                if (found) return true;
            }
        }
        return false;
    }, []);

    // Vérifier si l'ID sauvegardé existe toujours dans les données actuelles
    useEffect(() => {
        if (selectedId && normalizedData.length > 0) {
            const idExists = checkIfIdExists(normalizedData, selectedId);
            if (!idExists) {
                setSelectedId(null);
                localStorage.removeItem('selectedLocationId');
            }
        }
    }, [normalizedData, selectedId, checkIfIdExists]);

    // Set selectedId to -1 when data is empty
    useEffect(() => {
        if (isEmptyData) {
            setSelectedId(-1);
        }
    }, [isEmptyData]);

    // Search functionality
    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) {
            return { matches: new Set(), exactMatches: new Set() };
        }

        const matches = new Set();
        const exactMatches = new Set();
        const term = searchTerm.toLowerCase().trim();

        const searchRecursive = (item, parents = []) => {
            if (!item || typeof item !== 'object') return;

            const currentPath = [...parents, item];
            const itemLabelLower = item.label?.toLowerCase() || '';

            if (itemLabelLower.includes(term)) {
                currentPath.forEach(pathItem => {
                    if (pathItem && pathItem.id !== undefined) {
                        matches.add(pathItem.id);
                    }
                });
                if (item.id !== undefined) {
                    exactMatches.add(item.id);
                }
            }

            if (Array.isArray(item.children)) {
                item.children.forEach(child => searchRecursive(child, currentPath));
            }
        };

        normalizedData.forEach(item => searchRecursive(item));
        return { matches, exactMatches };
    }, [searchTerm, normalizedData]);

    const toggleExpand = useCallback((id, e) => {
        e.stopPropagation();
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
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
                if (!item || typeof item !== 'object') continue;
                if (item.id === selectedId) return item.label;
                if (Array.isArray(item.children)) {
                    const found = findItem(item.children);
                    if (found) return found;
                }
            }
            return null;
        };
        return findItem(normalizedData) || "";
    }, [selectedId, normalizedData]);

    const TreeItem = useCallback(({ item, depth = 0 }) => {
        if (!item || typeof item !== 'object') return null;

        const hasChildren = Array.isArray(item.children) && item.children.length > 0;
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
                            'text-muted-foreground': item.id === -1
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
                        {selectedId ? getSelectedItemName() : "Sélectionner une entité..."}
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
                        {normalizedData.map(item => (
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