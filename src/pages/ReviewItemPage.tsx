import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate, useParams, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import { Star, ArrowLeft } from "lucide-react";

type ReviewRouteParams = {
    productId: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function ReviewItemPage() {
    const { productId } = useParams<ReviewRouteParams>();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("orderId") ?? undefined;
    const productName = searchParams.get("name") ?? "this service";

    const navigate = useNavigate();
    const { token } = useAuth();

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [title, setTitle] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // -------------------------------------------------------------------------
    // Submit handler (test-main logic)
    // -------------------------------------------------------------------------

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!productId) return;

        if (rating < 1 || rating > 5) {
            alert("Rating must be between 1 and 5.");
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                productId,
                rating,
                title,
                comment: comment.trim(),
                // storeId removed — backend auto resolves it
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
                let bodyText = "Failed to submit review.";
                try {
                    const data = await res.json();
                    bodyText = data.error || data.message || JSON.stringify(data);
                } catch {
                    bodyText = await res.text();
                }

                console.error("Failed to submit review:", bodyText);
                alert(`Failed to submit review: ${bodyText}`);
                return;
            }

            alert("Thank you for your review!");
            navigate("/purchases");
        } catch (err) {
            console.error("Unexpected error submitting review:", err);
            alert("Unexpected error submitting review. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // -------------------------------------------------------------------------
    // UI (Dipen frontend preserved)
    // -------------------------------------------------------------------------
    return (
        <section className="max-w-2xl mx-auto px-6 py-10">
            <div className="animate-fade-in-up mb-6">
                <div className="flex items-center gap-4">
                    <Link to="/purchases" className="text-slate-400 hover:text-charcoal">
                        <ArrowLeft />
                    </Link>
                    <h1 className="text-3xl font-extrabold text-charcoal">Write a review</h1>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                    You are reviewing <span className="font-semibold">{productName}</span>
                </p>
                {orderId && (
                    <p className="text-xs text-slate-400 mt-1">Order ID: {orderId}</p>
                )}
                <p className="mt-2 text-sm text-slate-500">
                    Share your experience to help others — your feedback matters.
                </p>
            </div>

            <div className="card p-6 space-y-6 animate-fade-in-up">
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Title */}
                    <div className="animate-stagger-1">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Review title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Summarize your experience..."
                            className="w-full rounded-md border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>

                    {/* Rating */}
                    <div className="animate-stagger-1">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Rating
                        </label>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    aria-label={`Set rating ${n}`}
                                    aria-pressed={n <= rating}
                                    onClick={() => setRating(n)}
                                    className={`p-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                                        n <= rating ? "text-primary" : "text-slate-300 hover:text-slate-400"
                                    }`}
                                >
                                    {n <= rating ? (
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="inline-block"
                                        >
                                            <path d="M12 .587l3.668 7.431L23.4 9.588l-5.7 5.557L19.335 24 12 19.77 4.665 24l1.636-8.855L.6 9.588l7.732-1.57L12 .587z" />
                                        </svg>
                                    ) : (
                                        <Star size={20} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="animate-stagger-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Comment
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full min-h-[120px] rounded-md border border-slate-200 px-4 py-3 resize-vertical focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="Share what you liked or what could be improved..."
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-end animate-stagger-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary px-4 py-2 flex items-center gap-2 disabled:opacity-50"
                        >
                            <span>{submitting ? "Submitting..." : "Submit review"}</span>
                        </button>
                        <button
                            type="button"
                            className="btn-outline px-4 py-2"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}

