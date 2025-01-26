import { useAuth } from "@/contexts/AuthContext";
import NestedSearchDropdown from "@/components/NestedSearchDropdown.jsx";

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-600">Bienvenue, {user.person.firstName} {user.person.lastName} !</p>
        </div>
    );
}
