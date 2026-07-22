"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { BreadcrumbHeader } from "@/components/ReusableCard/SubHero";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

type FormDataType = {
  banner: File | null;
  title: string;
  description: string;
  budget: string;
  pricingType: string;
  paymentMethod: string;
  deadline: string;
  uploadFile: File | null;
  showToPublic: boolean;
};

function PostAnAssignmentAdd() {
  const session = useSession();
  const TOKEN = session.data?.user?.accessToken || "";

  // ✅ Fetch user profile
  const { isLoading: userLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
      if (!res.ok) throw new Error("Gebruikersprofiel ophalen mislukt");
      return res.json();
    },
  });

  const [formData, setFormData] = useState<FormDataType>({
    banner: null,
    title: "",
    description: "",
    budget: "",
    pricingType: "",
    paymentMethod: "",
    deadline: "",
    uploadFile: null,
    showToPublic: true,
  });

  // ✅ Input Handlers
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, showToPublic: checked }));
  };

  const handleBannerUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFormData((prev) => ({ ...prev, banner: file }));
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFormData((prev) => ({ ...prev, uploadFile: file }));
  };

  const handlePricingTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, pricingType: value }));
  };

  const handlePaymentMethodChange = (value: string) => {
    setFormData((prev) => ({ ...prev, paymentMethod: value }));
  };

  // ✅ Mutation for posting assignment
  const postMutation = useMutation({
    mutationFn: async (data: FormDataType) => {
      const form = new FormData();
      if (data.banner) form.append("banner", data.banner);
      if (data.uploadFile) form.append("uploadFile", data.uploadFile);
      form.append("title", data.title);
      form.append("description", data.description);
      form.append("budget", data.budget);
      form.append("priceType", data.pricingType);
      form.append("paymentMethod", data.paymentMethod);
      form.append("deadLine", data.deadline);
      form.append("showToPublic", data.showToPublic.toString());

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/assigment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
        body: form,
      });

      if (!res.ok) {
        throw new Error("Opdracht plaatsen mislukt");
      }

      return res.json();
    },
    onSuccess: (response) => {
      console.log("✅ Assignment posted successfully:", response);
      toast.success(response.message || "Opdracht succesvol geplaatst!");
      setFormData({
        banner: null,
        title: "",
        description: "",
        budget: "",
        pricingType: "",
        paymentMethod: "",
        deadline: "",
        uploadFile: null,
        showToPublic: true,
      });
    },
    onError: (error) => {
      console.error("❌ Error posting assignment:", error);
      toast.error((error as Error).message || "Fout bij het plaatsen van de opdracht");
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (userLoading) {
      toast.error("Gebruikersgegevens laden. Even geduld...");
      return;
    }

    postMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen">
      <BreadcrumbHeader
        title="Plaats een opdracht"
        breadcrumbs={[
          { label: "Startpagina", href: "/" },
          { label: "Plaats een opdracht", href: "/post_an_assignment" },
        ]}
      />

      <div className="max-w-5xl mx-auto rounded-lg py-[96px] px-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Plaats een opdracht
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Banner Upload */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Banner
            </Label>
            <label className="flex items-center w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-white">
              <div className="flex items-center gap-3">
                <span className="text-gray-700 font-medium">Bestand kiezen</span>
                <span className="h-5 w-px bg-gray-300"></span>
                <span className="text-gray-500 text-sm truncate max-w-[200px]">
                  {formData.banner ? formData.banner.name : "Geen bestand gekozen"}
                </span>
              </div>
              <input type="file" className="hidden" onChange={handleBannerUpload} />
            </label>
          </div>

          {/* Assignment Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-2 block">
              Opdracht titel
            </Label>
            <Input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Voer opdragnaam in"
              className="h-[50px]"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
              Beschrijving
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Schrijf opdrachtbeschrijving"
              rows={6}
            />
          </div>

          {/* Budget */}
          <div>
            <Label htmlFor="budget" className="text-sm font-medium text-gray-700 mb-2 block">
              Budget
            </Label>
            <Input
              id="budget"
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              placeholder="Voer uw budget in"
              className="h-[50px]"
            />
          </div>

          {/* Pricing Type */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Kies uw prijstype
            </Label>
            <Select value={formData.pricingType} onValueChange={handlePricingTypeChange}>
              <SelectTrigger className="h-[50px]">
                <SelectValue placeholder="Selecteer prijstype" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Per uur</SelectItem>
                <SelectItem value="commission">Op commissie gebaseerd</SelectItem>
                <SelectItem value="hourly&fee">Per uur en commissie</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Selecteer betaalmethode
            </Label>
            <Select value={formData.paymentMethod} onValueChange={handlePaymentMethodChange}>
              <SelectTrigger className="h-[50px]">
                <SelectValue placeholder="Selecteer betaalmethode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">Overschrijving</SelectItem>
                <SelectItem value="card">Creditcard</SelectItem>
                <SelectItem value="wallet">Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Deadline */}
          <div>
            <Label htmlFor="deadline" className="text-sm font-medium text-gray-700 mb-2 block">
              Deadline
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    !formData.deadline && "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.deadline
                    ? format(new Date(formData.deadline), "PPP")
                    : "Kies een datum"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.deadline ? new Date(formData.deadline) : undefined}
                  onSelect={(date) =>
                    setFormData((prev) => ({
                      ...prev,
                      deadline: date ? date.toISOString().split("T")[0] : "",
                    }))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Upload File Optional */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Bestand uploaden (optioneel)
            </Label>
            <label className="flex items-center w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-white">
              <div className="flex items-center gap-3">
                <span className="text-gray-700 font-medium">Bestand kiezen</span>
                <span className="h-5 w-px bg-gray-300"></span>
                <span className="text-gray-500 text-sm truncate max-w-[200px]">
                  {formData.uploadFile ? formData.uploadFile.name : "Geen bestand gekozen"}
                </span>
              </div>
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>

          {/* Show to Public */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="showToPublic"
              checked={formData.showToPublic}
              onCheckedChange={(checked) =>
                handleCheckboxChange(checked as boolean)
              }
            />
            <Label htmlFor="showToPublic" className="text-sm font-medium text-gray-700 cursor-pointer">
              Zichtbaar voor publiek (bezoekers)
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={postMutation.isPending}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-full h-auto"
          >
            {postMutation.isPending ? "Bezig met indienen..." : "Indienen"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default PostAnAssignmentAdd;
