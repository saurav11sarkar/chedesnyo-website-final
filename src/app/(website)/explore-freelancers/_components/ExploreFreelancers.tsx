"use client";

import React, { useState, useEffect } from "react";
import { FreelancerCard } from "@/components/ReusableCard/FreelancersCard";
import { BreadcrumbHeader } from "@/components/ReusableCard/SubHero";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

type Freelancer = {
  _id: string;
  firstName: string;
  profileImage: string;
  location: string;
  rating?: number;
  reviewCount?: number;
};

export default function ExploreFreelancers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  useEffect(() => {
    const handler = setTimeout(
      () => setDebouncedSearchTerm(searchTerm),
      500
    );
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data, isError, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["freelancers", debouncedSearchTerm, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("role", "seles");
      params.append("status", "approved");
      params.append("page", currentPage.toString());
      params.append("limit", itemsPerPage.toString());
      if (debouncedSearchTerm)
        params.append("searchTerm", debouncedSearchTerm);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/all-user?${params.toString()}`
      );
      if (!res.ok) throw new Error("Freelancers ophalen mislukt");
      return res.json();
    },
  });

  const freelancersData: Freelancer[] = data?.data || [];
  const totalItems: number = data?.meta?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isError)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Freelancers laden mislukt.
      </div>
    );

  return (
    <div className="min-h-screen mb-[96px]">
      {/* Breadcrumb Header */}
      <BreadcrumbHeader
        title="Explore Freelancers"
        breadcrumbs={[
          { label: "Startpagina", href: "/" },
          { label: "Explore Freelancers", href: "/explore-freelancers" },
        ]}
      />

      <div className="container mx-auto lg:px-6 px-3">
        {/* Search Bar */}
        <div className="max-w-5xl mx-auto px-6 lg:pb-6 flex items-center justify-center">
          <div className="relative w-full lg:py-[96px] py-14">
            <Input
              type="text"
              placeholder="Zoek hier..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 h-[50px] shadow-[0px_4px_32px_0px_#00000040] bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 text-gray-900"
            />
            <button
              onClick={() => refetch()}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white p-2.5 rounded-full transition-colors flex items-center justify-center"
            >
              {isFetching ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Search size={20} />
              )}
            </button>
          </div>
        </div>

        {/* ⭐ Skeleton Loader */}
        {(isLoading || isFetching) && freelancersData.length === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="border p-6 rounded-xl shadow bg-white space-y-4"
              >
                <Skeleton className="w-24 h-24 rounded-full mx-auto" />
                <Skeleton className="h-4 w-2/3 mx-auto" />
                <Skeleton className="h-4 w-1/3 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>
        )}

        {/* Actual Freelancer Grid */}
        {!isLoading && freelancersData.length > 0 && (
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-300"
            style={{
              opacity: isFetching ? 0.6 : 1,
            }}
          >
            {freelancersData.map((freelancer) => (
              <FreelancerCard
                key={freelancer._id}
                id={freelancer._id}
                name={freelancer.firstName}
                image={freelancer.profileImage}
                bio={freelancer.location || ""}
                rating={freelancer.rating || 0}
                reviewCount={freelancer.reviewCount || 0}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="w-full flex items-center justify-between mt-12 pt-6">
            <button
              onClick={() =>
                handlePageChange(Math.max(1, currentPage - 1))
              }
              disabled={currentPage === 1}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              {pageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-md border font-medium ${
                    currentPage === page
                      ? "border-green-500 bg-green-50 text-green-600"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {String(page).padStart(2, "0")}
                </button>
              ))}
            </div>

            <button
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
