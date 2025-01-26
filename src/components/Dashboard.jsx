// Dashboard.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import SidebarMenu from "../components/SidebarMenu";
import { useAuth } from "../contexts/AuthContext";
import LoginForm from "../pages/LoginForm";

// Import des pages
import DashboardPage from "../pages/DashboardPage";
import ReportPage from "../pages/ReportPage";
import ManageUserPage from "../pages/ManageUserPage";
import PosPage from "@/pages/PosPage.jsx";
import CloverPage from "@/pages/CloverPage.jsx";

export default function Dashboard() {
    const { user } = useAuth();

    if (!user) {
        return <LoginForm />;
    }

    return (
        <div className="flex h-screen">
            <SidebarMenu />
            <main className="flex-1 p-6 overflow-auto">
                <Routes>
                    <Route index element={<DashboardPage />} />
                    <Route path="report" element={<ReportPage />} />
                    <Route path="clover" element={<CloverPage />} />
                    <Route path="admin/manage-user" element={user.role === "ROLE_ADMIN" ? <ManageUserPage /> : <Navigate to="/404" />} />
                    <Route path="pos" element={<PosPage />} />

                    {/* Route 404 */}
                    <Route path="*" element={
                        <div className="text-center mt-10">
                            <h1 className="text-2xl font-bold text-gray-800">Page Not Found</h1>
                            <p className="text-gray-600 mt-2">The page you're looking for doesn't exist.</p>
                        </div>
                    } />
                </Routes>
            </main>
        </div>
    );
}