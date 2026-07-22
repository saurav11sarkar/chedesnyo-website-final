"use client";

import React, { useState } from "react";
import { BreadcrumbHeader } from "@/components/ReusableCard/SubHero";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import CoursesCard from "@/components/ReusableCard/CoursesCard";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

// Types
/* eslint-disable @typescript-eslint/no-explicit-any */
type Course = {
  _id: string;
  title: string;
  level: string;
  description: string;
  thumbnail: string;
  duration: string;
  targetAudience: string;
  language: string;
  modules: number;
  price: number;
  discount: number;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  extraFile: string;
  introductionVideo: string;
  courseVideo: string;
  application: any[];
};

type CoursesApiResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  meta: {
    total: number;
    page: number;
    limit: number;
  };
  data: Course[];
};

function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Fetch Courses
  const { data: courseData, error, isLoading } = useQuery<CoursesApiResponse>({
    queryKey: ["coursesData", searchTerm, currentPage],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/course/?searchTerm=${encodeURIComponent(
          searchTerm
        )}&status=approved&page=${currentPage}&limit=${itemsPerPage}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!res.ok) throw new Error("Cursussen ophalen mislukt");
      return res.json();
    },
  });

  const courses = courseData?.data || [];
  const totalPages = Math.ceil((courseData?.meta?.total || 0) / itemsPerPage);

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

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Cursussen laden mislukt
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <BreadcrumbHeader
        title="Courses"
        breadcrumbs={[
          { label: "Startpagina", href: "/" },
          { label: "Courses", href: "/courses" },
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
            className="w-full px-4 h-[50px] shadow-[0px_4px_32px_0px_#00000040] bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 text-gray-900"
          />
          <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white p-2.5 rounded-full transition-colors flex items-center justify-center">
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="container mx-auto lg:px-6 px-3 lg:pb-16 pb-0">
        {/* 🔄 Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="rounded-xl border bg-white shadow p-4 space-y-4"
              >
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {/* If Data Loaded */}
        {!isLoading && courses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {courses.map((course) => (
                <CoursesCard
                  id={course._id}
                  key={course._id}
                  image={course.thumbnail}
                  category={course.level}
                  title={course.title}
                  type={course.description}
                  paymentType="Vaste prijs"
                  paymentAmount={`$${course.price}`}
                  applications={course.application.length || 0}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="w-full flex items-center justify-between mt-12 pt-6">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
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
          </>
        ) : null}

        {/* If No Data */}
        {!isLoading && courses.length === 0 && (
          <p className="text-center text-gray-500 py-10">
            Geen cursussen gevonden voor {searchTerm}
          </p>
        )}
      </div>
    </div>
  );
}

export default CoursesPage;
