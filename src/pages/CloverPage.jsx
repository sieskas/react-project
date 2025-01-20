import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const CloverPage = () => {
    const [merchantId, setMerchantId] = useState('');
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');

    const fetchOrders = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/v1/clover/orders', {
                params: { merchantId },
                withCredentials: true, // Important pour envoyer les cookies de session
            });
            setOrders(response.data.elements || []);
            setError('');
        } catch (err) {
            setError('Erreur lors de la récupération des commandes.');
            setOrders([]);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-2xl shadow-lg">
                <CardHeader className="text-center">
                    <h1 className="text-2xl font-semibold">Commandes de janvier 2025</h1>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center space-y-4">
                        <Input
                            type="text"
                            value={merchantId}
                            onChange={(e) => setMerchantId(e.target.value)}
                            placeholder="Entrez le Merchant ID"
                            className="w-full"
                        />
                        <Button onClick={fetchOrders}>Récupérer les commandes</Button>
                        {error && <p className="text-red-500">{error}</p>}
                    </div>
                    {orders.length > 0 && (
                        <Table className="mt-6">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID de la commande</TableHead>
                                    <TableHead>Date de création</TableHead>
                                    <TableHead>Montant total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.id}</TableCell>
                                        <TableCell>{new Date(order.createdTime).toLocaleDateString()}</TableCell>
                                        <TableCell>{(order.total / 100).toFixed(2)} €</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default CloverPage;
