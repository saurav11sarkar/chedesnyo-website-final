"use client";
import { BreadcrumbHeader } from "@/components/ReusableCard/SubHero";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import React from "react";

// ✅ Define TypeScript types based on your API response
type Assignment = {
  _id: string;
  title: string;
  budget: string;
  status: string;
};

type Enrollment = {
  _id: string;
  user: string;
  assigment: Assignment;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  paymentDate?: string;
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
  data: Enrollment[];
};

function EnrollmentHistory() {
  const session = useSession();
    const TOKEN = session.data?.user?.accessToken || "";
  // ✅ Fetch real data
  const { data: enrollData, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ["enrollments"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/payment/my`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Add Authorization header if your API requires token
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Inschrijvingsgegevens ophalen mislukt");
      }

      return res.json();
    },
  });

  return (
    <div className="">
      {/* Breadcrumb Header */}
      <BreadcrumbHeader
        title="Inschrijvingsgeschiedenis"
        breadcrumbs={[
          { label: "Startpagina", href: "/" },
          { label: "Inschrijvingsgeschiedenis", href: "/application" },
        ]}
      />

      <div className="w-full container mx-auto px-10 py-[96px]">
        <div className="mb-6">
          <h2 className="text-lg font-normal text-gray-900">
              Uw ingeschreven cursussen
          </h2>
        </div>

        <div className="overflow-x-auto border border-gray-300">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-r border-gray-300">
                  Cursustitel
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">
                  Ingeschreven op
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-6 text-center text-gray-500 text-sm"
                  >
                    Inschrijvingsgeschiedenis laden...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-6 text-center text-red-500 text-sm"
                  >
                    Gegevens laden mislukt.
                  </td>
                </tr>
              ) : enrollData?.data && enrollData.data.length > 0 ? (
                enrollData.data.map((item) => (
                  <tr key={item._id} className="bg-gray-100">
                    <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300">
                      {item.assigment.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-6 text-center text-gray-500 text-sm"
                  >
                    Geen ingeschreven cursussen gevonden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EnrollmentHistory;
