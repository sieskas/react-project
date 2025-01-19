// menuConfig.js
import { FaTachometerAlt, FaChartBar, FaUserCog } from "react-icons/fa";

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
        label: "Admin",
        icon: FaUserCog,
        role: "ROLE_ADMIN",
        subMenu: [
            {
                label: "Manage User",
                path: "/dashboard/admin/manage-user",
                role: "ROLE_ADMIN"
            }
        ],
    }
];