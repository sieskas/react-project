import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginForm from "@/pages/LoginForm";
import SidebarMenu from "@/components/SidebarMenu";
import { MENU_ITEMS } from "@/config/menuConfig";

const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
};

function App() {
    // Fonction pour extraire toutes les routes depuis le menu (y compris subMenu)
    const getRoutes = () => {
        return MENU_ITEMS.flatMap(item => {
            const routes = [];

            // Ajouter la route principale si elle a un `component`
            if (item.component) {
                routes.push({ path: item.path, component: item.component, role: item.role });
            }

            // Ajouter les sous-menus s'ils ont un `component`
            if (item.subMenu) {
                routes.push(...item.subMenu.filter(sub => sub.component).map(sub => ({
                    path: sub.path,
                    component: sub.component,
                    role: sub.role,
                })));
            }

            return routes;
        });
    };

    return (
        <Router>
            <AuthProvider>
                <div className="flex h-screen">
                    <SidebarMenu />
                    <main className="flex-1 p-6 overflow-auto">
                        <Routes>
                            {/* Route de connexion */}
                            <Route path="/login" element={<LoginForm />} />

                            {/* Génération dynamique des routes */}
                            {getRoutes().map(({ path, component: Component, role }) => (
                                <Route
                                    key={path}
                                    path={path}
                                    element={role === "ALL" ? <Component /> : <PrivateRoute><Component /></PrivateRoute>}
                                />
                            ))}

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
