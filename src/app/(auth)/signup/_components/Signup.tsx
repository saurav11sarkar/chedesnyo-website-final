"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignupBusinessForm from "./SignupBusinessForm";
import Image from "next/image";
import SignupSalesForm from "./SignupSalesForm";


export default function Signup() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:block w-1/2 h-screen relative">
        <Image
          src="/images/cheAuthImage.png"
          alt="Professionele vrouw werkt op laptop"
          fill
          className="object-cover"
          quality={100}
        />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex-1 items-center justify-center">
        <Card className="">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-center">
              <Image src="/images/chedsnyoLogo.png" alt="Chedesnyo Logo" width={200} height={200} className="w-[113px] h-[108px]" />
            </div>
            <CardTitle className="text-3xl font-bold text-center">
            Maak een account aan
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            <Tabs defaultValue="business" className="lg:w-[60%] w-[90%] mx-auto">
              <div className="mb-6">
                <Label className="text-sm font-medium mb-2 block">
            Selecteer gebruikerstype *
                </Label>
                <TabsList className="grid w-full grid-cols-2 bg-[#B0D8B0] p-1 rounded-full">
                  <TabsTrigger
                    value="business"
                    className="rounded-full data-[state=active]:bg-[#008000] data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                  Bedrijf
                  </TabsTrigger>
                  <TabsTrigger
                    value="sales"
                    className="rounded-full data-[state=active]:bg-[#008000] data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                  Salesprofessionals
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="business" className="mt-0">
                <SignupBusinessForm />
              </TabsContent>

              <TabsContent value="sales" className="mt-0">
                <SignupSalesForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
