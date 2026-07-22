"use client";

import React, { useState } from "react";
import { Flag, X, AlertTriangle } from "lucide-react";
import { useSession } from "next-auth/react";

type TargetType = "user" | "assignment";

interface ReportModalProps {
  targetId: string;
  targetType: TargetType;
  targetName?: string;
}

const reasons = [
  "Spam of misleidende inhoud",
  "Ongepast gedrag",
  "Fraude of oplichterij",
  "Auteursrechtschending",
  "Nep profiel",
  "Andere reden",
];

export function ReportModal({ targetId, targetType, targetName }: ReportModalProps) {
  const { data: session } = useSession();
  const TOKEN = session?.user?.accessToken || "";

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!reason) { setError("Selecteer een reden"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/report`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetId, targetType, reason, description }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Rapportage mislukt");
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setReason("");
      setDescription("");
      setError("");
    }, 300);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
      >
        <Flag size={14} />
        Rapporteer
      </button>

      {/* Backdrop + Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />

          {/* Modal panel */}
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 z-10">
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            {submitted ? (
              /* Success state */
              <div className="py-6 text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Flag className="text-green-600" size={26} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Rapport ingediend
                </h3>
                <p className="text-sm text-gray-500 mb-5">
                  Bedankt. Ons team zal uw rapport beoordelen.
                </p>
                <button
                  onClick={handleClose}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  Sluiten
                </button>
              </div>
            ) : (
              /* Form */
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="text-red-500" size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      {targetType === "user" ? "Gebruiker rapporteren" : "Opdracht rapporteren"}
                    </h3>
                    {targetName && (
                      <p className="text-sm text-gray-500 truncate">{targetName}</p>
                    )}
                  </div>
                </div>

                {/* Reason */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reden <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {reasons.map((r) => (
                      <label
                        key={r}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          reason === r
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={r}
                          checked={reason === r}
                          onChange={() => setReason(r)}
                          className="accent-green-600"
                        />
                        <span className="text-sm text-gray-700">{r}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extra toelichting (optioneel)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Beschrijf het probleem..."
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm mb-4">{error}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !reason}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Verzenden..." : "Rapporteer"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ReportModal;
