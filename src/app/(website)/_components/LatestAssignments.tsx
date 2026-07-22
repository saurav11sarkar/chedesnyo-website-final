"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import AssignmentCard from "@/components/ReusableCard/AssignmentCard";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

type Assignment = {
  _id: string;
  banner: string;
  title: string;
  budget: string;
  priceType: string;
  paymentMethod: string;
  status: string;
};

export default function LatestAssignments() {
  // Fetch assignments from your API
  const { data, isLoading, isError } = useQuery({
    queryKey: ["assignments"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/assigment/?status=approved`
      );
      if (!res.ok) throw new Error("Opdrachten ophalen mislukt");
      return res.json();
    },
  });

  const assignments: Assignment[] = data?.data || [];

  return (
    <section className="bg-gray-50 py-16">
      <div className="lg:container w-full mx-auto lg:px-6 px-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
          <div>
            <p className="text-gray-500 text-sm font-semibold mb-2">
              ASSIGNMENTS
            </p>
            <h2 className="text-4xl font-bold text-gray-900">
              Nieuwste opdrachten
            </h2>
          </div>
          <Link
            href="/assignments"
            className="text-green-600 font-semibold flex items-center gap-1 hover:text-green-700 transition-colors"
          >
            Alles bekijken <ChevronRight size={20} />
          </Link>
        </div>

        {/* Skeleton Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow p-4 space-y-4">
                <Skeleton className="w-full h-32 rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <p className="text-center text-red-500 text-lg">
            Opdrachten laden mislukt.
          </p>
        )}

        {/* Cards Grid */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {assignments.slice(0, 4).map((assignment) => (
              <AssignmentCard
                id={assignment._id}
                key={assignment._id}
                image={assignment.banner}
                category={assignment.paymentMethod.toUpperCase()}
                title={assignment.title}
                type={assignment.status}
                paymentType={assignment.priceType}
                paymentAmount={`$${assignment.budget}`}
                applications={0}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
