"use client";

import { useState } from "react";
import { BankDebt } from "@/types/bank-debt";
import { updateDebt, markAsPaidOff, deleteDebt } from "@/app/actions";
import { useRouter } from "next/navigation";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Loader2 } from "lucide-react";

interface DebtEditFormProps {
  debt: BankDebt;
}

const loanTypes = [
  "Car Loan",
  "Home Loan",
  "Personal Loan",
  "Credit Card",
  "Education Loan",
  "Business Loan",
];

export function DebtEditForm({ debt }: DebtEditFormProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    bank: debt.bank,
    type: debt.type,
    totalAmount: debt.totalAmount.toString(),
    outstanding: debt.outstanding.toString(),
    monthlyPayment: debt.monthlyPayment.toString(),
    interestRate: debt.interestRate.toString(),
    nextPaymentDate: debt.nextPaymentDate === "—" ? "" : debt.nextPaymentDate,
    status: debt.status,
  });

  const handleSave = async () => {
    setSaving(true);
    const fd = new FormData();
    fd.set("bank", form.bank);
    fd.set("type", form.type);
    fd.set("totalAmount", form.totalAmount);
    fd.set("outstanding", form.outstanding);
    fd.set("monthlyPayment", form.monthlyPayment);
    fd.set("interestRate", form.interestRate);
    fd.set("nextPaymentDate", form.nextPaymentDate || "—");
    fd.set("status", form.status);
    await updateDebt(debt._id, fd);
    setSaving(false);
    setEditing(false);
    router.refresh();
  };

  const handleCancel = () => {
    setForm({
      bank: debt.bank,
      type: debt.type,
      totalAmount: debt.totalAmount.toString(),
      outstanding: debt.outstanding.toString(),
      monthlyPayment: debt.monthlyPayment.toString(),
      interestRate: debt.interestRate.toString(),
      nextPaymentDate: debt.nextPaymentDate === "—" ? "" : debt.nextPaymentDate,
      status: debt.status,
    });
    setEditing(false);
  };

  const handlePaidOff = async () => {
    await markAsPaidOff(debt._id);
    router.refresh();
  };

  const handleDelete = async () => {
    setDeleting(true);
    await deleteDebt(debt._id);
    router.push("/");
  };

  const statusVariant = (status: BankDebt["status"]) => {
    switch (status) {
      case "paid-off":
        return "default";
      case "late":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const paidAmount = debt.totalAmount - debt.outstanding;
  const progress =
    debt.totalAmount > 0 ? (paidAmount / debt.totalAmount) * 100 : 0;

  if (editing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Debt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="bank">Bank Name</Label>
              <Input
                id="bank"
                value={form.bank}
                onChange={(e) => setForm({ ...form, bank: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="type">Loan Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => v && setForm({ ...form, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {loanTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="totalAmount">Total Amount</Label>
              <Input
                id="totalAmount"
                type="number"
                value={form.totalAmount}
                onChange={(e) =>
                  setForm({ ...form, totalAmount: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="outstanding">Outstanding</Label>
              <Input
                id="outstanding"
                type="number"
                value={form.outstanding}
                onChange={(e) =>
                  setForm({ ...form, outstanding: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="monthlyPayment">Monthly Payment</Label>
              <Input
                id="monthlyPayment"
                type="number"
                value={form.monthlyPayment}
                onChange={(e) =>
                  setForm({ ...form, monthlyPayment: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.1"
                value={form.interestRate}
                onChange={(e) =>
                  setForm({ ...form, interestRate: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="nextPaymentDate">Next Payment Date</Label>
              <Input
                id="nextPaymentDate"
                type="date"
                value={form.nextPaymentDate}
                onChange={(e) =>
                  setForm({ ...form, nextPaymentDate: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    status: v as BankDebt["status"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="up-to-date">Up to Date</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="paid-off">Paid Off</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            Save
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {debt.bank}
          </h1>
          <p className="text-muted-foreground mt-1">{debt.type}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant(debt.status)} className="text-sm">
            {debt.status}
          </Badge>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setEditing(true)}
          >
            <Pencil className="size-4" />
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all rounded-full"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground tabular-nums">
              {progress.toFixed(1)}%
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {[
              {
                label: "Total Amount",
                value: `RM ${debt.totalAmount.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`,
              },
              {
                label: "Outstanding",
                value: `RM ${debt.outstanding.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`,
              },
              {
                label: "Amount Paid",
                value: `RM ${paidAmount.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`,
                highlight: true,
              },
              {
                label: "Monthly Payment",
                value: `RM ${debt.monthlyPayment.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`,
              },
              { label: "Interest Rate", value: `${debt.interestRate}%` },
              { label: "Next Payment", value: debt.nextPaymentDate },
              debt.createdAt
                ? {
                    label: "Created",
                    value: new Date(debt.createdAt!).toLocaleDateString(
                      "en-MY",
                    ),
                  }
                : null,
            ]
              .filter(Boolean)
              .map((detail, i, arr) => (
                <div
                  key={detail!.label}
                  className={`flex justify-between py-3 ${i < arr.length - 1 ? "border-b border-border" : ""}`}
                >
                  <span className="text-muted-foreground">{detail!.label}</span>
                  <span
                    className={`font-medium ${detail!.highlight ? "text-chart-3" : "text-foreground"}`}
                  >
                    {detail!.value}
                  </span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        {debt.status !== "paid-off" && (
          <Button variant="default" onClick={handlePaidOff}>
            Mark as Paid Off
          </Button>
        )}
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          Delete
        </Button>
      </div>
    </>
  );
}
