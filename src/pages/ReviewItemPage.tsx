// src/pages/ReviewItemPage.tsx
import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ReviewItemPage() {
    const { id } = useParams<{ id: string }>(); // product/listing id
    const navigate = useNavigate();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!id) return;

        if (rating < 1 || rating > 5) {
            // Very simple client-side guard
            alert("Rating must be between 1 and 5.");
            return;
        }

        const payload = {
            itemId: id,
            rating,
            comment,
            // TODO: add userId from AuthContext when backend is ready
        };

        // For now, just log the payload so teammates can see the structure
        console.log("Review payload (frontend only, no API yet):", payload);

        // Later: call POST /reviews then navigate back
        // await fetch(`${API_BASE_URL}/reviews`, { ... })

        navigate("/purchases");
    };


    return (
        <div className="p-8 max-w-xl mx-auto">
            <h1 className="text-3xl font-semibold mb-4">Write a review</h1>
            <p className="text-gray-600 mb-6">
                You are reviewing item with id: <span className="font-mono">{id}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Rating (1-5)
                    </label>
                    <input
                        type="number"
                        min={1}
                        max={5}
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="border rounded-md px-3 py-2 w-24"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Comment
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="border rounded-md px-3 py-2 w-full h-32"
                        placeholder="Share your experience with this service..."
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-full bg-orange-500 text-white text-sm font-medium"
                    >
                        Submit review
                    </button>
                    <button
                        type="button"
                        className="px-4 py-2 rounded-full border text-sm"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
