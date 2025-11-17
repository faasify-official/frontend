import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";

type OrderFromAPI = {
    id: string;
    createdAt: string;
    status: string;
    items: {
        itemId: string;
        name: string;
        image?: string;
        description?: string;
        price: number;
        storeId: string;
    }[];
};

type BoughtItem = {
    orderId: string;
    productId: string;
    storeId: string;
    name: string;
    image?: string;
    description?: string;
    price: number;
    orderDate: string;
    orderStatus: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function BoughtItemsPage() {
    const { token } = useAuth();

    const [items, setItems] = useState<BoughtItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Helper to convert "orders with items" -> flat list
    function flattenOrders(orders: OrderFromAPI[]): BoughtItem[] {
        return orders.flatMap((order) =>
            order.items.map((item) => ({
                orderId: order.id,
                productId: item.itemId,
                storeId: item.storeId,
                name: item.name,
                image: item.image,
                description: item.description,
                price: item.price,
                orderDate: order.createdAt,
                orderStatus: order.status,
            }))
        );
    }

    useEffect(() => {
        async function fetchBoughtItems() {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch(`${API_BASE_URL}/orders`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    credentials: "include",
                });

                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    console.error("Failed to fetch orders:", body);
                    throw new Error(body.message || "Failed to load bought items.");
                }

                const data = await res.json();
                const orders: OrderFromAPI[] = data.orders ?? [];

                const flattened = flattenOrders(orders);
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
        } else {
            setLoading(false);
            setItems([]);
        }

    }, [token]);


    const handleReviewClick = (item: BoughtItem) => {
        if (!item.productId) {
            console.error('Bought item is missing productId', item)
            alert("This item cannot be reviewed because product info is missing.");
            return
        }


        navigate(
            `/product/${item.productId}/review?orderId=${encodeURIComponent(item.orderId)}`
        );
    };

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
                            key={`${item.orderId}-${item.productId}`}
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
