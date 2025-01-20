import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PosPage() {
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        window.addEventListener("message", messageHandler, false);
        return () => {
            window.removeEventListener("message", messageHandler, false);
        };
    }, []);

    function messageHandler(event) {
        if (event.origin !== "http://localhost:8080") {
            console.warn("Message ignoré, origine inattendue:", event.origin);
            return;
        }

        if (event.data && event.data.status === "success") {
            console.log("Token Clover reçu:", event.data.data);
            const tokenData = event.data.data;

            localStorage.setItem("clover_token", tokenData.access_token || "");
            if (tokenData.merchant_id) {
                localStorage.setItem("merchant_id", tokenData.merchant_id);
            }

            setIsConnecting(false);
        }
    }

    function handleConnect() {
        setIsConnecting(true);

        const width = 600;
        const height = 700;
        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;

        window.open(
            "http://localhost:8080/api/v1/clover/connect",
            "CloverAuthPopup",
            `width=${width},height=${height},left=${left},top=${top}`
        );
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <Card className="w-[400px] shadow-lg p-6">
                <CardHeader className="text-center">
                    <h1 className="text-2xl font-semibold">POS - Intégration Clover</h1>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-gray-600">
                        Connectez votre système de point de vente avec Clover pour synchroniser les données de vente.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button onClick={handleConnect} disabled={isConnecting}>
                        {isConnecting ? "Connexion en cours..." : "Connecter à Clover"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
