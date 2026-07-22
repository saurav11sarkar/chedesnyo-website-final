"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Edit2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Image from "next/image";

type EditFormData = {
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

export function EditAssignmentModal({
  assignmentId,
}: {
  assignmentId: string;
}) {
  const [formData, setFormData] = useState<EditFormData>({
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

  const [open, setOpen] = useState(false); // ✅ modal open state

  const session = useSession();
  const TOKEN = session.data?.user?.accessToken || "";
  const queryClient = useQueryClient();

  // ✅ Fetch single assignment data
  const { data: singleAssignmentData, isLoading } = useQuery({
    queryKey: ["single-assignment", assignmentId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/assigment/${assignmentId}`,
        {
          headers: { Authorization: `Bearer ${TOKEN}` },
        }
      );
      if (!res.ok) throw new Error("Opdracht ophalen mislukt");
      return res.json();
    },
    enabled: !!assignmentId && !!TOKEN,
  });

  // ✅ Populate form when data is fetched
  useEffect(() => {
    if (singleAssignmentData?.data) {
      const a = singleAssignmentData.data;
      setFormData({
        banner: null,
        title: a.title || "",
        description: a.description || "",
        budget: a.budget || "",
        pricingType: a.priceType || "",
        paymentMethod: a.paymentMethod || "",
        deadline: a.deadLine
          ? new Date(a.deadLine).toISOString().split("T")[0]
          : "",
        uploadFile: null,
        showToPublic: true,
      });
    }
  }, [singleAssignmentData]);

  // ✅ Input handlers
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

  // ✅ Mutation for updating assignment
  const updateMutation = useMutation({
    mutationFn: async (data: EditFormData) => {
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

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/assigment/${assignmentId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${TOKEN}` },
          body: form,
        }
      );

      if (!res.ok) throw new Error("Opdracht bijwerken mislukt");
      return res.json();
    },
    onSuccess: (response) => {
      toast.success(response.message || "Opdracht succesvol bijgewerkt!");
      queryClient.invalidateQueries({queryKey: ["single-assignment", assignmentId]}); // ✅ refresh data
      setOpen(false); // ✅ close modal
      setTimeout(() => window.location.reload(), 500); // ✅ optional reload
    },
    onError: (error) => {
      toast.error((error as Error).message || "Fout bij het bijwerken van de opdracht");
    },
  });

  // ✅ Handle form submit
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors"
          title="Bewerken"
        >
          <Edit2 size={18} />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <p className="text-center py-10">Opdracht laden...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <DialogHeader>
              <DialogTitle>Opdracht bewerken</DialogTitle>
              <DialogDescription>
                Werk uw opdrachtgegevens bij en klik op opslaan wanneer u klaar bent.
              </DialogDescription>
            </DialogHeader>

            {/* --- Banner Upload --- */}
            <div>
              <Label>Banner</Label>
              <label className="flex items-center w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 bg-white">
                <div className="flex items-center gap-3">
                  <span className="text-gray-700 font-medium">Kies bestand</span>
                  <span className="h-5 w-px bg-gray-300"></span>
                  <span className="text-gray-500 text-sm truncate max-w-[200px]">
                    {formData.banner
                      ? formData.banner.name
                      : singleAssignmentData?.data?.banner
                      ? singleAssignmentData.data.banner.split("/").pop()
                        : "Geen bestand gekozen"}
                  </span>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleBannerUpload}
                />
              </label>

              {singleAssignmentData?.data?.banner && (
                <Image
                  width={200}
                  height={100}
                  src={singleAssignmentData.data.banner}
                  alt="banner"
                  className="mt-2 w-full h-40 object-cover rounded-md"
                />
              )}
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">Opdracht titel</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Voer opdrachtnaam in"
                className="h-[50px]"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Beschrijving</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Schrijf de opdrachtbeschrijving"
                rows={5}
              />
            </div>

            {/* Budget */}
            <div>
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                placeholder="Voer budget in"
                className="h-[50px]"
              />
            </div>

            {/* Pricing Type */}
            <div>
              <Label>Prijstype</Label>
              <Select
                value={formData.pricingType}
                onValueChange={handlePricingTypeChange}
              >
                <SelectTrigger className="h-[50px]">
                  <SelectValue placeholder="Selecteer prijstype" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Vast</SelectItem>
                  <SelectItem value="hourly">Per uur</SelectItem>
                  <SelectItem value="project">Op projectbasis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div>
              <Label>Betaalmethode</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={handlePaymentMethodChange}
              >
                  <SelectTrigger className="h-[50px]">
                  <SelectValue placeholder="Selecteer betaalmethode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Overschrijving</SelectItem>
                  <SelectItem value="card">Creditcard</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Deadline */}
            <div>
              <Label>Deadline</Label>
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
                    selected={
                      formData.deadline ? new Date(formData.deadline) : undefined
                    }
                    onSelect={(date) =>
                      setFormData((prev) => ({
                        ...prev,
                        deadline: date
                          ? date.toISOString().split("T")[0]
                          : "",
                      }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Upload File */}
            <div>
              <Label>Bestand uploaden (optioneel)</Label>
              <label className="flex items-center w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 bg-white">
                <div className="flex items-center gap-3">
                  <span className="text-gray-700 font-medium">Kies bestand</span>
                  <span className="h-5 w-px bg-gray-300"></span>
                  <span className="text-gray-500 text-sm truncate max-w-[200px]">
                    {formData.uploadFile
                      ? formData.uploadFile.name
                      : singleAssignmentData?.data?.uploadFile
                      ? singleAssignmentData.data.uploadFile.split("/").pop()
                      : "Geen bestand gekozen"}
                  </span>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>

              {singleAssignmentData?.data?.uploadFile && (
                <a
                  href={singleAssignmentData.data.uploadFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm mt-2 block"
                >
                  Bekijk bestaand bestand
                </a>
              )}
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
              <Label
                htmlFor="showToPublic"
                className="text-sm font-medium text-gray-700"
              >
                Zichtbaar voor publiek (bezoekers)
              </Label>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-full h-auto"
              >
                {updateMutation.isPending ? "Opslaan..." : "Wijzigingen opslaan"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
