"use client";
import React from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import Link from "next/link";

// ✅ Type for Freelancer
type Freelancer = {
  id: string;
  name: string;
  image: string;
  bio: string;
  rating: number;
  reviewCount: number;
};

// ✅ Props type for FreelancerCard
type FreelancerCardProps = Freelancer;

// ✅ Reusable FreelancerCard Component
export const FreelancerCard: React.FC<FreelancerCardProps> = ({
  id,
  name,
  image,
  bio,
  rating,
  reviewCount,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-[0px_4px_16px_0px_#00000010] overflow-hidden flex flex-col sm:flex-row h-full transition-transform hover:scale-[1.02] duration-300">
      {/* Image Section with styled background */}
      <div className="w-full sm:w-64 h-56 sm:h-auto flex-shrink-0 bg-green-50 flex items-center justify-center overflow-hidden relative rounded-t-2xl sm:rounded-l-2xl">
        <Image
          width={400}
          height={400}
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-105"
        />
        {/* Optional overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-green-100/50 to-transparent"></div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
        {/* Name and Bio */}
        <div className="mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            {name}
          </h3>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            {bio.length > 120 ? `${bio.slice(0, 120)}...` : bio}
          </p>
        </div>

        {/* Rating and Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star size={20} className="fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-gray-900">{rating.toFixed(1)}</span>
            </div>
            <span className="text-gray-500 text-sm">({reviewCount})</span>
          </div>

          {/* View Profile Button */}
          <Link href={`/explore-freelancers/${id}`}>
            <button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-8 rounded-full transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 1C4.58 1 0.73 4.05 0.09 8C0.73 11.95 4.58 15 9 15C13.42 15 17.27 11.95 17.91 8C17.27 4.05 13.42 1 9 1ZM9 13C5.67 13 2.95 10.87 2.54 8C2.95 5.13 5.67 3 9 3C12.33 3 15.05 5.13 15.46 8C15.05 10.87 12.33 13 9 13ZM9 5C7.34 5 6 6.34 6 8C6 9.66 7.34 11 9 11C10.66 11 12 9.66 12 8C12 6.34 10.66 5 9 5ZM9 9C8.45 9 8 8.55 8 8C8 7.45 8.45 7 9 7C9.55 7 10 7.45 10 8C10 8.55 9.55 9 9 9Z"
                  fill="currentColor"
                />
              </svg>
              Profiel bekijken
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
