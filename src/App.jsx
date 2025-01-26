import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import SidebarMenu from "@/components/SidebarMenu";
import AppRoutes from "@/routes/AppRoutes"; // Import du composant de routes

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="flex h-screen">
                    <SidebarMenu />
                    <main className="flex-1 p-6 overflow-auto">
                        <AppRoutes /> {/* Intégration du composant des routes */}
                    </main>
                </div>
            </AuthProvider>
        </Router>
    );
}
