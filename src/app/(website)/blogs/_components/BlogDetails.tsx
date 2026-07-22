"use client";

import React from "react";
import { Heart, Share2, Bookmark, Loader2 } from "lucide-react";
import Image from "next/image";
import { BreadcrumbHeader } from "@/components/ReusableCard/SubHero";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

type BlogDetail = {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
};

type BlogApiResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: BlogDetail;
};

function BlogDetailPage() {
  const params = useParams();
  const { id } = params;

  const { data, error, isLoading } = useQuery<BlogApiResponse>({
    queryKey: ["singleBlogData", id],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/blog/${id}`);
      if (!res.ok) throw new Error("Blogdetails ophalen mislukt");
      return res.json();
    },
    enabled: !!id,
  });

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Blog laden mislukt
      </div>
    );

  const blog = data?.data;

  if (!blog)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Geen blog gevonden
      </div>
    );

  return (
    <div className="min-h-screen">
      {/* Breadcrumb Header */}
      <BreadcrumbHeader
        title="Blogdetails"
        breadcrumbs={[
          { label: "Startpagina", href: "/" },
          { label: "Blogs", href: "/blogs" },
        ]}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 lg:py-12 py-10">
        {/* Featured Image */}
        <div className="mb-8 rounded-lg overflow-hidden">
          <Image
            width={800}
            height={600}
            src={blog.thumbnail}
            alt={blog.title}
            className="w-full h-64 sm:h-80 md:h-96 lg:h-[28rem] object-cover rounded-lg"
          />
        </div>

        {/* Meta Information */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm sm:text-base">
            <span className="text-gray-500">Door</span>
            <span className="font-semibold text-gray-900">Admin</span>
          </div>
          <div className="flex items-center gap-2 text-sm sm:text-base">
            <span className="text-gray-500">Datum</span>
            <span className="font-semibold text-gray-900">
              {new Date(blog.createdAt).toLocaleDateString("nl-NL", {
                year: "numeric",
                month: "long",
                day: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2 sm:mt-0 sm:ml-auto">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Heart size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Share2 size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Bookmark size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Blog Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 leading-snug sm:leading-tight">
          {blog.title}
        </h1>

       <div
  className="prose prose-sm sm:prose lg:prose-lg max-w-none text-gray-700 space-y-6"
  dangerouslySetInnerHTML={{ __html:(blog.description) }}
></div>

        {/* Tags Section */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2 sm:mb-3">Tags:</p>
          <div className="flex flex-wrap gap-2">
            {["Blog", "Ontwerp", "Technologie", "Inzichten"].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 sm:px-4 sm:py-2 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm hover:bg-gray-200 cursor-pointer transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Author Section */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Image
              width={500}
              height={500}
              src="/images/blogDetailsImage.jpg"
              alt="Author"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
            />
            <div>
              <h3 className="font-bold text-gray-900 text-lg sm:text-xl">Admin</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Ervaren schrijver en contentmaker met passie voor het delen van inzichten en kennis met lezers wereldwijd.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogDetailPage;
