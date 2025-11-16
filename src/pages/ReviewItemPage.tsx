// src/pages/ReviewItemPage.tsx
import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate, useParams, useLocation, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import { Star, ArrowLeft } from "lucide-react";

export default function ReviewItemPage() {
    const { id } = useParams<{ id: string }>(); // product/listing id
    const navigate = useNavigate();
    const location = useLocation();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [title, setTitle] = useState("");

    const { user, token } = useAuth();
    const [searchParams] = useSearchParams();
    const stateStoreId = (location.state as { storeId?: string })?.storeId;
    const queryStoreId = searchParams.get('storeId') || undefined;
    const [manualStoreId, setManualStoreId] = useState<string | undefined>(undefined);
    const storeId = stateStoreId || queryStoreId || manualStoreId;

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!id) return;

        if (rating < 1 || rating > 5) {
            alert("Rating must be between 1 and 5.");
            return;
        }
        
        if (!storeId) {
            alert('Missing storeId: cannot submit review. Please open the review from your purchases list or provide a storeId via ?storeId=...');
            return;
        }
        const payload = {
            productId: id,
            rating,
            comment,
            title,
            storeId,
        };

        const res = await fetch(`${API_BASE_URL}/reviews`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            let bodyText = 'Failed to submit review.'
            try {
                const data = await res.json();
                bodyText = data.error || data.message || JSON.stringify(data);
            } catch (err) {
                bodyText = await res.text();
            }
            console.error("Failed to submit review", bodyText);
            alert(`Failed to submit review: ${bodyText}`);
            return;
        }

        navigate("/purchases");
    };

    return (
        <section className="max-w-2xl mx-auto px-6 py-10">
            <div className="animate-fade-in-up mb-6">
                <div className="flex items-center gap-4">
                    <Link to="/purchases" className="text-slate-400 hover:text-charcoal">
                        <ArrowLeft />
                    </Link>
                    <h1 className="text-3xl font-extrabold text-charcoal">Write a review</h1>
                </div>
                <p className="mt-2 text-sm text-slate-500">Share your experience to help others — your feedback matters.</p>
            </div>

            <div className="card p-6 space-y-6 animate-fade-in-up">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!storeId && (
                        <div className="animate-fade-in-up rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <strong>Missing storeId</strong>
                                    <div className="text-xs text-yellow-800/80">You opened this page directly. Provide the storefront id so the review can be associated with a store.</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="storeId"
                                        value={manualStoreId ?? ''}
                                        onChange={(e) => setManualStoreId(e.target.value)}
                                        className="rounded-md border px-3 py-2 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!manualStoreId) {
                                                return alert('Please enter a storeId to proceed.');
                                            }
                                            // storeId will update because manualStoreId is part of the derived storeId
                                        }}
                                        className="btn-primary px-3 py-2 text-sm"
                                    >
                                        Use storeId
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="animate-stagger-1">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Review title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Summarize your experience..."
                            className="w-full rounded-md border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>

                    <div className="animate-stagger-1">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                        <div className="flex items-center gap-2">
                            {[1,2,3,4,5].map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    aria-label={`Set rating ${n}`}
                                    aria-pressed={n <= rating}
                                    onClick={() => setRating(n)}
                                    className={`p-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${n <= rating ? 'text-primary' : 'text-slate-300 hover:text-slate-400'}`}
                                >
                                    {n <= rating ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="inline-block">
                                            <path d="M12 .587l3.668 7.431L23.4 9.588l-5.7 5.557L19.335 24 12 19.77 4.665 24l1.636-8.855L.6 9.588l7.732-1.57L12 .587z" />
                                        </svg>
                                    ) : (
                                        <Star size={20} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="animate-stagger-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Comment</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full min-h-[120px] rounded-md border border-slate-200 px-4 py-3 resize-vertical focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="Share what you liked or what could be improved..."
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-end animate-stagger-3">
                        <button type="submit" className="btn-primary px-4 py-2 flex items-center gap-2">
                            <span>Submit review</span>
                        </button>
                        <button type="button" className="btn-outline px-4 py-2" onClick={() => navigate(-1)}>Cancel</button>
                    </div>
                </form>
            </div>
        </section>
    );
}
