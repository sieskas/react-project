import {FaCashRegister, FaChartBar, FaTachometerAlt, FaUserCog} from "react-icons/fa";

export const MENU_ITEMS = [
    {
        label: "Dashboard",
        path: "/",
        icon: FaTachometerAlt,
        role: "ALL",
    },
    {
        label: "TestPage",
        path: "/test",
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
                path: "/report",
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
                path: "/clover",
                role: "ALL"
            }
        ],
    },
    {
        label: "POS",
        path: "/pos",
        icon: FaCashRegister,
        role: "ALL",
    },
    {
        label: "Admin",
        icon: FaUserCog,
        role: "ROLE_ADMIN",
        subMenu: [
            {
                label: "Manage User",
                path: "/admin/manage-user",
                role: "ROLE_ADMIN"
            },
        ],
    },
];
