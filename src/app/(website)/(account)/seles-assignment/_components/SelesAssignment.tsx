"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BreadcrumbHeader } from "@/components/ReusableCard/SubHero";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

function SelesAssignment() {
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { data: session } = useSession();
  const TOKEN = session?.user?.accessToken || "";

  // Fetch payments
  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ["seles-assignments"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/payment/my`,
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      );
      if (!res.ok) throw new Error("Netwerkreactie was niet in orde");
      return res.json() as Promise<any>;
    },
    enabled: !!TOKEN,
  });

  // Extract only assignment payments
  const assignments = paymentsData?.data.filter((p: any) => p.assigment) || [];

  // Filter logic based on tab
  const filterAssignments = () => {
    if (activeTab === "all") return assignments;
    if (activeTab === "in-progress")
      return assignments.filter(
        (a: any) => a.status === "pending" || a.status === "processing"
      );
    if (activeTab === "completed")
      return assignments.filter((a: any) => a.status === "approved");
    if (activeTab === "cancelled")
      return assignments.filter(
        (a: any) =>
          a.status === "refunded" || a.status === "rejected" || a.status === "cancelled"
      );
    return assignments;
  };

  const filteredAssignments = filterAssignments();
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedAssignments = filteredAssignments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 rounded-full px-3 py-1 text-xs font-medium";
      case "pending":
      case "processing":
        return "bg-purple-100 text-purple-700 rounded-full px-3 py-1 text-xs font-medium";
      case "refunded":
      case "rejected":
      case "cancelled":
        return "bg-red-100 text-red-700 rounded-full px-3 py-1 text-xs font-medium";
      default:
        return "bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs font-medium";
    }
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="w-full">
      <BreadcrumbHeader
        title="Mijn opdrachten"
        breadcrumbs={[
          { label: "Startpagina", href: "/" },
          { label: "Mijn opdrachten", href: "/my-assignments" },
        ]}
      />

      <div className="container mx-auto py-[96px] px-2 lg:px-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Mijn opdrachten
        </h1>

        {/* Tabs */}
        <div className="flex gap-3 mb-6 overflow-x-auto">
          {[
            { key: "in-progress", label: "In behandeling" },
            { key: "completed", label: "Voltooid" },
            { key: "cancelled", label: "Geannuleerd" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 text-sm font-medium rounded border flex-shrink-0 ${
                activeTab === tab.key
                  ? "bg-green-50 border-green-600 text-green-600"
                  : "bg-white border-green-600 text-green-600 hover:bg-green-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="border border-gray-300 rounded-lg overflow-x-auto mb-6">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-300">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Titel</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Budget</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Geplaatst door</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-900 text-end">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">Laden...</td>
                </tr>
              ) : displayedAssignments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">Geen opdrachten gevonden.</td>
                </tr>
              ) : (
                displayedAssignments.map((assignment: any) => (
                  <tr
                    key={assignment._id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 flex flex-col gap-2">
                      {assignment?.assigment?.title || "Untitled"}
                      {assignment.status === "approved" &&
                        assignment?.assigment?.uploadFile && (
                          <a
                            href={assignment.assigment.uploadFile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline text-xs hover:text-blue-800"
                          >
                            Geupload bestand bekijken
                          </a>
                        )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${assignment?.assigment?.budget || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {assignment?.assigment?.user?.firstName || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm flex justify-end">
                      <span className={getStatusStyle(assignment.status)}>
                        {assignment.status?.toUpperCase() || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (only if items > 7) */}
        {filteredAssignments.length > 7 && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-gray-600">
              Weergegeven {startIndex + 1} tot{" "}
              {Math.min(startIndex + itemsPerPage, filteredAssignments.length)} of{" "}
              {filteredAssignments.length} resultaten
            </p>
            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-8 h-8 rounded text-sm font-medium ${
                    currentPage === i + 1
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "border border-gray-300 text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default SelesAssignment;
