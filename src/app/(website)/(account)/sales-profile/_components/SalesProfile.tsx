"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BreadcrumbHeader } from "@/components/ReusableCard/SubHero";
import { useSession } from "next-auth/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ProfileData {
  referralCode?: string;
  fullName: string;
  industry?: string; // store industry _id
  email: string;
  kvkVatNumber?: string;
  location?: string;
  overviewExperience?: string;
  specialties?: string;
  achievements?: string;
  portfolio?: string;
  profileImage?: File | null;
}

interface Industry {
  _id: string;
  name: string;
}

interface IndustryResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta: { total: number; page: number; limit: number };
  data: Industry[];
}

function SalesProfile() {
  const session = useSession();
  const TOKEN = session.data?.user?.accessToken || "";

  const [profileData, setProfileData] = useState<ProfileData>({
    referralCode: "",
    fullName: "",
    industry: "",
    email: "",
    kvkVatNumber: "",
    location: "",
    overviewExperience: "",
    specialties: "",
    achievements: "",
    portfolio: "",
    profileImage: null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      if (!TOKEN) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/profile`,
          { headers: { Authorization: `Bearer ${TOKEN}` } }
        );
        if (!res.ok) throw new Error("Profiel ophalen mislukt");
        const data = await res.json();
        const user = data.data;
        // industry may be an ObjectId string, a populated object, or old free-text
        const industryId = (() => {
          const ind = user.industry;
          if (!ind) return "";
          if (typeof ind === "object" && ind._id) return String(ind._id);
          if (typeof ind === "string" && /^[a-f\d]{24}$/i.test(ind)) return ind;
          return ""; // old free-text — let user re-select
        })();
        setProfileData({
          referralCode: "",
          fullName: user.firstName || "",
          industry: industryId,
          email: user.email || "",
          kvkVatNumber: user.kvkVatNumber || "",
          location: user.location || "",
          overviewExperience: user.overviewExperience || "",
          specialties: user.specialties || "",
          achievements: user.achievements || "",
          portfolio: user.portfolio || "",
          profileImage: null,
        });
        if (user.profileImage) setImagePreview(user.profileImage);
      } catch (err) {
        console.error(err);
      }
    }
    fetchProfile();
  }, [TOKEN]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileData((prev) => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Upload image immediately when button clicked
  const handleUploadImageClick = async () => {
    if (!profileData.profileImage)
      return alert("Selecteer eerst een afbeelding");

    const formData = new FormData();
    formData.append("profileImage", profileData.profileImage);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/profile`,
        {
          method: "PUT", // adjust if your API uses PUT
          body: formData,
          headers: { Authorization: `Bearer ${TOKEN}` },
        }
      );
      if (!res.ok) throw new Error("Afbeelding uploaden mislukt");
      const data = await res.json();
      toast.success("Afbeelding succesvol geupload!");
      if (data.profileImage) setImagePreview(data.profileImage);
      setProfileData((prev) => ({ ...prev, profileImage: null }));
    } catch (err: unknown) {
      toast.error((err as Error).message || "Fout bij het uploaden van de afbeelding");
    }
  };

  // Fetch industries
  const { data: industryData, isLoading: isIndustryLoading } = useQuery<IndustryResponse>({
    queryKey: ["industries"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/industry`
      );
      if (!res.ok) throw new Error("Industrieen ophalen mislukt");
      return res.json();
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileData) => {
      const form = new FormData();
      form.append("firstName", data.fullName);
      if (data.industry) form.append("industry", data.industry);
      form.append("email", data.email);
      if (data.kvkVatNumber) form.append("kvkVatNumber", data.kvkVatNumber);
      if (data.location) form.append("location", data.location);
      if (data.overviewExperience)
        form.append("overviewExperience", data.overviewExperience);
      if (data.specialties) form.append("specialties", data.specialties);
      if (data.achievements) form.append("achievements", data.achievements);
      if (data.portfolio) form.append("portfolio", data.portfolio);
      if (data.profileImage) form.append("profileImage", data.profileImage);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/profile`,
        {
          method: "PUT",
          body: form,
          headers: { Authorization: `Bearer ${TOKEN}` },
        }
      );
      if (!res.ok) throw new Error("Profiel bijwerken mislukt");
      return res.json();
    },
    onSuccess: () => {
      alert("Profiel succesvol bijgewerkt!");
      window.location.reload();
    },
    onError: (err) => {
      alert(err.message || "Fout bij het bijwerken van het profiel");
    },
  });

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  return (
    <div>
      <BreadcrumbHeader
        title="Profile"
        breadcrumbs={[
          { label: "Startpagina", href: "/" },
          { label: "Profile", href: "/sales-profile" },
        ]}
      />

      <div className="container mx-auto px-10 py-[96px]">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Left Side */}
          <div className="md:w-[40%] flex flex-col items-center">
            <div className="relative">
              <div className="w-40 h-40 rounded-full bg-gray-200 overflow-hidden border-4 border-gray-300 flex items-center justify-center">
                {imagePreview ? (
                  <Image
                    width={160}
                    height={160}
                    src={imagePreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-center text-5xl">👤</div>
                )}
              </div>
            </div>

            <div className="mt-4 w-full flex flex-col gap-2">
              <label className="cursor-pointer flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm w-full">
                <Upload size={16} />
                Afbeelding selecteren
                <input
                  type="file"
                  className="hidden"
                  onChange={handleImageUpload}
                  accept="image/*"
                />
              </label>

              <Button
                onClick={handleUploadImageClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg"
              >
                Afbeelding uploaden
              </Button>
            </div>

            <div className="w-full border-t border-gray-300 mt-6"></div>
            <h1 className="text-2xl font-bold text-gray-900 mt-6 text-center">
              Profielinstellingen
            </h1>
          </div>

          {/* Right Side */}
          <div className="flex-1">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Full Name */}
              <div>
                <Label htmlFor="fullName">Volledige naam</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={profileData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className="w-full"
                />
              </div>

              {/* Industry Select & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="industry">Industrie</Label>
                  <Select
                    value={profileData.industry || ""}
                    onValueChange={(value) =>
                      setProfileData((prev) => ({ ...prev, industry: value }))
                    }
                    disabled={isIndustryLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isIndustryLoading ? "Laden..." : "Selecteer industrie"} />
                    </SelectTrigger>
                    <SelectContent>
                      {industryData?.data?.length ? (
                        industryData.data.map((ind) => (
                          <SelectItem key={ind._id} value={ind._id}>
                            {ind.name}
                          </SelectItem>
                        ))
                      ) : !isIndustryLoading ? (
                        <SelectItem value="none" disabled>
                          Geen industrieën gevonden
                        </SelectItem>
                      ) : null}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    placeholder="example@gmail.com"
                  />
                </div>
              </div>

              {/* KVK/VAT & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="kvkVatNumber">KVK/btw-nummer</Label>
                  <Input
                    id="kvkVatNumber"
                    name="kvkVatNumber"
                    type="text"
                    value={profileData.kvkVatNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Locatie</Label>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    value={profileData.location}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Textareas */}
              {[
                "overviewExperience",
                "specialties",
                "achievements",
                "portfolio",
              ].map((field) => (
                <div key={field}>
                  <Label htmlFor={field} className="capitalize">
                    {field}
                  </Label>
                  <Textarea
                    id={field}
                    name={field}
                    value={profileData[field as keyof ProfileData] as string}
                    onChange={handleInputChange}
                    rows={5}
                    className="resize-none"
                  />
                </div>
              ))}

              {/* Save Button */}
              <Button
                type="submit"
                className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-full"
              >
                {updateProfileMutation.isPending ? "Opslaan..." : "Profiel opslaan"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesProfile;
