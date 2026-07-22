"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BreadcrumbHeader } from "@/components/ReusableCard/SubHero";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

function SelesUploadCourse() {
  const [formData, setFormData] = useState({
    courseTitle: "",
    courseLevel: "Beginner",
    description: "",
    courseThumbnail: null as File | null,
    introductionVideo: "",
    fullCourseVideo: "",
    totalDuration: "",
    targetAudience: "",
    language: "",
    numberOfModules: "",
    uploadExtraFiles: null as File | null,
    price: "",
    discount: "",
    licenseRights: false,
  });

  const session = useSession();
  const TOKEN = session.data?.user?.accessToken || "";

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: string
  ) => {
    const file = e.target.files ? e.target.files[0] : null;
    setFormData((prev) => ({ ...prev, [fileType]: file }));
  };

  const handleCheckboxChange = (value: boolean | "indeterminate") => {
    setFormData((prev) => ({ ...prev, licenseRights: value === true }));
  };

  const handleCourseLevelChange = (value: string) => {
    setFormData((prev) => ({ ...prev, courseLevel: value }));
  };

  const handleDiscountChange = (value: string) => {
    setFormData((prev) => ({ ...prev, discount: value }));
  };

  const createCourseMutation = useMutation({
    mutationFn: async () => {
      const data = new FormData();
      data.append("title", formData.courseTitle);
      data.append("level", formData.courseLevel);
      data.append("description", formData.description);
      data.append("duration", formData.totalDuration);
      data.append("targetAudience", formData.targetAudience);
      data.append("language", formData.language);
      data.append("modules", formData.numberOfModules);
      data.append("price", formData.price);
      data.append("discount", formData.discount);

      // Files
      if (formData.courseThumbnail) {
        data.append("thumbnail", formData.courseThumbnail);
      }
      if (formData.uploadExtraFiles) {
        data.append("extraFile", formData.uploadExtraFiles);
      }

      // Videos
      if (formData.introductionVideo) {
        data.append("introductionVideo", formData.introductionVideo);
      }
      if (formData.fullCourseVideo) {
        data.append("courseVideo", formData.fullCourseVideo); // match schema
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/course`, {
        method: "POST",
        headers: { Authorization: `Bearer ${TOKEN}` }, // FormData handles content-type
        body: data,
      });

      if (!res.ok) {
        throw new Error("Cursus aanmaken mislukt");
      }
      return res.json();
    },
    onSuccess: (data) => {
      console.log("Course created successfully:", data);
      toast.success("Cursus succesvol geupload!");
      setFormData({
        courseTitle: "",
        courseLevel: "Beginner",
        description: "",
        courseThumbnail: null,
        introductionVideo: "",
        fullCourseVideo: "",
        totalDuration: "",
        targetAudience: "",
        language: "",
        numberOfModules: "",
        uploadExtraFiles: null,
        price: "",
        discount: "",
        licenseRights: false,
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Cursus aanmaken mislukt");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createCourseMutation.mutate();
  };

  return (
    <div className="min-h-screen">
      <BreadcrumbHeader
        title="Nieuwe cursus uploaden"
        breadcrumbs={[
          { label: "Startpagina", href: "/" },
          { label: "Nieuwe cursus uploaden", href: "/upload_new_course" },
        ]}
      />
      <div className="container mx-auto bg-white rounded-lg p-[96px]">
        <h1 className="text-3xl font-bold text-gray-900 mb-14 text-center">
          Nieuwe cursus uploaden
        </h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Course Title & Level */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="courseTitle">Cursusnaam</Label>
              <Input
                id="courseTitle"
                name="courseTitle"
                value={formData.courseTitle}
                onChange={handleInputChange}
                placeholder="Voer cursusnaam in"
              />
            </div>

            <div>
              <Label htmlFor="courseLevel">Niveau</Label>
              <Select
                value={formData.courseLevel}
                onValueChange={handleCourseLevelChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Gemiddeld</SelectItem>
                  <SelectItem value="Advanced">Gevorderd</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Beschrijving</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Schrijf cursusbeschrijving"
              rows={5}
            />
          </div>

          {/* Thumbnail & Intro Video */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label>Cursusvoorbeeldafbeelding</Label>
              <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-gray-400">
                <span>
                  {formData.courseThumbnail
                    ? formData.courseThumbnail.name
                    : "Geen bestand gekozen"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "courseThumbnail")}
                />
              </label>
            </div>
            <div>
              <Label htmlFor="introductionVideo">Introductievideo URL</Label>
              <Input
                id="introductionVideo"
                name="introductionVideo"
                value={formData.introductionVideo}
                onChange={handleInputChange}
                placeholder="Voer video-URL in"
              />
            </div>
          </div>

          {/* Full Course Video & Total Duration */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="fullCourseVideo">Volledige cursusvideo URL</Label>
              <Input
                id="fullCourseVideo"
                name="fullCourseVideo"
                value={formData.fullCourseVideo}
                onChange={handleInputChange}
                placeholder="Voer video-URL in"
              />
            </div>
            <div>
              <Label htmlFor="totalDuration">Totale duur</Label>
              <Input
                id="totalDuration"
                name="totalDuration"
                value={formData.totalDuration}
                onChange={handleInputChange}
                placeholder="bijv. 2 uur 30 minuten"
              />
            </div>
          </div>

          {/* Target Audience & Language */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="targetAudience">Doelgroep</Label>
              <Input
                id="targetAudience"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleInputChange}
                placeholder="Voer doelgroep in"
              />
            </div>
            <div>
              <Label htmlFor="language">Taal</Label>
              <Input
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                placeholder="Voer taal in"
              />
            </div>
          </div>

          {/* Number of Modules & Extra Files */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="numberOfModules">Aantal modules</Label>
              <Input
                id="numberOfModules"
                name="numberOfModules"
                value={formData.numberOfModules}
                onChange={handleInputChange}
                placeholder="Voer aantal in"
              />
            </div>
            <div>
              <Label>Extra bestanden uploaden</Label>
              <label className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                <span>
                  {formData.uploadExtraFiles
                    ? formData.uploadExtraFiles.name
                    : "Geen bestand gekozen"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "uploadExtraFiles")}
                />
              </label>
            </div>
          </div>

          {/* Price & Discount */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="price">Prijs</Label>
              <Input
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Voer prijs in"
              />
            </div>
            <div>
              <Label htmlFor="discount">Korting (%)</Label>
              <Select
                value={formData.discount}
                onValueChange={handleDiscountChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer korting" />
                </SelectTrigger>
                <SelectContent>
                  {["0", "5", "10", "15", "20", "25", "30"].map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* License Checkbox */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="licenseRights"
              checked={formData.licenseRights}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="licenseRights" className="cursor-pointer">
              Ik bevestig dat ik de licentierechten heb om deze cursus te uploaden
            </Label>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full mt-6">
            {createCourseMutation.isPending ? "Bezig met uploaden..." : "Cursus uploaden"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default SelesUploadCourse;
