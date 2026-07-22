"use client";
import { BreadcrumbHeader } from "@/components/ReusableCard/SubHero";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useState } from "react";

type User = {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  profileImage: string;
};

type Earning = {
  _id: string;
  user: User;
  amount: number;
  currency: string;
  adminFree: number;
  userFree: number;
  status: string;
  paymentDate: string;
};

type ApiResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: Earning[];
};

function Earnings() {
  const { data: session } = useSession();
  const TOKEN = session?.user?.accessToken || "";

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: earningsData, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ["earnings"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/payment/seller/payments`,
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Inkomstgegevens ophalen mislukt");
      return res.json();
    },
    enabled: !!TOKEN,
  });

  const approvedEarnings = earningsData?.data.filter(
    (item) => item.status === "approved"
  ) || [];

  const totalPages = Math.ceil(approvedEarnings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedEarnings = approvedEarnings.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div>
      <BreadcrumbHeader
        title="Inkomsten"
        breadcrumbs={[
          { label: "Startpagina", href: "/" },
          { label: "Inkomsten", href: "/earnings" },
        ]}
      />

      <div className="container mx-auto px-2 lg:px-6 py-[96px]">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 p-4 border-b border-gray-200">
            <div className="w-4 h-4 bg-amber-700 rounded-sm"></div>
            <h2 className="text-base font-semibold text-gray-900">
              Inkomsten uit doorverwezen freelancers
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Doorverwezen freelancer
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Bedrag
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Administratiekosten
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Uw inkomsten
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Datum
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                      Inkomsten laden...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-red-500">
                      Gegevens laden mislukt.
                    </td>
                  </tr>
                ) : displayedEarnings.length > 0 ? (
                  displayedEarnings.map((item) => (
                    <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 flex items-center gap-2">
                        <Image
                          width={400}
                          height={400}
                          src={item.user.profileImage}
                          alt={item.user.firstName}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <div className="font-medium">
                            {item.user.firstName} {item.user.lastName || ""}
                          </div>
                          <div className="text-xs text-gray-500">{item.user.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">${item.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">${item.adminFree.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">${item.userFree.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(item.paymentDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                      Geen goedgekeurde inkomsten beschikbaar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {approvedEarnings.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
              <p className="text-xs text-gray-600">
                Weergegeven {startIndex + 1} tot{" "}
                {Math.min(startIndex + itemsPerPage, approvedEarnings.length)} of{" "}
                {approvedEarnings.length} resultaten
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
    </div>
  );
}

export default Earnings;
