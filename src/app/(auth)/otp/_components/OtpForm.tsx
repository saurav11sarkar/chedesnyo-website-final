"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// ✅ Zod validation schema
const formSchema = z.object({
  otp: z.string().length(6, "OTP moet 6 cijfers bevatten"),
});

// ✅ Infer type from schema
type VerifyOTPFormData = z.infer<typeof formSchema>;

export default function VerifyOTPForm() {
  const router = useRouter();
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const form = useForm<VerifyOTPFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { otp: "" },
  });

  // ✅ Mutation for OTP verification
  const otpMutation = useMutation({
    mutationFn: async (bodyData: { email: string; otp: string }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/verify-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.message || "OTP-verificatie mislukt");
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "OTP succesvol geverifieerd");
      localStorage.setItem("refreshToken", data?.resetToken);
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Ongeldige OTP, probeer het opnieuw");
    },
  });

  // ✅ Submit function
  const onSubmit = (data: VerifyOTPFormData) => {
    if (!email) {
      toast.error("E-mailadres ontbreekt, OTP kan niet worden geverifieerd.");
      return;
    }
    otpMutation.mutate({ email, otp: data.otp });
  };

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    form.setValue("otp", newOtpValues.join(""));

    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtpValues = pastedData.split("");
    while (newOtpValues.length < 6) newOtpValues.push("");
    setOtpValues(newOtpValues);
    form.setValue("otp", newOtpValues.join(""));
    inputRefs.current[5]?.focus();
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 h-screen relative">
        <Image
          src="/images/cheAuthImage.png"
          alt="Professionele vrouw werkt op laptop"
          fill
          quality={100}
          className="object-cover"
          priority
        />
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 bg-gray-50">
        <Card className="w-full max-w-lg p-7 shadow-2xl rounded-2xl">
          <CardHeader>
            <div className="flex justify-center mb-2">
              <Image
                src="/images/chedsnyoLogo.png"
                alt="Chedesnyo Logo"
                width={200}
                height={200}
                className="w-[113px] h-[108px]"
              />
            </div>
            <CardTitle className="text-center text-2xl font-bold text-gray-900">
              Voer OTP in
            </CardTitle>
            <CardDescription className="text-center text-gray-600 text-sm leading-6">
              Er is een OTP naar uw e-mailadres gestuurd. Verifieer deze hieronder.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form id="verify-otp-form" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex justify-center gap-3 mb-6">
                {otpValues.map((value, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition"
                    placeholder="•"
                  />
                ))}
              </div>
              {form.formState.errors.otp && (
                <div className="text-center text-red-600 text-sm mb-4">
                  {form.formState.errors.otp.message}
                </div>
              )}
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 mt-3">
            <Button
              type="submit"
              form="verify-otp-form"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition duration-200"
              disabled={otpMutation.isPending || otpValues.join("").length !== 6}
            >
              {otpMutation.isPending ? "Bezig met verifiëren..." : "Verifiëren"}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Geen OTP ontvangen? </span>
              <button
                type="button"
                onClick={() => {
                  setOtpValues(["", "", "", "", "", ""]);
                  form.reset();
                  inputRefs.current[0]?.focus();
                }}
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                Opnieuw verzenden
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
