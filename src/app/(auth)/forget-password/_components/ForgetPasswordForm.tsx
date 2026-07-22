"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// ✅ Zod validation schema
const formSchema = z.object({
  email: z.string().email("Voer een geldig e-mailadres in."),
});

// ✅ Infer type from schema
type ForgotPasswordFormData = z.infer<typeof formSchema>;

export default function ForgotPasswordForm() {
  const router = useRouter();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  // ✅ Mutation for forgot password
  const forgotPassMutation = useMutation({
    mutationFn: async (bodyData: { email: string }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "E-mail verzenden mislukt");
      }

      return res.json();
    },
    onSuccess: (data, variables) => {
      toast.success(data.message || "OTP succesvol verzonden!");
      const encodedEmail = encodeURIComponent(variables.email);
      router.push(`/otp?email=${encodedEmail}`);
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "OTP verzenden mislukt";
      toast.error(message);
    },
  });

  // ✅ Submit function
  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPassMutation.mutate({ email: data.email });
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
            {/* Logo */}
            <div className="flex justify-center mb-2">
              <Image
                src="/images/chedsnyoLogo.png"
                alt="Chedesnyo Logo"
                width={200}
                height={200}
                className="w-[113px] h-[108px]"
              />
            </div>

            {/* Title & Description */}
            <CardTitle className="text-center text-2xl font-bold text-gray-900">
              Wachtwoord vergeten
            </CardTitle>
            <CardDescription className="text-center text-gray-600 text-sm leading-6">
              Voer het e-mailadres in dat aan uw account is gekoppeld. We sturen een eenmalig wachtwoord
              (OTP) naar uw e-mail voor verificatie.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form id="forgot-password-form" onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup className="space-y-6">
                {/* Email */}
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>E-mail</FieldLabel>
                      <Input
                        {...field}
                        placeholder="Voer uw e-mailadres in"
                        type="email"
                        className="placeholder-gray-400"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 mt-3">
            <Button
              type="submit"
              form="forgot-password-form"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition duration-200"
              disabled={forgotPassMutation.isPending}
            >
              {forgotPassMutation.isPending ? "OTP verzenden..." : "Verstuur OTP"}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Terug naar </span>
              <Link
                href="/signin"
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                inloggen
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
