// src/pages/ReviewItemPage.tsx
import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "@context/AuthContext";

export default function ReviewItemPage() {
    const { id } = useParams<{ id: string }>(); // product/listing id
    const navigate = useNavigate();
    const location = useLocation();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const { user, token } = useAuth();
    const { storeId } = (location.state as { storeId?: string }) || {};

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!id) return;

        if (rating < 1 || rating > 5) {
            // Very simple client-side guard
            alert("Rating must be between 1 and 5.");
            return;
        }

        const payload = {
            productId: id,
            rating,
            comment,
            storeId, // TODO: pass this in as a prop or from product context
            // TODO: add userId from AuthContext when backend is ready
        };

        const res = await fetch(`${API_BASE_URL}/reviews`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            // credentials: "include", // so the JWT cookie is sent to backend
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            console.error("Failed to submit review", await res.text());
            alert("Failed to submit review.");
            return;
        }

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
