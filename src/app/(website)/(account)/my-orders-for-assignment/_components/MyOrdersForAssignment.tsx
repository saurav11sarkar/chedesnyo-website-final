"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BreadcrumbHeader } from "@/components/ReusableCard/SubHero";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

function MyOrders() {
  const [activeTab, setActiveTab] = useState("in-progress");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const session = useSession();
  const TOKEN = session.data?.user?.accessToken || "";
  const queryClient = useQueryClient();

  // ✅ Fetch orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/payment/my/all`,
        {
          headers: { Authorization: `Bearer ${TOKEN}` },
        }
      );
      if (!res.ok) throw new Error("Netwerkreactie was niet in orde");
      return res.json() as Promise<any>;
    },
  });

  // ✅ Approve Order
  const { mutate: updateStatus } = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: string }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/payment/assasment/approve/${orderId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!res.ok) throw new Error("Status bijwerken mislukt");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Bestelstatus bijgewerkt!");
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
    onError: () => toast.error("Status bijwerken mislukt"),
  });

  // ✅ Reject Order
  const { mutate: updateStatusRejected } = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: string }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/payment/assasment/reject/${orderId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!res.ok) throw new Error("Status bijwerken mislukt");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Bestelstatus bijgewerkt!");
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
    onError: () => toast.error("Status bijwerken mislukt"),
  });

  // ✅ Filter Assignment Orders
  const filterOrders = () => {
    if (!ordersData?.data) return [];
    const orders = ordersData.data.filter((order: any) => order.assigment);
    
    if (activeTab === "in-progress")
      return orders.filter((o: any) => o.status === "pending" || o.status === "processing");

    if (activeTab === "completed")
      return orders.filter((o: any) => o.status === "approved");

    if (activeTab === "cancelled")
      return orders.filter((o: any) => o.status === "refunded" || o.status === "cancelled");

    return orders;
  };

  const filteredOrders = filterOrders();
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const showPagination = filteredOrders.length > 7; // ✅ Show only if orders > 7
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 rounded-full px-3 py-1 text-xs font-medium";
      case "pending":
      case "processing":
        return "bg-purple-100 text-purple-700 rounded-full px-3 py-1 text-xs font-medium";
      case "refunded":
      case "cancelled":
        return "bg-red-100 text-red-700 rounded-full px-3 py-1 text-xs font-medium";
      default:
        return "bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs font-medium";
    }
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    if (newStatus === "approved") updateStatus({ orderId, newStatus });
    if (newStatus === "rejected") updateStatusRejected({ orderId, newStatus });
  };

  return (
    <div className="w-full">
      <BreadcrumbHeader
        title="Mijn bestelgeschiedenis"
        breadcrumbs={[
          { label: "Startpagina", href: "/" },
          { label: "Mijn bestelgeschiedenis", href: "/my-orders" },
        ]}
      />

      <div className="container lg:px-6 px-2 mx-auto py-[96px]">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">Mijn opdrachtbestellingen</h1>

        {/* ✅ Tabs */}
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
              className={`px-4 py-2 text-sm font-medium rounded border whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.key
                  ? "bg-green-50 border-green-600 text-green-600"
                  : "bg-white border-green-600 text-green-600 hover:bg-green-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ✅ Orders Table */}
        <div className="border border-gray-300 rounded-lg overflow-x-auto mb-6">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-300">
                <th className="px-4 lg:px-6 py-3 text-left text-sm font-medium text-gray-900">Opdracht</th>
                <th className="px-4 lg:px-6 py-3 text-left text-sm font-medium text-gray-900">Budget</th>
                <th className="px-4 lg:px-6 py-3 text-left text-sm font-medium text-gray-900">Datum</th>
                <th className="px-4 lg:px-6 py-3 text-sm font-medium text-gray-900 text-end">Actie</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">Laden...</td>
                </tr>
              ) : displayedOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">Geen opdrachtbestellingen gevonden.</td>
                </tr>
              ) : (
                displayedOrders.map((order: any) => {
                  const asg = order.assigment;
                  return (
                    <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-4 lg:px-6 py-4 text-sm">{asg?.title || "--"}</td>
                      <td className="px-4 lg:px-6 py-4 text-sm">{asg?.budget ? `$${asg.budget}` : "--"}</td>
                      <td className="px-4 lg:px-6 py-4 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 lg:px-6 py-4 text-sm flex justify-end items-center gap-2 flex-wrap">
                        <span className={getStatusStyle(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>

                        {order.status === "pending" && (
                          <select
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                            defaultValue=""
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          >
                            <option value="" disabled>Selecteer</option>
                            <option value="approved">Goedgekeurd</option>
                            <option value="rejected">Afgewezen</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ Pagination (Visible only if >7 orders) */}
        {showPagination && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-gray-600">
              Weergegeven {startIndex + 1} tot {Math.min(startIndex + itemsPerPage, filteredOrders.length)} van {filteredOrders.length} resultaten
            </p>

            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
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
                className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
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

export default MyOrders;
