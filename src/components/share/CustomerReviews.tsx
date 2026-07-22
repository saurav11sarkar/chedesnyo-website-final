
"use client";

import React from "react";
import { ReviewsCarousel, Review } from "../ReusableCard/CustomerReviewsCard"; 
import { useQuery } from "@tanstack/react-query";

// ✅ Main Review Page
export default function CustomerReviews() {
  const { data: reviewData, isLoading, isError } = useQuery({
    queryKey: ["customerReviews"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/review`, {
        method: "GET",
      });
      if (!res.ok) throw new Error("Beoordelingen ophalen mislukt");
      return res.json();
    },
  });
  /* eslint-disable @typescript-eslint/no-explicit-any */

  // Map API response to Review type
  const reviews: Review[] =
    reviewData?.data?.data?.map((item: any) => ({
      id: item._id,
      name: item.user?.firstName || "Anoniem",
      avatar: item.user?.profileImage || "/images/reviewImage.jpg",
      rating: item.rating,
      date: new Date(item.createdAt).toLocaleDateString("nl-NL", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      text: item.comment,
    })) || [];

  if (isLoading) return <p className="text-center py-10">Beoordelingen laden...</p>;
  if (isError) return <p className="text-center py-10 text-red-500">Beoordelingen laden mislukt.</p>;

  return (
    <ReviewsCarousel
      reviews={reviews}
      itemsPerView={3}
      showHeader={true}
      title="Klantbeoordelingen"
    />
  );
}
