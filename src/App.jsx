import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginForm from "@/pages/LoginForm";
import SidebarMenu from "@/components/SidebarMenu";
import DashboardPage from "@/pages/DashboardPage";
import ReportPage from "@/pages/ReportPage";
import ManageUserPage from "@/pages/ManageUserPage";
import PosPage from "@/pages/PosPage";
import CloverPage from "@/pages/CloverPage";

const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="flex h-screen">
                    {/* Sidebar toujours affiché */}
                    <SidebarMenu />
                    <main className="flex-1 p-6 overflow-auto">
                        <Routes>
                            {/* Page de connexion */}
                            <Route path="/login" element={<LoginForm />} />

                            {/* Routes privées accessibles uniquement aux utilisateurs authentifiés */}
                            <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                            <Route path="/report" element={<PrivateRoute><ReportPage /></PrivateRoute>} />
                            <Route path="/test" element={<PrivateRoute><ReportPage /></PrivateRoute>} />
                            <Route path="/clover" element={<PrivateRoute><CloverPage /></PrivateRoute>} />
                            <Route path="/pos" element={<PrivateRoute><PosPage /></PrivateRoute>} />
                            <Route path="/admin/manage-user" element={<PrivateRoute><ManageUserPage /></PrivateRoute>} />

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
            </AuthProvider>
        </Router>
    );
}

export default App;
