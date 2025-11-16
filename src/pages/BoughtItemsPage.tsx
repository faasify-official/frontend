import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import { Package, Calendar, Star, ArrowLeft, CheckCircle } from "lucide-react";

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
                    setError("Failed to load purchase history.");
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
                setError("An error occurred while loading your purchase history.");
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
        navigate(`/product/${item.id}/review?storeId=${item.storeId}`, {
            state: { storeId: item.storeId },
        });
    }

    if (loading) {
        return (
            <section className="space-y-8 max-w-6xl mx-auto px-6 py-8">
                <div className="animate-fade-in-up">
                    <h1 className="text-4xl font-extrabold text-charcoal">Purchase History</h1>
                    <p className="mt-2 text-sm text-slate-500">Loading your orders...</p>
                </div>
                <div className="grid gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className={`animate-stagger-${(i % 6) + 1} card h-24 bg-gradient-to-r from-slate-100 to-slate-200 animate-pulse`} />
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-8 max-w-6xl mx-auto px-6 py-8">
            {/* Header (hero) */}
            <div className="animate-fade-in-up">
                <div className="rounded-xl bg-gradient-to-r from-primary/6 to-transparent p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-extrabold text-charcoal">Purchase History</h1>
                            <p className="mt-2 text-sm text-slate-500">
                                {items.length === 0 
                                    ? "View and manage all your purchases" 
                                    : `You have purchased ${items.length} item${items.length !== 1 ? 's' : ''}`}
                            </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-3">
                            <Link to="/" className="btn-outline px-3 py-2">Continue Shopping</Link>
                            <Link to="/cart" className="btn-primary px-3 py-2">View Cart</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="animate-fade-in rounded-xl bg-red-50 border border-red-200 p-4">
                    <p className="text-sm font-semibold text-red-700">{error}</p>
                </div>
            )}

            {/* Empty State */}
            {items.length === 0 && !error ? (
                <div className="animate-fade-in-up card flex flex-col items-center gap-6 py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                        <Package size={32} className="text-slate-400" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-charcoal">No purchases yet</p>
                        <p className="mt-1 text-sm text-slate-500">Explore our storefronts and make your first purchase!</p>
                    </div>
                    <Link to="/" className="btn-primary flex items-center gap-2">
                        <ArrowLeft size={18} />
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {items.map((item, idx) => (
                        <div
                            key={`${item.orderId}-${item.id}`}
                            className={`animate-stagger-${(idx % 6) + 1} card group hover:shadow-2xl hover:-translate-y-2 transform transition-all duration-300`}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 animate-fade-in-up">
                                {/* Image */}
                                <div className="flex-shrink-0">
                                    <div className="h-20 w-20 rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-full w-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-slate-300">
                                                <Package />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-charcoal group-hover:text-primary transition-colors truncate">
                                        {item.name}
                                    </h3>

                                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            <span>
                                                {new Date(item.orderDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>

                                        <div className="text-xs text-slate-400">Order #{item.orderId.slice(0, 8).toUpperCase()}</div>
                                    </div>

                                    <div className="mt-3 text-xs">
                                        <span className={`inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-semibold border ${
                                            item.orderStatus?.toUpperCase() === 'PAID'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-slate-50 text-slate-700 border-slate-200'
                                        }`}
                                        >
                                            {item.orderStatus?.toUpperCase() === 'PAID' && (
                                                <CheckCircle size={14} className="text-green-600" />
                                            )}
                                            <span className="uppercase">{item.orderStatus}</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Right Section */}
                                <div className="w-full sm:w-40 flex flex-col items-end gap-3">
                                    <div className="text-right">
                                        <div className="text-xs text-slate-500">Total</div>
                                        <div className="text-lg font-bold text-primary">${(item.price / 100).toFixed(2)}</div>
                                    </div>

                                    <button
                                        className="btn-primary text-sm flex items-center justify-center gap-2 animate-button-hover w-full sm:w-auto"
                                        onClick={() => handleReviewClick(item)}
                                    >
                                        <Star size={16} />
                                        Review
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
