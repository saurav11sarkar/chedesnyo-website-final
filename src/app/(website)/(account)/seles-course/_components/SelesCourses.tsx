"use client";
import React, { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { BreadcrumbHeader } from "@/components/ReusableCard/SubHero";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { EditCourseModal } from "@/components/Dialog/EditCourseModal";
import { DeleteModal } from "@/components/Dialog/DeleteModal";
import { toast } from "sonner";

interface Course {
  _id: string;
  title: string;
  level: string;
  description: string;
  thumbnail: string;
  introductionVideo: string;
  courseVideo: string;
  duration: string;
  targetAudience: string;
  language: string;
  modules: number;
  extraFile: string;
  price: number;
  discount: number;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CoursesApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta: {
    total: number;
    page: number;
    limit: number;
  };
  data: Course[];
}

function SelesCourses() {
  const session = useSession();
  const TOKEN = session.data?.user?.accessToken || "";
  const queryClient = useQueryClient();

  const { data: coursesData, isLoading, isError } = useQuery<CoursesApiResponse>({
    queryKey: ["coursesData"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/course/my-course`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      if (!res.ok) throw new Error("Netwerkreactie was niet in orde");
      return res.json();
    },
  });

  const courses = coursesData?.data || [];

  // ------------------ DELETE ------------------
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/course/${courseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      if (!res.ok) throw new Error("Cursus verwijderen mislukt");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["coursesData"]});
      setDeleteModalOpen(false);
      setSelectedCourseId(null);
      toast.success("Cursus succesvol verwijderd!");
    },
    onError: (err) => {
      toast.error(err.message || "Fout bij het verwijderen van de cursus");
    },
  });

  const handleDeleteClick = (courseId: string) => {
    setSelectedCourseId(courseId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedCourseId) deleteMutation.mutate(selectedCourseId);
  };

  return (
    <div>
      <BreadcrumbHeader
        title="Mijn cursussen"
        breadcrumbs={[
          { label: "Startpagina", href: "/" },
          { label: "Mijn cursussen", href: "/course" },
        ]}
      />

      <div className="w-full px-6 container mx-auto py-[96px]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mijn cursussen</h1>
        </div>

        <div className="mb-6 flex justify-end">
          <Link href="/upload_new_course">
            <button className="flex items-center gap-2 bg-[#008000] text-white px-4 py-2 rounded-lg hover:bg-[#095509] transition-colors font-medium">
              <Plus size={20} />
              Nieuwe cursus uploaden
            </button>
          </Link>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nr.</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Cursustitel</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Datum</th>
                <th className="pr-10 py-4 text-end text-sm font-semibold text-gray-700">Actie</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">Cursussen laden...</td>
                </tr>
              )}

              {isError && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-red-500">Cursussen laden mislukt.</td>
                </tr>
              )}

              {!isLoading && !isError && courses.map((course, index) => (
                <tr key={course._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{course.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{new Date(course.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm flex items-end justify-end">
                    <div className="flex items-center gap-3">
                      <EditCourseModal courseId={course._id} />
                      <button
                        className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
                        title="Verwijderen"
                        onClick={() => handleDeleteClick(course._id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!isLoading && !isError && courses.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">Geen cursussen gevonden.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default SelesCourses;
