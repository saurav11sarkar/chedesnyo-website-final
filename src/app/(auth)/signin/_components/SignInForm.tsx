"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";

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
import Link from "next/link";

// ✅ Zod validation schema
const formSchema = z.object({
  email: z.string().email("Voer een geldig e-mailadres in."),
  password: z.string().min(6, "Wachtwoord moet minimaal 6 tekens bevatten."),
  rememberMe: z.boolean().optional(),
});

// ✅ Infer type from schema
type SignInFormData = z.infer<typeof formSchema>;

export default function SignInForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // ✅ Submit function with toast fix
  const onSubmit = async (data: SignInFormData) => {
    try {
      setIsLoading(true);

      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!res) throw new Error("Inloggen mislukt!");

      if (res.error) {
        throw new Error(res.error);
      }

      // Show toast before redirect
      toast.success("Succesvol ingelogd!");

      // Short delay so toast is visible
      setTimeout(() => {
        router.push("/"); // redirect after toast
      }, 500);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : String(err) || "Inloggen mislukt!";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
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
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-gray-50">
        <Card className="w-full max-w-lg p-5 rounded-2xl shadow-[0px_0px_32px_0px_#00000014]">
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
              Welkom terug!
            </CardTitle>
            <CardDescription className="text-center text-gray-500">
              Meld u aan om toegang te krijgen
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form id="signin-form" onSubmit={form.handleSubmit(onSubmit)}>
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

                {/* Password */}
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Wachtwoord</FieldLabel>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="Voer uw wachtwoord in"
                          type={showPassword ? "text" : "password"}
                          className="placeholder-gray-400 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Remember Me */}
                <Controller
                  name="rememberMe"
                  control={form.control}
                  render={({ field }) => (
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="remember"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="w-4 h-4 accent-green-600 rounded cursor-pointer"
                        />
                        <label
                          htmlFor="remember"
                          className="ml-2 text-sm text-gray-600 cursor-pointer"
                        >
                          Onthoud mij
                        </label>
                      </div>
                        <Link
                        href="/forget-password"
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Wachtwoord vergeten?
                      </Link>
                    </div>
                  )}
                />
              </FieldGroup>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 mt-3">
            <Button
              type="submit"
              form="signin-form"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Aan het inloggen..." : "Inloggen"}
            </Button>

            <p className="text-sm text-gray-600 text-center">
              Nog geen account?{" "}
              <Link
                href="/signup"
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                Aanmelden
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
