"use client";

import { useState } from "react";
import { addDebt } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function DebtForm() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">Debts</h2>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"} size="sm">
          {showForm ? "Cancel" : "+ Add"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-5">
            <form action={async (fd) => { await addDebt(fd); }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="flex flex-col gap-1 sm:gap-2">
                  <Label htmlFor="bank">Bank Name</Label>
                  <Input id="bank" name="bank" placeholder="e.g. Maybank" required />
                </div>
                <div className="flex flex-col gap-1 sm:gap-2">
                  <Label htmlFor="type">Loan Type</Label>
                  <Input id="type" name="type" placeholder="e.g. Car Loan" required />
                </div>
                <div className="flex flex-col gap-1 sm:gap-2">
                  <Label htmlFor="totalAmount">Total Amount</Label>
                  <Input id="totalAmount" name="totalAmount" type="number" placeholder="0.00" required />
                </div>
                <div className="flex flex-col gap-1 sm:gap-2">
                  <Label htmlFor="remaining">Remaining</Label>
                  <Input id="remaining" name="remaining" type="number" placeholder="0.00" required />
                </div>
                <div className="flex flex-col gap-1 sm:gap-2">
                  <Label htmlFor="monthlyPayment">Monthly Payment</Label>
                  <Input id="monthlyPayment" name="monthlyPayment" type="number" placeholder="0.00" />
                </div>
                <div className="flex flex-col gap-1 sm:gap-2">
                  <Label htmlFor="interestRate">Interest (%)</Label>
                  <Input id="interestRate" name="interestRate" type="number" step="0.1" placeholder="0.0" />
                </div>
                <div className="flex flex-col gap-1 sm:gap-2">
                  <Label htmlFor="nextPaymentDate">Next Payment</Label>
                  <Input id="nextPaymentDate" name="nextPaymentDate" type="date" />
                </div>
              </div>
              <Button type="submit" className="mt-3 sm:mt-4 w-full sm:w-auto">Add Debt</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
