"use client";

import { useState } from "react";
import { addDebt } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function DebtForm() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Debts</h2>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
          {showForm ? "Cancel" : "+ Add Debt"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardContent className="p-5">
            <form action={async (fd) => { await addDebt(fd); }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="bank">Bank Name</Label>
                  <Input id="bank" name="bank" placeholder="e.g. Maybank" required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="type">Loan Type</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Car Loan">Car Loan</SelectItem>
                      <SelectItem value="Home Loan">Home Loan</SelectItem>
                      <SelectItem value="Personal Loan">Personal Loan</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Education Loan">Education Loan</SelectItem>
                      <SelectItem value="Business Loan">Business Loan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="totalAmount">Total Amount</Label>
                  <Input id="totalAmount" name="totalAmount" type="number" placeholder="0.00" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="outstanding">Outstanding</Label>
                  <Input id="outstanding" name="outstanding" type="number" placeholder="0.00" required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="monthlyPayment">Monthly Payment</Label>
                  <Input id="monthlyPayment" name="monthlyPayment" type="number" placeholder="0.00" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input id="interestRate" name="interestRate" type="number" step="0.1" placeholder="0.0" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="nextPaymentDate">Next Payment</Label>
                  <Input id="nextPaymentDate" name="nextPaymentDate" type="date" />
                </div>
              </div>
              <Button type="submit" className="mt-4">Add</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
