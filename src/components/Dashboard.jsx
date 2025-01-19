import { Routes, Route } from "react-router-dom";
import SidebarMenu from "@/components/SidebarMenu.jsx";
import ReportPage from "@/pages/ReportPage.jsx";
import ManageUserPage from "@/pages/ManageUserPage.jsx";
import { useAuth } from "@/contexts/AuthContext.jsx";
import LoginForm from "@/pages/LoginForm.jsx";
import DashboardPage from "@/pages/DashboardPage.jsx";

export default function Dashboard() {
    const { user } = useAuth();

    if (!user) {
        return <LoginForm />;
    }

    return (
        <div className="flex">
            <SidebarMenu />
            <div className="flex-1 p-6">
                <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/report" element={<ReportPage />} />
                    {user.role === "ROLE_ADMIN" && <Route path="/admin/manage-user" element={<ManageUserPage />} />}
                </Routes>
            </div>
        </div>
    );
}
