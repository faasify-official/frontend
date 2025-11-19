import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import { Package, Calendar, Star, ArrowLeft, CheckCircle, FileText } from "lucide-react";
import { apiGet } from "@utils/api";

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
    hasReview?: boolean;
    userReview?: {
        reviewId: string;
        rating: number;
        comment: string;
        title?: string;
        createdAt: string;
    };
};

type Review = {
    reviewId: string;
    productId: string;
    userId: string;
    rating: number;
    comment: string;
    title?: string;
    createdAt: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function BoughtItemsPage() {
    const { token, user } = useAuth();

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
                
                // Check if user has reviewed each product
                if (user?.userId && flattened.length > 0) {
                    const itemsWithReviews = await Promise.all(
                        flattened.map(async (item) => {
                            try {
                                const reviewsData = await apiGet<{ reviews: Review[] }>(
                                    `/reviews/product/${item.productId}`
                                );
                                const reviews = reviewsData.reviews || [];
                                const userReview = reviews.find((review) => review.userId === user.userId);
                                
                                return {
                                    ...item,
                                    hasReview: !!userReview,
                                    userReview: userReview || undefined,
                                };
                            } catch (err) {
                                console.error(`Error fetching reviews for product ${item.productId}:`, err);
                                return { ...item, hasReview: false };
                            }
                        })
                    );
                    setItems(itemsWithReviews);
                } else {
                    setItems(flattened);
                }

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
        } else {
            setLoading(false);
            setItems([]);
        }

    }, [token, user?.userId]);

    const handleReviewClick = (item: BoughtItem) => {
        if (!item.productId) {
            console.error('Bought item is missing productId', item)
            alert("This item cannot be reviewed because product info is missing.");
            return;
        }

        // If user has already reviewed, navigate to product page to see their review
        if (item.hasReview) {
            navigate(`/product/${item.productId}`);
        } else {
            // Navigate to review page to write a new review
            navigate(
                `/product/${item.productId}/review?orderId=${encodeURIComponent(item.orderId)}`
            );
        }
    };

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
                            key={`${item.orderId}-${item.productId}`}
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
                                        <span className={`inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-semibold border ${item.orderStatus?.toUpperCase() === 'PAID'
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
                                        <div className="text-lg font-bold text-primary">${item.price.toFixed(2)}</div>
                                    </div>

                                    {item.hasReview ? (
                                        <button
                                            className="btn-outline text-sm flex items-center justify-center gap-2 animate-button-hover w-full sm:w-auto"
                                            onClick={() => handleReviewClick(item)}
                                        >
                                            <FileText size={16} />
                                            My Review
                                        </button>
                                    ) : (
                                        <button
                                            className="btn-primary text-sm flex items-center justify-center gap-2 animate-button-hover w-full sm:w-auto"
                                            onClick={() => handleReviewClick(item)}
                                        >
                                            <Star size={16} />
                                            Review
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
