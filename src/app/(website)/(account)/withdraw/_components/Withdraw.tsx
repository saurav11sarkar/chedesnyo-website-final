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

interface BankAccount {
  id: string;
  name: string;
}

function Withdraw() {
  const [formData, setFormData] = useState({
    bankAccount: "",
    withdrawAmount: "",
  });

  const [bankAccounts] = useState<BankAccount[]>([
    { id: "1", name: "Account 1 - XXX1234" },
    { id: "2", name: "Account 2 - XXX5678" },
    { id: "3", name: "Account 3 - XXX9012" },
  ]);

  const handleBankAccountChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      bankAccount: value,
    }));
  };

  const handleWithdrawAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      withdrawAmount: e.target.value,
    }));
  };

  const handleAddBankAccount = () => {
    console.log("Add bank account clicked");
  };

  const handleWithdraw = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("Withdraw submitted:", formData);
  };

  return (
    <div>
      <BreadcrumbHeader
        title="Opnemen"
        breadcrumbs={[
          { label: "Startpagina", href: "/" },
          { label: "Opnemen", href: "/withdraw" },
        ]}
      />

      <div className="container mx-auto py-[96px] px-10">
        {/* Header */}
        <div className="bg-green-700 text-white px-6 py-3 rounded-t-lg font-semibold text-sm">
          Saldo opnemen
        </div>

        <div className="bg-white border border-gray-300 border-t-0 rounded-b-lg p-8 space-y-6">
          {/* Bank Accounts */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Bankrekeningen</h2>
            <Button
              onClick={handleAddBankAccount}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 text-sm"
            >
              Bankrekening toevoegen
            </Button>
          </div>

          {/* Select Bank Account */}
          <div>
            <Label htmlFor="bankAccount" className="text-sm font-medium text-gray-700 mb-2 block">
              Selecteer bankrekening
            </Label>
            <Select
              value={formData.bankAccount}
              onValueChange={handleBankAccountChange}
            >
              <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900">
                <SelectValue placeholder="Selecteer bankrekening" />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Withdraw Amount */}
          <div>
            <Label htmlFor="withdrawAmount" className="text-sm font-medium text-gray-700 mb-2 block">
              Opnamebedrag (₹)
            </Label>
            <Input
              id="withdrawAmount"
              type="text"
              value={formData.withdrawAmount}
              onChange={handleWithdrawAmountChange}
              placeholder="Voer bedrag in"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Withdraw Button */}
          <div>
            <Button
              onClick={handleWithdraw}
              className="bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-12 rounded-full h-auto text-base"
            >
              Opnemen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Withdraw;
