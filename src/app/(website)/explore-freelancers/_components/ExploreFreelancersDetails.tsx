"use client";

import React from "react";
import { MessageCircle, Phone, Star, MapPin, Copy, Loader2 } from "lucide-react";
import Image from "next/image";
import { BreadcrumbHeader } from "@/components/ReusableCard/SubHero";
import CustomerReviews from "@/components/share/CustomerReviews";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type FreelancerUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
  businessName: string;
  location: string;
  verified: boolean;
};

function ExploreFreelancersDetails() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const freelancerId = params?.id;
  const token = session?.user?.accessToken;

  // ✅ Fetch profile
  const { data, isLoading, error } = useQuery({
    queryKey: ["freelancerDetails", freelancerId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/${freelancerId}`
      );
      if (!res.ok) throw new Error("Freelancerdetails ophalen mislukt");
      const json = await res.json();
      return json.data.user as FreelancerUser;
    },
    enabled: !!freelancerId,
  });

  // ✅ Create Conversation Mutation
  const createConversation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/conversation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ If your API needs token
          },
          body: JSON.stringify({ receiverId: freelancerId }),
        }
      );
      if (!res.ok) throw new Error("Gesprek aanmaken mislukt");
      const json = await res.json();
      return json.data.conversation;
    },
    onSuccess: () => {
      router.push("/inbox"); // ✅ Redirect to inbox
    },
  });

  const handleChatClick = () => {
    if (!token) {
      alert("Please login to start chat");
      return router.push("/login");
    }
    createConversation.mutate();
  };

  const handleContactClick = () => {
    if (!data?.email) return;
    navigator.clipboard.writeText(data.email);
    window.open(`mailto:${data.email}`, "_blank");
    alert(`E-mail gekopieerd: ${data.email}`);
  };

 if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );
  if (error)
    return <div className="min-h-screen flex items-center justify-center text-red-500">Er is iets misgegaan!</div>;

  return (
    <div className="min-h-screen">
      <BreadcrumbHeader
        title="Freelancer Details"
        breadcrumbs={[
          { label: "Startpagina", href: "/" },
          { label: "Freelancer Details", href: "/assignments" },
        ]}
      />

      <div className="py-12 sm:py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            
            {/* Image */}
            <div className="w-full lg:w-1/3 h-[250px] sm:h-[300px] md:h-[300px] lg:h-[350px] border rounded-lg overflow-hidden shadow-sm">
              <Image
                width={400}
                height={400}
                src={data?.profileImage || "/images/freelancersImage.jpg"}
                alt={`${data?.firstName} ${data?.lastName}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {data?.firstName} {data?.lastName}{" "}
                  {data?.verified && <span className="ml-2 text-green-600 font-semibold text-sm">Geverifieerd</span>}
                </h1>

                <div className="flex flex-wrap gap-2 mb-4">
                  {data?.businessName && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      {data.businessName}
                    </span>
                  )}
                  {data?.location && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {data.location}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 text-gray-600 mb-6">
                  <div className="flex items-center gap-1.5">
                    <Star size={18} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">--</span>
                    <span className="text-sm">(0 reviews)</span>
                  </div>
                  {data?.location && (
                    <div className="flex items-center gap-1.5 mt-2 sm:mt-0">
                      <MapPin size={16} />
                      <span className="text-sm">{data.location}</span>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="text-sm text-gray-500 mb-1">E-mail:</h3>
                  <span
                    onClick={handleContactClick}
                    className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium cursor-pointer hover:bg-gray-200"
                  >
                    {data?.email}
                  </span>
                </div>

                {/* ✅ Chat & Contact Buttons (same design) */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleChatClick}
                    disabled={createConversation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-full transition flex items-center justify-center gap-2"
                  >
                    {createConversation.isPending ? "Starting Chat..." : (
                      <>
                        <MessageCircle size={18} /> Chat
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleContactClick}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-full transition flex items-center justify-center gap-2"
                  >
                    <Phone size={18} /> Contact <Copy size={16} />
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-6 lg:px-8 mt-12">
          <CustomerReviews />
        </div>
      </div>
    </div>
  );
}

export default ExploreFreelancersDetails;
