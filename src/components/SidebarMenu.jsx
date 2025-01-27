import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { FaSignOutAlt, FaBars } from "react-icons/fa";
import { MENU_ITEMS } from "/src/config/menuConfig";
import NestedSearchDropdown from "@/components/NestedSearchDropdown.jsx";

export default function SidebarMenu() {
    const { user, logout, api } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadLocationsFromCache = () => {
            try {
                const cachedLocations = localStorage.getItem('locationsHierarchy');
                if (cachedLocations) {
                    const parsedLocations = JSON.parse(cachedLocations);
                    // Vérifier si parsedLocations est vide ou null
                    if (!parsedLocations) {
                        setLocations([]);
                        return;
                    }
                    // Si c'est un objet unique, le mettre dans un tableau
                    // seulement s'il n'est pas vide
                    if (!Array.isArray(parsedLocations) && Object.keys(parsedLocations).length > 0) {
                        setLocations([parsedLocations]);
                    } else if (Array.isArray(parsedLocations)) {
                        // Si c'est un tableau, le garder tel quel
                        setLocations(parsedLocations);
                    } else {
                        // Si c'est un objet vide ou autre chose
                        setLocations([]);
                    }
                } else {
                    setError("Aucune donnée en cache");
                    setLocations([]); // Initialiser avec un tableau vide
                }
            } catch (err) {
                setError("Erreur lors du chargement des locations depuis le cache");
                console.error("Erreur:", err);
                setLocations([]); // En cas d'erreur, initialiser avec un tableau vide
            } finally {
                setIsLoading(false);
            }
        };

        // Chargement initial
        loadLocationsFromCache();

        // Callback qui réactualise quand l'événement est dispatché
        const handleLocationsUpdated = () => {
            loadLocationsFromCache();
        };

        // On écoute l'événement
        window.addEventListener("locations-updated", handleLocationsUpdated);

        // Nettoyage
        return () => {
            window.removeEventListener("locations-updated", handleLocationsUpdated);
        };
    }, []);

    if (!user) return null;

    return (
        <div className="h-screen flex flex-col bg-white dark:bg-black shadow-sm">
            <div className={`p-4 flex ${collapsed ? "justify-center" : "justify-between"} items-center border-b border-gray-100 dark:border-gray-900`}>
                {!collapsed && <h2 className="font-medium text-gray-800 dark:text-gray-200 transition-all">Menu</h2>}
                <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-900 transition-all">
                    <FaBars className="text-gray-600 dark:text-gray-400 text-lg" />
                </button>
            </div>

            <Sidebar collapsed={collapsed} collapsedWidth="80px" className="h-full border-r border-gray-100 dark:border-gray-900">
                {!collapsed && (
                    isLoading ? (
                        <div className="p-4">Chargement des locations...</div>
                    ) : error ? (
                        <div className="p-4 text-red-500">{error}</div>
                    ) : (
                    <NestedSearchDropdown data={locations} />
                    )
                )}

                <Menu className="p-2">
                    {MENU_ITEMS.map((item, index) => {
                        if (item.role !== "ALL" && !user.roles.includes(item.role)) return null; // ✅ Vérification correcte

                        const Icon = item.icon;

                        return item.subMenu ? (
                            <SubMenu key={index} label={item.label} icon={<Icon />} className="mb-1 rounded-lg text-gray-700 dark:text-gray-300">
                                {item.subMenu.map((sub, subIndex) => (
                                    <MenuItem key={subIndex} component={<Link to={sub.path} />} className="text-gray-600 dark:text-gray-400">
                                        {sub.label}
                                    </MenuItem>
                                ))}
                            </SubMenu>
                        ) : (
                            <MenuItem key={index} icon={<Icon />} component={<Link to={item.path} />} className="mb-1 rounded-lg text-gray-700 dark:text-gray-300">
                                {item.label}
                            </MenuItem>
                        );
                    })}
                </Menu>

                <div className="absolute bottom-4 w-full px-4">
                    <Button onClick={logout} className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 p-2 rounded-lg transition-all">
                        <FaSignOutAlt className="text-gray-500 dark:text-gray-400" />
                        {!collapsed && <span>Déconnexion</span>}
                    </Button>
                </div>
            </Sidebar>
        </div>
    );
}