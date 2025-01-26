import {useAuth} from "@/contexts/AuthContext";

export default function DashboardPage() {
    const { user } = useAuth();
    console.log("User data:", user); // Debug

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p>salut</p>
            {user ? (
                <p className="text-gray-600">
                    Bienvenue, {user.person.firstName} {user.person.lastName} !
                </p>
            ) : (
                <p className="text-red-500">Utilisateur non connecté</p>
            )}
        </div>
    );
}
