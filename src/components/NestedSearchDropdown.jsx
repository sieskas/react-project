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

const NestedSearchDropdown = () => {
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [expandedItems, setExpandedItems] = useState(new Set())
    const [selectedId, setSelectedId] = useState(null)
    const [exactMatches, setExactMatches] = useState(new Set())

    // Données d'exemple
    const sampleData = [
        {
            id: 1,
            name: 'Parent 1',
            children: [
                {
                    id: 2,
                    name: 'Niveau 1.1',
                    children: [
                        {
                            id: 3,
                            name: 'Niveau 2.1',
                            children: [
                                {
                                    id: 4,
                                    name: 'Niveau 3.1',
                                    children: [
                                        { id: 5, name: 'Niveau 4.1' },
                                        { id: 6, name: 'Niveau 4.2' }
                                    ]
                                }
                            ]
                        },
                        { id: 7, name: 'Niveau 2.2' }
                    ]
                },
                {
                    id: 8,
                    name: 'Niveau 1.2',
                    children: [
                        { id: 9, name: 'Niveau 2.3' }
                    ]
                }
            ]
        },
        {
            id: 10,
            name: 'Parent 2',
            children: [
                {
                    id: 11,
                    name: 'Niveau 1.3',
                    children: [
                        { id: 12, name: 'Niveau 2.4' }
                    ]
                }
            ]
        }
    ]

    // Fonction récursive pour la recherche
    const searchTree = useCallback((items, term) => {
        const results = new Set()
        const exactMatches = new Set()
        const parentMap = new Map()

        const searchRecursive = (item, parents = []) => {
            const currentPath = [...parents, item]
            const itemNameLower = item.name.toLowerCase()
            const searchTermLower = term.toLowerCase()

            // Vérifie si l'item correspond exactement à la recherche
            if (itemNameLower.includes(searchTermLower)) {
                currentPath.forEach(pathItem => {
                    results.add(pathItem.id)
                    parentMap.set(pathItem.id, currentPath)
                })

                // Si c'est une correspondance exacte
                if (itemNameLower.includes(searchTermLower)) {
                    exactMatches.add(item.id)
                }
            }

            // Recherche récursive dans les enfants
            if (item.children?.length > 0) {
                item.children.forEach(child => searchRecursive(child, currentPath))
            }
        }

        items.forEach(item => searchRecursive(item))
        return { results, exactMatches, parentMap }
    }, [])

    // Recherche mémorisée
    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) return { results: new Set(), exactMatches: new Set(), parentMap: new Map() }
        return searchTree(sampleData, searchTerm.trim())
    }, [searchTerm, searchTree])

    // Met à jour les items expandés et les matches exacts quand la recherche change
    useEffect(() => {
        if (searchTerm.trim()) {
            setExpandedItems(searchResults.results)
            setExactMatches(searchResults.exactMatches)
        } else {
            setExactMatches(new Set())
        }
    }, [searchTerm, searchResults])

    const toggleExpand = (id, e) => {
        e.stopPropagation()
        setExpandedItems(prev => {
            const newSet = new Set(prev)
            if (newSet.has(id)) {
                newSet.delete(id)
            } else {
                newSet.add(id)
            }
            return newSet
        })
    }

    const handleSelect = (id) => {
        setSelectedId(id)
        setOpen(false)
    }

    const getSelectedItemName = useCallback(() => {
        const findItem = (items) => {
            for (const item of items) {
                if (item.id === selectedId) return item.name
                if (item.children?.length > 0) {
                    const found = findItem(item.children)
                    if (found) return found
                }
            }
            return null
        }
        return findItem(sampleData) || ""
    }, [selectedId])

    const TreeItem = ({ item, depth = 0 }) => {
        const hasChildren = item.children?.length > 0
        const isExpanded = expandedItems.has(item.id)
        const isSelected = selectedId === item.id
        const isExactMatch = exactMatches.has(item.id)

        // Vérifie si l'item doit être affiché selon la recherche
        const showInSearch = !searchTerm.trim() || searchResults.results.has(item.id)

        if (!showInSearch) return null

        return (
            <div>
                <div
                    onClick={() => handleSelect(item.id)}
                    className={cn(
                        'flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-sm transition-colors',
                        {
                            'bg-accent': isSelected,
                            'bg-blue-50 hover:bg-blue-100': isExactMatch && !isSelected,
                            'hover:bg-accent hover:text-accent-foreground': !isExactMatch && !isSelected
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
            {item.name}
          </span>
                </div>

                {hasChildren && isExpanded && (
                    <div>
                        {item.children.map(child => (
                            <TreeItem
                                key={child.id}
                                item={child}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-64 justify-between"
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
                        {sampleData.map(item => (
                            <TreeItem
                                key={item.id}
                                item={item}
                            />
                        ))}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}

export default NestedSearchDropdown