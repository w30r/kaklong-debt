"use client";

import { useState } from "react";
import { addSalaryEntry } from "../actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SalaryForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async () => {
    if (!form.amount || !form.description) return;

    setSaving(true);
    const fd = new FormData();
    fd.set("amount", form.amount);
    fd.set("description", form.description);
    fd.set("date", form.date);
    await addSalaryEntry(fd);
    setSaving(false);
    setForm({
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
    router.refresh();
  };

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-lg">Add Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="flex flex-col gap-1 sm:gap-2">
            <Label htmlFor="amount">Amount (RM)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1 sm:gap-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-1 sm:gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={saving} className="mt-3 sm:mt-4 w-full sm:w-auto">
          {saving ? "Adding..." : "Add Entry"}
        </Button>
      </CardContent>
    </Card>
  );
}