"use client";

import React, { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2 } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export function EditCourseModal({ courseId }: { courseId: string }) {
  const queryClient = useQueryClient();
  const session = useSession();
    const TOKEN = session.data?.user?.accessToken || "";

  const { data: courseData } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/course/${courseId}`
      );
      if (!res.ok) throw new Error("Netwerkreactie was niet in orde");
      const result = await res.json();
      return result.data;
    },
  });

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

  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(null);
  const [previewExtraFile, setPreviewExtraFile] = useState<string | null>(null);

  useEffect(() => {
    if (courseData) {
      setFormData({
        courseTitle: courseData.title || "",
        courseLevel: courseData.level || "Beginner",
        description: courseData.description || "",
        courseThumbnail: null,
        introductionVideo: courseData.introductionVideo || "",
        fullCourseVideo: courseData.courseVideo || "",
        totalDuration: courseData.duration || "",
        targetAudience: courseData.targetAudience || "",
        language: courseData.language || "",
        numberOfModules: courseData.modules?.toString() || "",
        uploadExtraFiles: null,
        price: courseData.price?.toString() || "",
        discount: courseData.discount?.toString() || "0",
        licenseRights: true,
      });
    }
  }, [courseData]);

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

    if (fileType === "courseThumbnail" && file) {
      setPreviewThumbnail(URL.createObjectURL(file));
    }

    if (fileType === "uploadExtraFiles" && file && file.type.startsWith("image/")) {
      setPreviewExtraFile(URL.createObjectURL(file));
    }
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


const updateCourseMutation = useMutation({
  mutationFn: async (data: typeof formData) => {
    const form = new FormData();
    form.append("title", data.courseTitle);
    form.append("level", data.courseLevel);
    form.append("description", data.description);
    form.append("introductionVideo", data.introductionVideo);
    form.append("courseVideo", data.fullCourseVideo);
    form.append("duration", data.totalDuration);
    form.append("targetAudience", data.targetAudience);
    form.append("language", data.language);
    form.append("modules", data.numberOfModules);
    form.append("price", data.price);
    form.append("discount", data.discount);
    form.append("licenseRights", data.licenseRights ? "true" : "false");

    if (data.courseThumbnail) form.append("thumbnail", data.courseThumbnail);
    if (data.uploadExtraFiles) form.append("extraFile", data.uploadExtraFiles);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/course/${courseId}`,
      {
        method: "PUT",
        body: form,
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );
    if (!res.ok) throw new Error("Cursus bijwerken mislukt");
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    toast.success("Cursus succesvol bijgewerkt!");

    // Close modal & reload page
    const dialog = document.querySelector('dialog') as HTMLDialogElement;
    if (dialog && dialog.open) dialog.close();
    window.location.reload();
  },
  onError: (err) => {
    toast.error(err.message || "Fout bij het bijwerken van de cursus");
  },
});



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCourseMutation.mutate(formData);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
          title="Cursus bewerken"
        >
          <Edit2 size={18} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Cursus bewerken</DialogTitle>
          <DialogDescription>
            Werk de cursusgegevens hieronder bij en verzend.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Course Title & Level */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="courseTitle">Cursus titel</Label>
              <Input
                id="courseTitle"
                name="courseTitle"
                value={formData.courseTitle}
                onChange={handleInputChange}
                placeholder="Voer cursusnaam in"
              />
            </div>
            <div>
              <Label htmlFor="courseLevel">Cursusniveau</Label>
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
              rows={5}
            />
          </div>

          {/* Course Thumbnail */}
          <div>
            <Label>Miniatuur cursus</Label>
            <div className="flex flex-col gap-2 w-full">
              {(courseData?.thumbnail || previewThumbnail) && (
                <div className="flex gap-4">
                  {courseData?.thumbnail && (
                    <Image
                      src={courseData.thumbnail}
                      alt="Huidige miniatuur"
                      width={400}
                      height={200}
                      className="w-full h-40 object-cover rounded"
                    />
                  )}
                  {previewThumbnail && (
                    <Image
                      src={previewThumbnail}
                      alt="Voorbeeld van nieuwe miniatuur"
                      width={400}
                      height={200}
                      className="w-full h-40 object-cover rounded border border-blue-500"
                    />
                  )}
                </div>
              )}
                <label className="flex items-center justify-center w-full px-4 py-3 mt-2 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-gray-400">
                <span>
                  {formData.courseThumbnail
                    ? formData.courseThumbnail.name
                    : "Kies nieuw bestand"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "courseThumbnail")}
                />
              </label>
            </div>
          </div>

          {/* Upload Extra Files */}
          <div>
              <Label>Extra bestanden uploaden</Label>
            <div className="flex flex-col gap-2 w-full">
              {(courseData?.extraFile || previewExtraFile) && (
                <div className="flex gap-4">
                  {courseData?.extraFile &&
                  (courseData.extraFile.endsWith(".png") ||
                    courseData.extraFile.endsWith(".jpg") ||
                    courseData.extraFile.endsWith(".jpeg") ||
                    courseData.extraFile.endsWith(".webp")) ? (
                    <Image
                      src={courseData.extraFile}
                      alt="Huidig extra bestand"
                      width={400}
                      height={200}
                      className="w-full h-40 object-cover rounded"
                    />
                  ) : courseData?.extraFile ? (
                    <a
                      href={courseData.extraFile}
                      target="_blank"
                      className="text-blue-600 underline"
                    >
                      Huidig bestand
                    </a>
                  ) : null}
                  {previewExtraFile && (
                    <Image
                      src={previewExtraFile}
                      alt="Voorbeeld van nieuw extra bestand"
                      width={400}
                      height={200}
                      className="w-full h-40 object-cover rounded border border-blue-500"
                    />
                  )}
                </div>
              )}
              <label className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                <span>
                  {formData.uploadExtraFiles
                    ? formData.uploadExtraFiles.name
                    : "Kies nieuw bestand"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "uploadExtraFiles")}
                />
              </label>
            </div>
          </div>

          {/* Video & Duration */}
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
                placeholder="bijv. 12 weken"
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
              />
            </div>
            <div>
              <Label htmlFor="language">Taal</Label>
              <Input
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Number of Modules */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="numberOfModules">Aantal modules</Label>
              <Input
                id="numberOfModules"
                name="numberOfModules"
                value={formData.numberOfModules}
                onChange={handleInputChange}
              />
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
            <Label htmlFor="licenseRights">
              Ik bevestig dat ik de licentierechten heb
            </Label>
          </div>

          {/* Footer */}
          <DialogFooter className="flex justify-between">
            <DialogClose asChild>
              <Button variant="outline">Annuleren</Button>
            </DialogClose>
            <Button type="submit" disabled={updateCourseMutation.isPending}>
              {updateCourseMutation.isPending ? "Opslaan..." : "Wijzigingen opslaan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
