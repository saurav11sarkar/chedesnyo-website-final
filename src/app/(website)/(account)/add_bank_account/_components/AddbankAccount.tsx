"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BreadcrumbHeader } from "@/components/ReusableCard/SubHero";

interface Bank {
  id: string;
  name: string;
}

function AddbankAccount() {
  const [formData, setFormData] = useState({
    country: "UK",
    bankName: "",
    sortCode: "",
    accountNumber: "",
  });

  const [banks] = useState<Bank[]>([
    { id: "1", name: "Bank A" },
    { id: "2", name: "Bank B" },
    { id: "3", name: "Bank C" },
    { id: "4", name: "Bank D" },
  ]);

  // Typing value as string
  const handleCountryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      country: value,
    }));
  };

  const handleBankNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      bankName: value,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("Bank account saved:", formData);
  };
 
  return (
    <div className="min-h-screen">
      {/* Breadcrumb Header */}
      <BreadcrumbHeader
        title="Bankrekening toevoegen"
        breadcrumbs={[
          { label: "Startpagina", href: "/" },
          { label: "Bankrekening toevoegen", href: "/add_bank_account" },
        ]}
      />
      <div className="container mx-auto py-[96px] px-10">
        {/* Header */}
        <div className="bg-green-700 text-white px-6 py-3 rounded-t-lg font-semibold text-sm">
          Bankrekening toevoegen
        </div>

        {/* Main Content */}
        <div className="bg-white border border-gray-300 border-t-0 rounded-b-lg p-8 space-y-6">
          {/* Country */}
          <div>
            <Label
              htmlFor="country"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              Land
            </Label>
            <div className="relative flex items-center gap-3">
              <Select
                value={formData.country}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-900">
                  <SelectValue placeholder="Selecteer land" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UK">UK</SelectItem>
                  <SelectItem value="US">US</SelectItem>
                  <SelectItem value="CA">CA</SelectItem>
                  <SelectItem value="AU">AU</SelectItem>
                </SelectContent>
              </Select>
              <div className="w-8 h-8 flex items-center justify-center">
                <span className="text-2xl">🇬🇧</span>
              </div>
            </div>
          </div>

          {/* Bank Name */}
          <div>
            <Label
              htmlFor="bankName"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              Banknaam
            </Label>
            <Select
              value={formData.bankName}
              onValueChange={handleBankNameChange}
            >
              <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900">
                <SelectValue placeholder="Bank" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.name}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Code */}
          <div>
            <Label
              htmlFor="sortCode"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              Sorteercode
            </Label>
            <Input
              id="sortCode"
              type="text"
              name="sortCode"
              value={formData.sortCode}
              onChange={handleInputChange}
              placeholder="000000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Account Number */}
          <div>
            <Label
              htmlFor="accountNumber"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              Rekeningnummer
            </Label>
            <Input
              id="accountNumber"
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleInputChange}
              placeholder="........................."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button
              onClick={handleSave}
              className="bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-8 rounded-full h-auto text-sm"
            >
              Opslaan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddbankAccount;
