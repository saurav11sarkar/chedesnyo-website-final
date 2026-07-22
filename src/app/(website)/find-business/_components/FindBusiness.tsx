"use client";

import React, { useState, useEffect } from "react";
import { BreadcrumbHeader } from "@/components/ReusableCard/SubHero";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { BusinessesCard } from "@/components/ReusableCard/BusinessesCard";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton"; // ✅ Skeleton import added

// Type for API business
type BusinessUser = {
  _id: number;
  firstName: string;
  lastName?: string;
  businessName: string;
  profileImage: string;
  location?: string;
  bio?: string;
};

type ApiResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  meta: {
    total: number;
    page: number;
    limit: number;
  };
  data: BusinessUser[];
};

export default function FindBusiness() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch API
  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ["businesses", debouncedSearchTerm, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append("searchTerm", debouncedSearchTerm);
      params.append("role", "business");
      params.append("status", "approved");
      params.append("page", currentPage.toString());
      params.append("limit", itemsPerPage.toString());

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/all-user/?${params.toString()}`
      );

      if (!res.ok) throw new Error("Bedrijven ophalen mislukt");
      return res.json();
    },
  });

  const businessesData = data?.data || [];
  const totalItems = data?.meta.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen lg:mb-[96px] mb-10">
      <BreadcrumbHeader
        title="Vind bedrijven"
        breadcrumbs={[
          { label: "Startpagina", href: "/" },
          { label: "Vind bedrijven", href: "/find-business" },
        ]}
      />

      <div className="container mx-auto lg:px-6 px-3">
        {/* Search Bar */}
        <div className="lg:max-w-5xl mx-auto lg:px-6 lg:pb-6 flex items-center justify-center lg:py-[96px] my-10 lg:my-0">
          <div className="relative w-full">

            {/* 🔹 Search Skeleton */}
            {isLoading ? (
              <Skeleton className="w-full h-[50px] rounded-full" />
            ) : (
              <>
                <Input
                  type="text"
                  placeholder="Zoek hier..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 h-[50px] shadow-[0px_4px_32px_0px_#00000040] bg-white border border-gray-200 rounded-full"
                />
                <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white p-2.5 rounded-full">
                  <Search size={20} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Businesses Grid / Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:pt-[96px]">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-6 border rounded-lg shadow-sm">
                <Skeleton className="w-full h-40 rounded-lg" />
                <Skeleton className="h-4 w-2/3 mt-4" />
                <Skeleton className="h-3 w-1/2 mt-2" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="min-h-[300px] flex items-center justify-center text-red-500">
            Er is iets misgegaan!
          </div>
        ) : businessesData.length === 0 ? (
          <div className="min-h-[300px] flex items-center justify-center text-gray-500">
            Geen bedrijven gevonden.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:pt-[96px]">
            {businessesData.map((business: BusinessUser) => (
              <BusinessesCard
                key={business._id}
                id={business._id}
                name={business.businessName || business.firstName}
                image={business.profileImage || "/images/businessImage.jpg"}
                bio={
                  business.bio ||
                  `${business.businessName || business.firstName} is a verified business.`
                }
                rating={0}
                reviewCount={0}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {isLoading ? (
          <div className="flex items-center justify-center mt-12 gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-40 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        ) : (
          totalPages > 1 && (
            <div className="w-full flex items-center justify-between mt-12 lg:pt-6">
              {/* Previous */}
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-md border font-medium transition-colors ${
                      currentPage === page
                        ? "border-green-500 bg-green-50 text-green-600"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {String(page).padStart(2, "0")}
                  </button>
                ))}
              </div>

              {/* Next */}
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
