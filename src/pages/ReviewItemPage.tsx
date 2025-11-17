import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@context/AuthContext";

type ReviewRouteParams = {
    productId: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function ReviewItemPage() {
    const { productId } = useParams<ReviewRouteParams>();
    const [searchParams] = useSearchParams()
    const orderId = searchParams.get("orderId") ?? undefined;
    const productName = searchParams.get("name") ?? "this service";

    const navigate = useNavigate();
    const { token } = useAuth();

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // --- Submit handler -------------------------------------------------------

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!productId) return;

        if (rating < 1 || rating > 5) {
            // Very simple client-side guard
            alert("Rating must be between 1 and 5.");
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                productId,          // required by backend
                rating,             // required by backend
                comment: comment.trim(), // optional, backend can handle empty string
                // storeId is resolved on the backend using productId + ItemsTable
            };

            const res = await fetch(`${API_BASE_URL}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                // Try to read JSON error from backend, but don't crash if it fails
                let message = "Failed to submit review.";
                try {
                    const body = await res.json();
                    if (body && typeof body.error === "string") {
                        message = body.error;
                    }
                } catch {
                    // ignore JSON parse error
                }

                console.error("Review submission failed", res.status, message);
                alert(message);
                return;
            }

            alert("Thank you for your review!");

            // After submitting, send the user back to the product detail page
            navigate(`/purchases`);
        } catch (err) {
            console.error("Unexpected error while submitting review", err);
            alert("Unexpected error while submitting review. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };



    return (
        <section className="mx-auto max-w-3xl px-6 py-10">
            <h1 className="mb-4 text-2xl font-semibold text-charcoal">Write a review</h1>

            <p className="mb-2 text-sm text-slate-600">
                You are reviewing: <span className="font-medium">{productName ?? 'this service'}</span>
            </p>
            {orderId && (
                <p className="mb-6 text-xs text-slate-500">
                    Order ID: {orderId}
                </p>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                {/* Rating input */}
                <div>
                    <label
                        htmlFor="rating"
                        className="block text-sm font-medium text-charcoal"
                    >
                        Rating (1–5)
                    </label>
                    <input
                        id="rating"
                        type="number"
                        min={1}
                        max={5}
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value) || 0)}
                        className="mt-1 w-24 rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                        Please rate this service from 1 (worst) to 5 (best).
                    </p>
                </div>

                {/* Comment input */}
                <div>
                    <label
                        htmlFor="comment"
                        className="block text-sm font-medium text-charcoal"
                    >
                        Comment
                    </label>
                    <textarea
                        id="comment"
                        rows={5}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with this service..."
                        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                        Optional, but very helpful for other buyers.
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? "Submitting..." : "Submit review"}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-charcoal hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </section>
    );
}
