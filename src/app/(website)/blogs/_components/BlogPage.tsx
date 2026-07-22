"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import BlogCard from "@/components/ReusableCard/BlogCard";
import { BreadcrumbHeader } from "@/components/ReusableCard/SubHero";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton"; // Tailwind/Component based skeleton

type BlogPost = {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  createdAt: string;
};

type BlogApiResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  meta: {
    total: number;
    page: number;
    limit: number;
  };
  data: BlogPost[];
};

export default function BlogPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { data: blogData, isLoading } = useQuery<BlogApiResponse>({
    queryKey: ["blogData", currentPage],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/blog?page=${currentPage}&limit=${itemsPerPage}`
      );
      if (!res.ok) throw new Error("Bloggegevens ophalen mislukt");
      return res.json();
    },
  });

  const totalPages = Math.ceil((blogData?.meta?.total || 0) / itemsPerPage);

  const getPageNumbers = () => {
    const pages: number[] = [];
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

  const handleViewDetails = (postId: string) => {
    router.push(`/blogs/${postId}`);
  };

  const paginatedPosts = blogData?.data || [];

  return (
    <div className="min-h-screen">
      {/* Breadcrumb Header */}
      <BreadcrumbHeader
        title="Blogs"
        breadcrumbs={[
          { label: "Startpagina", href: "/" },
          { label: "Blogs", href: "/blogs" },
        ]}
      />

      <div className="container mx-auto lg:py-[96px] px-6 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: itemsPerPage }).map((_, idx) => (
              <div key={idx} className="animate-pulse">
                <Skeleton className="h-48 w-full rounded-lg mb-4" />
                <Skeleton className="h-5 w-3/4 rounded mb-2" />
                <Skeleton className="h-4 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : paginatedPosts.length > 0 ? (
          <>
            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedPosts.map((post) => (
                <BlogCard
                  key={post._id}
                  id={post._id}
                  image={post.thumbnail}
                  date={new Date(post.createdAt).toLocaleDateString("nl-NL", {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                  })}
                  title={post.title}
                  onViewDetails={() => handleViewDetails(post._id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="w-full flex items-center justify-between mt-12 pt-6">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} className="text-gray-600" />
                </button>

                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {pageNumbers[0] > 1 && (
                    <>
                      <button
                        onClick={() => handlePageChange(1)}
                        className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors text-gray-700 font-medium"
                      >
                        01
                      </button>
                      {pageNumbers[0] > 2 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                    </>
                  )}

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

                  {pageNumbers[pageNumbers.length - 1] < totalPages && (
                    <>
                      {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors text-gray-700 font-medium"
                      >
                        {String(totalPages).padStart(2, "0")}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={20} className="text-gray-600" />
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-500 py-10">Geen blogberichten gevonden.</p>
        )}
      </div>
    </div>
  );
}
