/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  Loader2,
  Calendar,
  DollarSign,
  Briefcase,
  Globe,
  Book,
} from "lucide-react";
import { BreadcrumbHeader } from "@/components/ReusableCard/SubHero";
import { useSession } from "next-auth/react";
import { ReviewsCarousel } from "@/components/ReusableCard/CustomerReviewsCard";
import AssignmentReviewForm from "@/components/share/AssignmentReviewForm";

export default function AssignmentDetails() {
  const params = useParams();
  const assignmentId = params?.id as string;
  const session = useSession();
  const TOKEN = session.data?.user?.accessToken || "";
  const loggedUserId = session.data?.user?.id;

  // ✅ Fetch assignment details
  const { data, isLoading, isError } = useQuery({
    queryKey: ["assignmentDetails", assignmentId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/assigment/${assignmentId}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("Opdrachtdetails ophalen mislukt");
      return res.json();
    },
    enabled: !!assignmentId,
  });

  const assignment = data?.data;
  const assignmentOwnerId = assignment?.user?._id;

  // ✅ Payment Mutation
  const paymentMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/payment/assasment/${assignmentId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
      if (!res.ok) throw new Error("Betaling starten mislukt");
      return res.json();
    },
    onSuccess: (data) => {
      const url = data?.data?.url;
      if (url) {
        window.location.href = url;
      } else {
        alert("Betaal-URL niet gevonden!");
      }
    },
    onError: () => {
      alert("Betaling starten mislukt. Probeer het opnieuw.");
    },
  });

  // ✅ Handle Take Deal
  const handleTakeDeal = () => {
    if (!assignmentId) return;
    paymentMutation.mutate();
  };

  const isCreator = loggedUserId === assignmentOwnerId;

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );

  if (isError)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Opdrachtdetails laden mislukt.
      </div>
    );

  if (!assignment)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Geen opdrachtgegevens gevonden.
      </div>
    );

  return (
    <div>
      <div className="min-h-screen bg-gray-50">
        <div className="lg:pb-[96px] pb-10">
          <BreadcrumbHeader
            title="Opdrachtdetails"
            breadcrumbs={[
              { label: "Startpagina", href: "/" },
              { label: "Opdrachten", href: "/assignments" },
            ]}
          />
        </div>

        <div className="container mx-auto bg-white rounded-2xl border border-gray-200">
          <div className="relative h-[400px] w-full">
            <Image
              src={assignment.banner}
              alt={assignment.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
              <h1 className="text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">
                {assignment.title}
              </h1>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-gray-700">
              <div className="flex items-center gap-2">
                <DollarSign className="text-green-600" size={20} />
                <p>
                  <span className="font-semibold">Budget:</span> ${assignment.budget}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="text-blue-600" size={20} />
                <p>
                  <span className="font-semibold">Prijstype:</span> {assignment.priceType}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="text-purple-600" size={20} />
                <p>
                  <span className="font-semibold">Betaling:</span> {assignment.paymentMethod}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="text-orange-600" size={20} />
                <p>
                  <span className="font-semibold">Deadline:</span>{" "}
                  {new Date(assignment.deadLine).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="h-px bg-gray-200" />

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Beschrijving
              </h2>
              <p className="text-gray-700 leading-relaxed">{assignment.description}</p>
            </div>

            {assignment.uploadFile && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  Bijgevoegd bestand
                </h2>
                <a
                  href={assignment.uploadFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-green-600 hover:underline font-medium"
                >
                  Geupload bestand bekijken →
                </a>
              </div>
            )}

            <div className="pt-6">
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  assignment.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {assignment.status.toUpperCase()}
              </span>

              <div className="mt-4">
                <button
                  onClick={isCreator ? undefined : handleTakeDeal}
                  disabled={isCreator || paymentMutation.isPending}
                  className={`w-full font-semibold py-3 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-md 
                    ${
                      isCreator
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }
                  `}
                >
                  {isCreator ? (
                    "U hebt deze opdracht aangemaakt"
                  ) : paymentMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin" size={20} /> Bezig met verwerken...
                    </>
                  ) : (
                    <>
                      <Book size={20} /> Neem deze deal
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Reviews Section */}
      <div className="bg-gray-50">
        <div className="container mx-auto">
          <AssignmentReviewForm assignmentId={assignmentId} />
        </div>

        <div className="container mx-auto py-10">
          {assignment.review && assignment.review.length > 0 ? (
            <ReviewsCarousel
              reviews={assignment.review.map((r: any) => ({
                id: r._id,
                name: r.user?.firstName || "Anoniem",
                avatar: r.user?.profileImage || "/images/reviewImage.jpg",
                rating: r.rating,
                date: new Date(r.createdAt).toLocaleDateString("nl-NL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
                text: r.comment,
              }))}
              itemsPerView={3}
              showHeader={true}
              title="Opdrachtbeoordelingen"
            />
          ) : (
            <p className="text-center text-gray-500">Nog geen beoordelingen.</p>
          )}
        </div>
      </div>
    </div>
  );
}
