import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function AssignmentReviewForm({assignmentId}: {assignmentId: string}) {
    const [rating, setRating] = React.useState(0);
    const [review, setReview] = React.useState("");
    const session = useSession();
    const TOKEN = session.data?.user?.accessToken || "";
    const queryClient = useQueryClient();

    const reviewsMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/review`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${TOKEN}`,
                },
                body: JSON.stringify({assigment: assignmentId, rating, comment: review }),
            });

                    if (!res.ok) throw new Error("Beoordeling verzenden mislukt");
            return res.json();
        },
        onSuccess: (data) => {
            toast.success(data?.message || "Beoordeling succesvol ingediend!");
            setReview("");
            setRating(0);
            queryClient.invalidateQueries({ queryKey: ["assignmentDetails", assignmentId] });
        },
        onError: (error) => {
            toast.error(error?.message || "Beoordeling verzenden mislukt");
        },
    });

    const handleSubmit = () => {
        if (!rating || !review.trim()) return;
        reviewsMutation.mutate();
    };

    const isDisabled = !rating || !review.trim() || reviewsMutation.isPending;

    return (
        <div className="flex items-center justify-center">
            <div className="w-full rounded-2xl">
                <div className="p-6 space-y-6">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                        Deel uw mening
                    </h2>

                    {/* Star Rating */}
                    <div className="flex justify-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                className="hover:scale-110 transition"
                            >
                                <Star
                                    className={`w-8 h-8 ${
                                        rating >= star ? "text-yellow-400" : "text-gray-400"
                                    }`}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Review Message */}
                    <div className="space-y-2">
                        <label className="font-medium text-gray-700">Uw beoordeling</label>
                        <Textarea
                            rows={4}
                            placeholder="Schrijf uw gedetailleerde beoordeling..."
                            className="rounded-xl"
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                        />
                    </div>

                    {/* Submit Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={isDisabled}
                        className="w-full py-3 text-lg font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {reviewsMutation.isPending ? "Bezig met verzenden..." : "Review indienen"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
