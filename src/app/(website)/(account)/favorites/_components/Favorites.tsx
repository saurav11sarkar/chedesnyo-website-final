"use client";

import { BreadcrumbHeader } from "@/components/ReusableCard/SubHero";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, HeartOff, User, Briefcase, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

type FavoriteTarget = "user" | "assignment" | "course" | "all";

type Favorite = {
  _id: string;
  targetId: string;
  targetType: "user" | "assignment" | "course";
  createdAt: string;
};

type ApiResponse = {
  success: boolean;
  data: Favorite[];
  meta: { total: number; page: number; limit: number };
};

const typeIcons = {
  user: <User size={16} className="text-blue-600" />,
  assignment: <Briefcase size={16} className="text-amber-600" />,
  course: <BookOpen size={16} className="text-purple-600" />,
};

const typeLabels = {
  user: "Gebruiker",
  assignment: "Opdracht",
  course: "Cursus",
};

const typeBadgeColors = {
  user: "bg-blue-100 text-blue-700",
  assignment: "bg-amber-100 text-amber-700",
  course: "bg-purple-100 text-purple-700",
};

const typeLinks: Record<string, string> = {
  user: "/explore-freelancers",
  assignment: "/assignments",
  course: "/courses",
};

function Favorites() {
  const { data: session } = useSession();
  const TOKEN = session?.user?.accessToken || "";
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<FavoriteTarget>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ["favorites", currentPage],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/favorite/my?page=${currentPage}&limit=${itemsPerPage}`,
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      );
      if (!res.ok) throw new Error("Favorieten ophalen mislukt");
      return res.json();
    },
    enabled: !!TOKEN,
  });

  const removeMutation = useMutation({
    mutationFn: async ({ targetId, targetType }: { targetId: string; targetType: string }) => {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/favorite/toggle`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetId, targetType }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  const allFavorites = data?.data || [];
  const filtered =
    activeFilter === "all"
      ? allFavorites
      : allFavorites.filter((f) => f.targetType === activeFilter);

  const total = data?.meta?.total || 0;
  const totalPages = Math.ceil(total / itemsPerPage);

  const filters: { key: FavoriteTarget; label: string }[] = [
    { key: "all", label: "Alle" },
    { key: "user", label: "Gebruikers" },
    { key: "assignment", label: "Opdrachten" },
    { key: "course", label: "Cursussen" },
  ];

  return (
    <div>
      <BreadcrumbHeader
        title="Mijn favorieten"
        breadcrumbs={[
          { label: "Startpagina", href: "/" },
          { label: "Favorieten", href: "/favorites" },
        ]}
      />

      <div className="container mx-auto px-4 lg:px-10 py-[96px]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Heart className="text-red-500" size={22} />
          <h2 className="text-xl font-bold text-gray-900">Mijn favorieten</h2>
          {total > 0 && (
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {total} opgeslagen
            </span>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => { setActiveFilter(f.key); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                activeFilter === f.key
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                    <div className="h-2 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-red-500 text-sm">
            Favorieten laden mislukt.
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-lg border border-gray-200">
            <HeartOff className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 text-sm">Nog geen favorieten opgeslagen</p>
            <p className="text-gray-400 text-xs mt-1">
              Klik op het hartje bij een opdracht, cursus of gebruiker om op te slaan
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((fav) => (
              <div
                key={fav._id}
                className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow group"
              >
                {/* Type badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                      typeBadgeColors[fav.targetType]
                    }`}
                  >
                    {typeIcons[fav.targetType]}
                    {typeLabels[fav.targetType]}
                  </span>
                  <button
                    onClick={() =>
                      removeMutation.mutate({
                        targetId: fav.targetId,
                        targetType: fav.targetType,
                      })
                    }
                    disabled={removeMutation.isPending}
                    title="Verwijder uit favorieten"
                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart size={16} fill="currentColor" />
                  </button>
                </div>

                {/* Avatar placeholder */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {typeIcons[fav.targetType]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      ID: {fav.targetId.slice(-8)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(fav.createdAt).toLocaleDateString("nl-NL")}
                    </p>
                  </div>
                </div>

                {/* View link */}
                <Link
                  href={`${typeLinks[fav.targetType]}/${fav.targetId}`}
                  className="block text-center text-xs text-green-700 border border-green-600 rounded-lg py-1.5 hover:bg-green-50 transition-colors"
                >
                  Bekijken
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
            <p className="text-xs text-gray-500">
              {(currentPage - 1) * itemsPerPage + 1}–
              {Math.min(currentPage * itemsPerPage, total)} van {total} favorieten
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded text-sm font-medium ${
                    currentPage === p
                      ? "bg-green-600 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Favorites;
