"use client";
import React from "react";
import { Book } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface DealCardProps {
  image?: string;
  category: string;
  title: string;
  type: string;
  paymentType: string;
  paymentAmount: string;
  applications: number;
  price?: string;
  id: string;
}

export default function AssignmentCard({
  image = "https://via.placeholder.com/400x300?text=HTML5+Development",
  category = "Informatietechnologie",
  title = "Webapplicatieontwikkeling",
  type = "Testopdracht",
  paymentType = "Per uur",
  paymentAmount = "$17.00",
  applications = 3,
  id,
}: DealCardProps) {
  return (
    <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transform transition duration-300 ease-in-out hover:scale-[1.03] hover:-translate-y-1 hover:shadow-xl flex flex-col h-[420px]">
      {/* Image Container */}
      <div className="relative w-full h-48 overflow-hidden bg-gray-200">
        <Image
          src={image}
          width={500}
          height={300}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-105"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>

      {/* Content Container */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div className="space-y-3">
          {/* Category Badge */}
          <div className="inline-block">
            <span className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold border border-green-200 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              {category}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
            {title.length > 20 ? `${title.slice(0, 20)}...` : title}
          </h3>

          {/* Divider */}
          <div className="h-px bg-gray-200"></div>

          {/* Details */}
          <div className="space-y-1 text-gray-700 text-sm">
            <div className="flex justify-between">
              <span>{type}</span>
            </div>
            <div className="flex justify-between">
              <span>
                <span className="font-semibold">Betaling:</span> {paymentType} ({paymentAmount})
              </span>
            </div>
            <div className="flex justify-between">
              <span>
                Aanmeldingen: <span className="font-semibold">{applications}</span>
              </span>
            </div>
          </div>
        </div>

        {/* View Details Button */}
        <Link href={`/assignments/${id}`}>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-4 transition-all duration-300">
            <Book size={20} />
            Details bekijken
          </button>
        </Link>
      </div>
    </div>
  );
}
