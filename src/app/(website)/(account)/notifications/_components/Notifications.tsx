"use client";

import { BreadcrumbHeader } from "@/components/ReusableCard/SubHero";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff, Trash2, CheckCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useState } from "react";

type Notification = {
  _id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
};

type ApiResponse = {
  success: boolean;
  data: Notification[];
  meta: {
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
  };
};

const typeColors: Record<string, string> = {
  message: "bg-blue-100 text-blue-700",
  payment_approved: "bg-green-100 text-green-700",
  payment_rejected: "bg-red-100 text-red-700",
  assignment_applied: "bg-yellow-100 text-yellow-700",
  applicant_accepted: "bg-green-100 text-green-700",
  applicant_rejected: "bg-red-100 text-red-700",
  referral_bonus: "bg-purple-100 text-purple-700",
  payout_approved: "bg-green-100 text-green-700",
  payout_rejected: "bg-red-100 text-red-700",
  general: "bg-gray-100 text-gray-700",
};

const typeLabels: Record<string, string> = {
  message: "Bericht",
  payment_approved: "Betaling goedgekeurd",
  payment_rejected: "Betaling afgewezen",
  assignment_applied: "Sollicitatie ontvangen",
  applicant_accepted: "Sollicitatie geaccepteerd",
  applicant_rejected: "Sollicitatie afgewezen",
  referral_bonus: "Verwijzingsbonus",
  payout_approved: "Uitbetaling goedgekeurd",
  payout_rejected: "Uitbetaling afgewezen",
  general: "Algemeen",
};

function Notifications() {
  const { data: session } = useSession();
  const TOKEN = session?.user?.accessToken || "";
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ["notifications", currentPage],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/notification?page=${currentPage}&limit=${itemsPerPage}`,
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      );
      if (!res.ok) throw new Error("Meldingen ophalen mislukt");
      return res.json();
    },
    enabled: !!TOKEN,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/notification/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/notification/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/notification/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications = data?.data || [];
  const unreadCount = data?.meta?.unreadCount || 0;
  const total = data?.meta?.total || 0;
  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <div>
      <BreadcrumbHeader
        title="Meldingen"
        breadcrumbs={[
          { label: "Startpagina", href: "/" },
          { label: "Meldingen", href: "/notifications" },
        ]}
      />

      <div className="container mx-auto px-4 lg:px-10 py-[96px]">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Bell className="text-green-700" size={22} />
            <h2 className="text-xl font-bold text-gray-900">Meldingen</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} ongelezen
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="flex items-center gap-2 text-sm text-green-700 border border-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
            >
              <CheckCheck size={16} />
              Alles als gelezen markeren
            </button>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="px-6 py-4 border-b border-gray-100 animate-pulse">
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="py-16 text-center text-red-500 text-sm">
              Meldingen laden mislukt.
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center">
              <BellOff className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-gray-500 text-sm">Geen meldingen</p>
            </div>
          ) : (
            <div>
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`px-6 py-4 border-b border-gray-100 flex items-start gap-4 hover:bg-gray-50 transition-colors ${
                    !n.isRead ? "bg-green-50/40" : ""
                  }`}
                >
                  {/* Unread dot */}
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 ${
                        !n.isRead ? "bg-green-600" : "bg-gray-200"
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          typeColors[n.type] || typeColors.general
                        }`}
                      >
                        {typeLabels[n.type] || n.type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(n.createdAt).toLocaleDateString("nl-NL", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{n.body}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!n.isRead && (
                      <button
                        onClick={() => markReadMutation.mutate(n._id)}
                        title="Als gelezen markeren"
                        className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        <CheckCheck size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteMutation.mutate(n._id)}
                      title="Verwijderen"
                      className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-5 flex-wrap gap-3">
            <p className="text-xs text-gray-500">
              {(currentPage - 1) * itemsPerPage + 1}–
              {Math.min(currentPage * itemsPerPage, total)} van {total} meldingen
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

export default Notifications;
