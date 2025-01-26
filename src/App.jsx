import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginForm from "@/pages/LoginForm";
import SidebarMenu from "@/components/SidebarMenu";
import NotFoundPage from "@/pages/NotFoundPage"; // Import de la page 404
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

            // Ajouter la route principale si elle a un `component`, sinon 404
            if (item.path) {
                routes.push({
                    path: item.path,
                    component: item.component || NotFoundPage, // Générer 404 si `component` est absent
                    role: item.role,
                });
            }

            // Ajouter les sous-menus s'ils ont un `component`, sinon 404
            if (item.subMenu) {
                routes.push(
                    ...item.subMenu.map(sub => ({
                        path: sub.path,
                        component: sub.component || NotFoundPage, // Générer 404 si `component` est absent
                        role: sub.role,
                    }))
                );
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

                            {/* Génération dynamique des routes avec fallback 404 */}
                            {getRoutes().map(({ path, component: Component, role }) => (
                                <Route
                                    key={path}
                                    path={path}
                                    element={role === "ALL" ? <Component /> : <PrivateRoute><Component /></PrivateRoute>}
                                />
                            ))}

                            {/* Route 404 */}
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </main>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
