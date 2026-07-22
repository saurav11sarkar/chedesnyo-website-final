"use client"

import * as React from "react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

type FormData = {
  firstName: string
  referralCode: string
  businessName: string
  industry: string
  email: string
  kvkVatNumber: string
  password: string
  agreeToTerms: boolean
  role?: string
}

interface Industry {
  _id: string
  name: string
  createdAt: string
  updatedAt: string
  __v: number
}

interface IndustryResponse {
  statusCode: number
  success: boolean
  message: string
  meta: {
    total: number
    page: number
    limit: number
  }
  data: Industry[]
}

export default function SignupBusinessForm() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const refFromUrl = searchParams.get("ref") || ""

  const form = useForm<FormData>({
    defaultValues: {
      firstName: "",
      referralCode: refFromUrl,
      businessName: "",
      industry: "",
      email: "",
      kvkVatNumber: "",
      password: "",
      agreeToTerms: false,
    },
  })

  // ✅ Fetch industries from API
  const { data: industryData, isLoading: isIndustryLoading } = useQuery<IndustryResponse>({
    queryKey: ["industries"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/industry`)
      if (!res.ok) {
        throw new Error("Industrieen ophalen mislukt")
      }
      return res.json()
    },
  })

  // ✅ Business registration mutation
  const businessRegistrationMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Registratie mislukt")
      }

      return res.json()
    },
    onSuccess: (data) => {
      toast.success(data.message || "Registratie succesvol! Controleer uw e-mail.")
      form.reset()
      router.push("/signin")
    },
    onError: (error) => {
      toast.error(`❌ Registratie mislukt: ${error instanceof Error ? error.message : "Onbekende fout"}`)
    },
  })

  const onSubmit = (data: FormData) => {
    const { referralCode, ...rest } = data
    businessRegistrationMutation.mutate({
      ...rest,
      ref: referralCode || undefined,
      role: "business",
    } as any)
  }

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full">
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FieldGroup>
              {/* Full Name */}
              <Controller
                name="firstName"
                control={form.control}
                rules={{ required: "Volledige naam is vereist" }}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      Volledige naam <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input {...field} placeholder="Voer uw volledige naam in" />
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Referral Code */}
              <Controller
                name="referralCode"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Verwijzingscode (optioneel)</FieldLabel>
                    <Input {...field} placeholder="# # # # #" />
                  </Field>
                )}
              />

              {/* Business Name */}
              <Controller
                name="businessName"
                control={form.control}
                rules={{ required: "Bedrijfsnaam is verplicht" }}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      Bedrijfsnaam <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input {...field} placeholder="Voer uw bedrijfsnaam in" />
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* ✅ Dynamic Industry */}
              <Controller
                name="industry"
                control={form.control}
                rules={{ required: "Industrie is verplicht" }}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      Industrie <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isIndustryLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isIndustryLoading ? "Laden..." : "Selecteer industrie"} />
                      </SelectTrigger>
                      <SelectContent>
                        {industryData?.data?.length ? (
                          industryData.data.map((item: Industry) => (
                            <SelectItem key={item._id} value={item._id}>
                              {item.name}
                            </SelectItem>
                          ))
                        ) : (
                            <SelectItem disabled value="none">
                            Geen industrieën gevonden
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Email */}
              <Controller
                name="email"
                control={form.control}
                rules={{ required: "E-mail is verplicht" }}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      E-mail <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input {...field} type="email" placeholder="Voer uw e-mailadres in" />
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* KVK/VAT Number */}
              <Controller
                name="kvkVatNumber"
                control={form.control}
                rules={{ required: "KVK/btw-nummer is verplicht" }}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      KVK/BTW-nummer <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input {...field} placeholder="# # # # #" />
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Password */}
              <Controller
                name="password"
                control={form.control}
                rules={{ required: "Password is required" }}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      Wachtwoord <span className="text-red-500">*</span>
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Voer uw wachtwoord in"
                        className="pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Terms and Conditions */}
              <Controller
                name="agreeToTerms"
                control={form.control}
                rules={{ required: true }}
                render={({ field }) => (
                  <div className="flex items-center gap-2 my-4">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                    <span className="text-sm text-gray-700">
                      Ik ga akkoord met de{" "}
                      <span className="text-red-500 cursor-pointer hover:underline">
                        algemene voorwaarden
                      </span>
                    </span>
                  </div>
                )}
              />
            </FieldGroup>

            <CardFooter className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full"
                disabled={businessRegistrationMutation.isPending}
              >
                {businessRegistrationMutation.isPending ? "Registreren..." : "Registreren"}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Heeft u al een account?{" "}
                <Link href="/signin"><span className="text-blue-600 cursor-pointer hover:underline">Inloggen</span></Link>
              </div>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
