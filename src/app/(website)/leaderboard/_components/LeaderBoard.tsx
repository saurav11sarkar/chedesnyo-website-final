"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BreadcrumbHeader } from "@/components/ReusableCard/SubHero";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

type LeaderboardItem = {
  userId: string;
  totalSales: number;
  avgRating: number;
  user: {
    firstName?: string;
    email?: string;
    profileImage?: string;
    industry?: string;
    lastName?: string;
  } | null;
};

type LeaderboardApiResponse = {
  success: boolean;
  message: string;
  data: {
    meta: {
      total: number;
      page: number;
      limit: number;
    };
    data: LeaderboardItem[];
  };
};

function LeaderBoard() {
  const [timeframe, setTimeframe] = useState("yearly");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: leaderboardData, error, isLoading, refetch } =
    useQuery<LeaderboardApiResponse>({
      queryKey: ["leaderboardData", timeframe, currentPage],
      queryFn: async () => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/leaderboard?filter=${timeframe}&page=${currentPage}&limit=${itemsPerPage}`,
          { method: "GET", headers: { "Content-Type": "application/json" } }
        );
        if (!res.ok) throw new Error("Ranglijstgegevens ophalen mislukt");
        return res.json();
      },
    });

  const leaderboardItems = leaderboardData?.data?.data || [];
  const totalPages = Math.ceil(
    (leaderboardData?.data?.meta?.total || 0) / itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
    refetch();
  }, [timeframe, refetch]);

  const getInitial = (name: string) =>
    name ? name.charAt(0).toUpperCase() : "?";

  const getAvatarColor = (id: number) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-blue-400",
      "bg-orange-500",
      "bg-yellow-600",
      "bg-red-500",
      "bg-orange-600",
      "bg-green-500",
    ];
    return colors[id % colors.length];
  };

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Ranglijst laden mislukt
      </div>
    );

  return (
    <div className="min-h-screen">
      <BreadcrumbHeader
        title="Ranglijst"
        breadcrumbs={[
          { label: "Startpagina", href: "/" },
          { label: "Ranglijst", href: "/leaderboard" },
        ]}
      />

      <div className="container mx-auto lg:py-[96px] py-10 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          Top salesprofessionals
          </h1>

          <div className="flex justify-center flex-wrap gap-3">
            {["yearly", "monthly", "weekly"].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 sm:px-6 py-2 rounded-full font-medium transition-all ${
                  timeframe === tf
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400"
                }`}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-4 mb-8">
          {isLoading
            ? Array.from({ length: itemsPerPage }).map((_, index) => (
                <div
                  key={index}
                  className="bg-gray-500 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-pulse"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-32 rounded" />
                      <Skeleton className="h-3 w-24 rounded" />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 mt-2 sm:mt-0">
                    <div className="flex flex-col gap-1 text-left sm:text-right">
                      <Skeleton className="h-3 w-20 rounded" />
                      <Skeleton className="h-4 w-16 rounded" />
                      <Skeleton className="h-3 w-20 rounded" />
                    </div>
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </div>
                </div>
              ))
            : leaderboardItems.map((professional, index) => (
                <div
                  key={professional.userId || index}
                  className="bg-black rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Avatar */}
                    <div
                      className={`w-12 h-12 rounded-full ${getAvatarColor(
                        index
                      )} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}
                    >
                      {getInitial(professional.user?.firstName || "U")}
                    </div>

                    {/* Name and Email */}
                    <div className="flex flex-col">
                      <p className="text-white font-semibold text-sm sm:text-base">
                        {professional.user?.firstName || "Onbekende gebruiker"}{" "}
                        {professional.user?.lastName || ""}
                      </p>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        {professional.user?.email || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Sales Info */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 mt-2 sm:mt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-gray-400 text-xs sm:text-sm">
                        Total Sales:{" "}
                      </p>
                      <p className="text-white font-semibold text-sm sm:text-base">
                        {professional.totalSales}
                      </p>
                      <p className="text-gray-400 text-xs sm:text-sm">Beoordelingen: </p>
                    </div>

                    {/* Rating Badge */}
                    <div className="bg-orange-500 text-white font-bold px-3 py-1 rounded-full text-sm sm:text-base">
                      {professional.avgRating || 0}
                    </div>
                  </div>
                </div>
              ))}
          {!isLoading && leaderboardItems.length === 0 && (
            <p className="text-center text-gray-500 py-10 text-sm sm:text-base">
              Geen gegevens beschikbaar voor {timeframe}
            </p>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex gap-2 flex-wrap justify-center">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(
                (num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`w-8 h-8 rounded font-medium transition-all text-sm sm:text-base ${
                      currentPage === num
                        ? "bg-gray-300 text-gray-900"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {num.toString().padStart(2, "0")}
                  </button>
                )
              )}
              {totalPages > 5 && <span className="text-gray-400">...</span>}
              {totalPages > 5 && (
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="w-8 h-8 rounded font-medium text-gray-400 hover:text-gray-600 text-sm sm:text-base"
                >
                  {totalPages.toString().padStart(2, "0")}
                </button>
              )}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-full bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaderBoard;
