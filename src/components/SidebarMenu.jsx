import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FaTachometerAlt, FaChartBar, FaUserCog, FaSignOutAlt, FaBars } from "react-icons/fa";

export default function SidebarMenu() {
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    if (!user) return null;

    return (
        <div className="h-screen flex flex-col bg-white dark:bg-black shadow-sm">
            {/* En-tête minimaliste */}
            <div
                className={`p-4 flex ${collapsed ? "justify-center" : "justify-between"} items-center border-b border-gray-100 dark:border-gray-900`}>
                <h2 className={`font-medium text-gray-800 dark:text-gray-200 transition-all duration-200
                    ${collapsed ? "hidden" : "block"}`}>
                    Menu
                </h2>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
                >
                    <FaBars className="text-gray-600 dark:text-gray-400 text-lg"/>
                </button>
            </div>


            <Sidebar
                collapsed={collapsed}
                collapsedWidth="80px"
                className="h-full border-r border-gray-100 dark:border-gray-900"
            >
                <Menu
                    className="p-2"
                    menuItemStyles={{
                        button: {
                            backgroundColor: 'transparent',
                            '&:hover': {
                                backgroundColor: '#f8fafc',
                                dark: {
                                    backgroundColor: '#030712'
                                }
                            },
                        },
                    }}
                >
                    {/* Dashboard */}
                    <MenuItem
                        icon={<FaTachometerAlt className="text-gray-600 dark:text-gray-400"/>}
                        component={<Link to="/dashboard"/>}
                        className="mb-1 rounded-lg text-gray-700 dark:text-gray-300"
                    >
                        Dashboard
                    </MenuItem>

                    {/* Analyse */}
                    <SubMenu
                        label="Analyse"
                        icon={<FaChartBar className="text-gray-600 dark:text-gray-400"/>}
                        className="mb-1 rounded-lg text-gray-700 dark:text-gray-300"
                    >
                        <MenuItem
                            component={<Link to="/report"/>}
                            className="text-gray-600 dark:text-gray-400"
                        >
                            Report
                        </MenuItem>
                    </SubMenu>

                    {/* Admin */}
                    {user.role === "ROLE_ADMIN" && (
                        <SubMenu
                            label="Admin"
                            icon={<FaUserCog className="text-gray-600 dark:text-gray-400"/>}
                            className="mb-1 rounded-lg text-gray-700 dark:text-gray-300"
                        >
                            <MenuItem
                                component={<Link to="/admin/manage-user"/>}
                                className="text-gray-600 dark:text-gray-400"
                            >
                                Manage User
                            </MenuItem>
                        </SubMenu>
                    )}
                </Menu>

                {/* Bouton de déconnexion minimaliste */}
                <div className="absolute bottom-4 w-full px-4">
                    <Button
                        onClick={logout}
                        className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800
                        hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300
                        flex items-center justify-center gap-2 p-2 rounded-lg transition-all"
                    >
                        <FaSignOutAlt className="text-gray-500 dark:text-gray-400"/>
                        {!collapsed && <span>Déconnexion</span>}
                    </Button>
                </div>
            </Sidebar>
        </div>
    );
}