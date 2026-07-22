"use client";

import React, { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

// ✅ Define TypeScript type for Review
export type Review = {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
};

// ✅ REUSABLE Review Card Component
export const ReviewCard: React.FC<Review> = ({
  name,
  avatar,
  rating,
  date,
  text,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col h-full border border-gray-100 hover:shadow-md transition-all">
      {/* Header - Avatar, Name, and Rating */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <Image
          width={200}
          height={200}
          src={avatar}
          alt={name}
          className="w-12 h-12 rounded-full object-cover border"
        />

        {/* Name, Rating, and Date */}
        <div className="flex-1">
          {/* Rating Stars */}
          <div className="flex items-center gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={
                  i < rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }
              />
            ))}
            <span className="text-sm text-gray-600 ml-2">({rating})</span>
          </div>

          {/* Name */}
          <h3 className="font-semibold text-gray-900 text-sm">{name}</h3>

          {/* Date */}
          <p className="text-xs text-gray-500 mt-1">{date}</p>
        </div>
      </div>

      {/* Review Text */}
      <p className="text-gray-700 text-sm leading-relaxed flex-grow italic">
        “{text}”
      </p>
    </div>
  );
};

// ✅ REUSABLE Reviews Carousel Component
interface ReviewsCarouselProps {
  reviews: Review[];
  itemsPerView?: number;
  showHeader?: boolean;
  title?: string;
}

export const ReviewsCarousel: React.FC<ReviewsCarouselProps> = ({
  reviews,
  itemsPerView = 3,
  showHeader = true,
  title = "Klantbeoordelingen",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalItems = reviews.length;
  const maxIndex = Math.max(0, totalItems - itemsPerView);

  const handlePrevious = () => setCurrentIndex((prev) => Math.max(0, prev - 1));
  const handleNext = () =>
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));

  const visibleReviews = reviews.slice(
    currentIndex,
    currentIndex + itemsPerView
  );

  return (
    <div className="py-16 px-4 md:px-6">
      <div className="">
        {/* Header with Navigation */}
        {showHeader && (
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {title}
            </h2>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === maxIndex}
                className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        )}

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleReviews.map((review) => (
            <ReviewCard key={review.id} {...review} />
          ))}
        </div>
      </div>
    </div>
  );
};
