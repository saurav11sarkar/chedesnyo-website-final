/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { MessageCircle, Phone, MapPin, Loader2 } from "lucide-react";
import Image from "next/image";
import { BreadcrumbHeader } from "@/components/ReusableCard/SubHero";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ReviewsCarousel } from "@/components/ReusableCard/CustomerReviewsCard";

type FreelancerUser = {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  profileImage?: string;
  businessName?: string;
  location?: string;
  role: string;
  verified?: boolean;
  industry?: string;
  kvkVatNumber?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  achievements?: string;
  overviewExperience?: string;
  portfolio?: string;
  specialties?: string;
  stripeAccountId?: string;
};

type ApiResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    user: FreelancerUser;
    assigments: any[];
    courses: any[];
  };
};

function FindBusinessDetails() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const freelancerId = params?.id;
  const token = session?.user?.accessToken;
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ["businessDetails", freelancerId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/${freelancerId}`
      );
      if (!res.ok) throw new Error("Freelancerdetails ophalen mislukt");
      return res.json();
    },
    enabled: !!freelancerId,
  });

  const createConversation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/conversation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ receiverId: freelancerId }),
        }
      );
      if (!res.ok) throw new Error("Gesprek aanmaken mislukt");
      const json = await res.json();
      return json.data.conversation;
    },
    onSuccess: () => {
      router.push("/inbox");
    },
  });

  const user = data?.data.user;
  const assignments = data?.data.assigments || [];
  const courses = data?.data.courses || [];

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Er is iets misgegaan!
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Gebruiker niet gevonden.
      </div>
    );

  const allReviews = [
    ...assignments.flatMap((a: any) =>
      (a.review || []).map((r: any) => ({
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
      }))
    ),
    ...courses.flatMap((c: any) =>
      (c.review || []).map((r: any) => ({
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
      }))
    ),
  ];

  const handleChatClick = () => {
    if (!token) {
      alert("Please login to start chat");
      return router.push("/login");
    }
    createConversation.mutate();
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(user.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen">
      <BreadcrumbHeader
        title="Bedrijfsdetails"
        breadcrumbs={[
          { label: "Startpagina", href: "/" },
          { label: "Bedrijfsdetails", href: "/find-business" },
        ]}
      />

      <div className="bg-gray-50 py-12 sm:py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            {/* Left Section - Image */}
            <div className="w-full lg:w-1/3 h-[200px] sm:h-[200px] md:h-[300px] lg:h-[400px] rounded-lg overflow-hidden shadow-sm">
              <Image
                width={400}
                height={400}
                src={user.profileImage || "/images/businessImage.jpg"}
                alt={user.businessName || user.firstName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right Section - Details */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {user.businessName || `${user.firstName} ${user.lastName || ""}`}{" "}
                  {user.verified && (
                    <span className="ml-2 text-green-600 font-semibold text-sm">
                      Geverifieerd
                    </span>
                  )}
                </h1>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    {user.role} {user.verified ? "(Geverifieerd)" : ""}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {user.industry || "N/A"}
                  </span>
                </div>

                {/* Location */}
                <div className="flex flex-col gap-2 mb-6">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <MapPin size={16} />
                    <span className="text-sm">{user.location || "N/A"}</span>
                  </div>
                  {user.kvkVatNumber && (
                    <p className="text-gray-600 text-sm">KVK/btw: {user.kvkVatNumber}</p>
                  )}
                </div>


                <div className="mb-6">
  <h3 className="text-sm text-gray-500 mb-1">E-mail:</h3>
  <span
    // onClick={handleContactClick}
    className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
  >
    {user.email}
  </span>
</div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <button
                    onClick={handleChatClick}
                    disabled={createConversation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-full transition flex items-center justify-center gap-2"
                  >
                    {createConversation.isPending ? "Starting Chat..." : (
                      <>
                        <MessageCircle size={18} />
                        Chat
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCopyEmail}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-full transition flex items-center justify-center gap-2"
                  >
                    <Phone size={18} />
                    {copied ? "Gekopieerd!" : user.email}
                  </button>
                </div>

                {/* Overview / Details */}
                <div className="space-y-6">
                  {user.overviewExperience && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Overzicht:</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{user.overviewExperience}</p>
                    </div>
                  )}
                  {user.achievements && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Prestaties:</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{user.achievements}</p>
                    </div>
                  )}
                  {user.specialties && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Specialisaties:</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{user.specialties}</p>
                    </div>
                  )}
                  {user.portfolio && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Portfolio:</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{user.portfolio}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Carousel */}
          <div className="mt-16">
            {allReviews.length > 0 ? (
              <ReviewsCarousel
                reviews={allReviews}
                itemsPerView={3}
                showHeader={true}
                title="Alle beoordelingen"
              />
            ) : (
              <p className="text-center text-gray-500">Nog geen beoordelingen.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FindBusinessDetails;
