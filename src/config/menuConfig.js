// menuConfig.js
import {FaTachometerAlt, FaChartBar, FaUserCog, FaCashRegister} from "react-icons/fa";

export const MENU_ITEMS = [
    {
        label: "Dashboard",
        path: "/dashboard",
        icon: FaTachometerAlt,
        role: "ALL",
    },
    {
        label: "Analyse",
        icon: FaChartBar,
        role: "ALL",
        subMenu: [
            {
                label: "Report",
                path: "/dashboard/report",
                role: "ALL"
            }
        ],
    },
    {
        label: "Clover",
        icon: FaChartBar,
        role: "ALL",
        subMenu: [
            {
                label: "Report",
                path: "/dashboard/clover",
                role: "ALL"
            }
        ],
    },
    {
        label: "Admin",
        icon: FaUserCog,
        role: "ROLE_ADMIN",
        subMenu: [
            {
                label: "Manage User",
                path: "/dashboard/admin/manage-user",
                role: "ROLE_ADMIN"
            },
        ],
    },
    {
        label: "POS",
        path: "/dashboard/pos",
        icon: FaCashRegister,
        role: "ALL",
    }
];