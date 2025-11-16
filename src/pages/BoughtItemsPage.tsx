import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type BoughtItem = {
    id: string;
    name: string;
    description?: string;
    price?: number;
    image?: string;
    averageRating?: number;
    // reviews: unknown[]; // will be defined later based on backend
};

export default function BoughtItemsPage() {
    const [items, setItems] = useState<BoughtItem[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // TODO: Replace this dummy data with a real API call
        // all bought items for the currently authenticated user.
        const dummy: BoughtItem[] = [
            { id: "1", name: "Example service A" },
            { id: "2", name: "Example service B" },
        ];
        setItems(dummy);
        setLoading(false);
    }, []);

    const handleReviewClick = (itemId: string) => {
        navigate(`/product/${itemId}/review`);
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

            {items.length === 0 ? (
                <p>You have not bought any items yet.</p>
            ) : (
                <div className="space-y-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="rounded-xl border bg-white p-4 flex justify-between items-center"
                        >
                            <div>
                                <div className="font-medium">{item.name}</div>
                                {item.description && (
                                    <div className="text-sm text-gray-500">
                                        {item.description}
                                    </div>
                                )}
                            </div>

                            {/* Review button for each bought item */}
                            <button
                                className="px-4 py-2 text-sm rounded-full border hover:bg-gray-50"
                                onClick={() => handleReviewClick(item.id)}
                            >
                                Write review
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
