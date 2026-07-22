/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BreadcrumbHeader } from "@/components/ReusableCard/SubHero";
import { Input } from "@/components/ui/input";
import AssignmentCard from "@/components/ReusableCard/AssignmentCard";
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// ✅ Type for API data
type Assignment = {
  _id: string;
  banner: string;
  title: string;
  description: string;
  budget: string;
  priceType: string;
  paymentMethod: string;
  deadLine: string;
  status: string;
  uploadFile?: string;
  application: Array<any>;
};

// ✅ Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// ✅ Fetch Assignments function
const fetchAssignments = async (searchTerm: string) => {
  const url = searchTerm
    ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/assigment/?searchTerm=${encodeURIComponent(
        searchTerm
      )}&status=approved`
    : `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/assigment/?status=approved`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Opdrachten ophalen mislukt");
  return res.json();
};

export default function Assignments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const debouncedSearch = useDebounce(searchTerm, 400);

  const { data, isError, isFetching } = useQuery({
    queryKey: ["assignments", debouncedSearch],
    queryFn: () => fetchAssignments(debouncedSearch),
  });

  const assignments: Assignment[] = data?.data || [];

  const totalPages = Math.ceil(assignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssignments = assignments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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

  if (isError)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Opdrachten laden mislukt.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Header */}
      <BreadcrumbHeader
        title="Our Services"
        breadcrumbs={[
          { label: "Startpagina", href: "/" },
          { label: "Opdrachten", href: "/assignments" },
        ]}
      />

      {/* Search Input */}
      <div className="max-w-5xl mx-auto px-6 lg:py-[96px] py-10 flex items-center justify-center">
        <div className="relative w-full">
          <Input
            type="text"
            placeholder="Zoek hier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setCurrentPage(1)}
            className="w-full px-4 h-[50px] shadow-[0px_4px_32px_0px_#00000040] bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 text-gray-900"
          />
          <button
            type="button"
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white p-2.5 rounded-full transition-all duration-200"
          >
            {isFetching ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Search size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Assignment Cards */}
      <div className="container mx-auto lg:px-6 px-3 lg:pb-16">

        {/* ⭐ Skeleton Loader (first load + search load) */}
        {isFetching && paginatedAssignments.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white shadow rounded-xl p-4 space-y-4">
                <Skeleton className="w-full h-32 rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>
        )}

        {paginatedAssignments.length > 0 ? (
          <>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 transition-all duration-300"
              style={{
                opacity: isFetching ? 0.7 : 1,
                transition: "opacity 0.3s ease-in-out",
              }}
            >
              {paginatedAssignments.map((assignment) => (
                <div
                  key={assignment._id}
                  className="transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <AssignmentCard
                    id={assignment._id}
                    image={assignment.banner}
                    category={assignment.status}
                    title={assignment.title}
                    type={assignment.priceType}
                    paymentType={assignment.paymentMethod}
                    paymentAmount={`$${assignment.budget}`}
                    applications={assignment.application.length || 0}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="w-full flex items-center justify-between mt-12 pt-6">
                <button
                  onClick={() =>
                    handlePageChange(Math.max(1, currentPage - 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronLeft size={20} className="text-gray-600" />
                </button>

                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-md border font-medium transition-all duration-200 ${
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
                  className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronRight size={20} className="text-gray-600" />
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-500 py-10">
            Geen opdrachten gevonden voor &quot;{searchTerm}&quot;
          </p>
        )}
      </div>
    </div>
  );
}
