import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";

type OrderItemFromAPI = {
    id: string;
    name: string;
    storeId: string;
    price: number;
    image?: string;
};

type OrderFromApi = {
    id: string;
    createdAt: string;    // ISO string stored in DynamoDB
    status: string;       // "PAID", "REFUNDED", etc.
    items: OrderItemFromAPI[];
}

type BoughtItem = {
    orderId: string;
    orderDate: string;
    orderStatus: string;
    id: string;
    name: string;
    storeId: string;
    price: number;
    image?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function BoughtItemsPage() {
    const { token } = useAuth();

    const [items, setItems] = useState<BoughtItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBoughtItems = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch(`${API_BASE_URL}/orders`, {
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                if (!res.ok) {
                    const text = await res.text();
                    console.error("Failed to fetch orders:", text);
                    setError("Failed to load bought items.");
                    setItems([]);
                    return;
                }

                const data = await res.json();
                const orders: OrderFromApi[] = data.orders ?? [];

                const flattened: BoughtItem[] = orders.flatMap((order) =>
                    order.items.map((item) => ({
                        orderId: order.id,
                        orderDate: order.createdAt,
                        orderStatus: order.status,
                        id: item.id,
                        name: item.name,
                        storeId: item.storeId,
                        price: item.price,
                        image: item.image,
                    }))
                );

                setItems(flattened);
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError("An error occurred while loading bought items.");
                setItems([]);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchBoughtItems();
        }

    }, [token]);


    const handleReviewClick = (item: BoughtItem) => {
        navigate(`/product/${item.id}/review`, {
            state: { storeId: item.storeId },
        });
    }

    if (loading) {
        return <div className="p-8">Loading bought items...</div>;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-semibold mb-4">Purchase history</h1>
            <p className="text-gray-600 mb-6">
                Here you can see all the services you have bought.
            </p>

            {error && (
                <p className="mb-4 text-sm text-red-500">{error}</p>
            )}

            {items.length === 0 ? (
                <p>You have not bought any items yet.</p>
            ) : (
                <div className="space-y-4">
                    {items.map((item) => (
                        <div
                            key={`${item.orderId}-${item.id}`}
                            className="rounded-xl border bg-white p-4 flex justify-between gap-4 items-center"
                        >
                            {/* Left section: image + basic info */}
                            <div className="flex items-center gap-4">
                                {item.image && (
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-16 w-16 rounded-lg object-cover border"
                                    />
                                )}

                                <div className="space-y-1">
                                    <div className="font-medium text-charcoal">{item.name}</div>
                                    <div className="text-xs text-slate-500">
                                        Ordered on{" "}
                                        {new Date(item.orderDate).toLocaleDateString()} · Order #
                                        {item.orderId}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        Status: {item.orderStatus}
                                    </div>
                                </div>
                            </div>

                            {/* Right section: price + review button */}
                            <div className="flex flex-col items-end gap-2">
                                <div className="text-sm font-semibold text-charcoal">
                                    {/* adjust currency logic as needed */}
                                    ${item.price.toLocaleString()}
                                </div>

                                <button
                                    className="px-4 py-2 text-sm rounded-full border hover:bg-gray-50"
                                    onClick={() => handleReviewClick(item)}
                                >
                                    Write review
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}
