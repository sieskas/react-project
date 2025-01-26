import {FaTachometerAlt, FaChartBar, FaUserCog, FaCashRegister} from "react-icons/fa";
import DashboardPage from "@/pages/DashboardPage";
import ReportPage from "@/pages/ReportPage";
import ManageUserPage from "@/pages/ManageUserPage";
import PosPage from "@/pages/PosPage";
import CloverPage from "@/pages/CloverPage";
import DynamicPage from "@/pages/DynamicPage";

export const MENU_ITEMS = [
    {
        label: "Dashboard",
        path: "/dashboard",
        icon: FaTachometerAlt,
        role: "ALL",
        component: DashboardPage,
    },
    {
        label: "TestPage",
        path: "/test",
        icon: FaTachometerAlt,
        role: "ALL",
        component: DynamicPage,
    },
    {
        label: "Analyse",
        icon: FaChartBar,
        role: "ALL",
        subMenu: [
            {
                label: "Report",
                path: "/report",
                role: "ALL",
                component: ReportPage,
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
                role: "ALL",
                component: CloverPage,
            }
        ],
    },
    {
        label: "POS",
        path: "/pos",
        icon: FaCashRegister,
        role: "ALL",
        component: PosPage,
    },
    {
        label: "Admin",
        icon: FaUserCog,
        role: "ROLE_ADMIN",
        subMenu: [
            {
                label: "Manage User",
                path: "/admin/manage-user",
                role: "ROLE_ADMIN",
                component: ManageUserPage,
            },
        ],
    },
];
