"use client";

import { useState } from "react";
import { BankDebt, Payment } from "@/types/bank-debt";
import {
  updateDebt,
  markAsPaidOff,
  deleteDebt,
  recordPayment,
  deletePayment,
} from "@/app/actions";
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
import { Pencil, Trash2, Loader2, Plus, X } from "lucide-react";

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
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [recording, setRecording] = useState(false);
  const [deletingPayment, setDeletingPayment] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [form, setForm] = useState({
    bank: debt.bank,
    type: debt.type,
    totalAmount: debt.totalAmount.toString(),
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
      monthlyPayment: debt.monthlyPayment.toString(),
      interestRate: debt.interestRate.toString(),
      nextPaymentDate: debt.nextPaymentDate === "—" ? "" : debt.nextPaymentDate,
      status: debt.status,
    });
    setEditing(false);
  };

  const handleRecordPayment = async () => {
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) return;

    setRecording(true);
    const fd = new FormData();
    fd.set("amount", paymentForm.amount);
    fd.set("date", paymentForm.date);
    await recordPayment(debt._id, fd);
    setRecording(false);
    setShowPaymentForm(false);
    setPaymentForm({
      amount: "",
      date: new Date().toISOString().split("T")[0],
    });
    router.refresh();
  };

  const handleDeletePayment = async (paymentDate: string) => {
    setDeletingPayment(paymentDate);
    await deletePayment(debt._id, paymentDate);
    setDeletingPayment(null);
    router.refresh();
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

  const payments = debt.payments || [];

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
                readOnly
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                This value is calculated from recorded payments and cannot be changed.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label>Outstanding</Label>
              <div className="text-lg font-medium">
                RM{" "}
                {debt.outstanding.toLocaleString("en-MY", {
                  minimumFractionDigits: 2,
                })}
              </div>
              <p className="text-sm text-muted-foreground">
                Record payments below to update the outstanding balance
              </p>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="pt-4 sm:pt-6">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1 uppercase tracking-wider font-medium">
              Outstanding
            </p>
            <p className="text-xl sm:text-2xl font-bold text-destructive tabular-nums">
              RM{" "}
              {debt.outstanding.toLocaleString("en-MY", {
                minimumFractionDigits: 2,
              })}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4 sm:pt-6">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1 uppercase tracking-wider font-medium">
              Monthly
            </p>
            <p className="text-xl sm:text-2xl font-bold text-primary tabular-nums">
              RM{" "}
              {debt.monthlyPayment.toLocaleString("en-MY", {
                minimumFractionDigits: 2,
              })}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="pt-4 sm:pt-6">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1 uppercase tracking-wider font-medium">
              Next Date
            </p>
            <p className="text-xl sm:text-2xl font-bold tabular-nums">
              {debt.nextPaymentDate && debt.nextPaymentDate !== "—"
                ? new Date(debt.nextPaymentDate).toLocaleDateString("en-MY", {
                    day: "2-digit",
                    month: "short",
                  })
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pay-off Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-chart-3 transition-all rounded-full"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <span className="text-sm font-bold text-chart-3 tabular-nums">
              {progress.toFixed(1)}%
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Additional Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {[
              {
                label: "Original Total Amount",
                value: `RM ${debt.totalAmount.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`,
              },
              {
                label: "Total Amount Paid",
                value: `RM ${paidAmount.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`,
                highlight: true,
              },
              { label: "Interest Rate", value: `${debt.interestRate}%` },
              {
                label: "Next Payment (Full Date)",
                value: debt.nextPaymentDate && debt.nextPaymentDate !== "—"
                  ? new Date(debt.nextPaymentDate).toLocaleDateString("en-MY")
                  : "-",
              },
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

      {debt.status !== "paid-off" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Record Payment</CardTitle>
          </CardHeader>
          <CardContent>
            {showPaymentForm ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="paymentAmount">Payment Amount (RM)</Label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={paymentForm.amount}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          amount: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="paymentDate">Payment Date</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={paymentForm.date}
                      onChange={(e) =>
                        setPaymentForm({ ...paymentForm, date: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleRecordPayment} disabled={recording}>
                    {recording ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    Record Payment
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPaymentForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setShowPaymentForm(true)}>
                <Plus className="size-4 mr-2" />
                Add Payment
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {payments.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {payments.map((payment: Payment, i: number) => (
                <div
                  key={i}
                  className={`flex items-center justify-between py-3 ${i < payments.length - 1 ? "border-b border-border" : ""}`}
                >
                  <span className="text-muted-foreground">
                    {new Date(payment.date).toLocaleDateString("en-MY", {
                      weekday: "short",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      RM{" "}
                      {payment.amount.toLocaleString("en-MY", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    {debt.status !== "paid-off" && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDeletePayment(payment.date)}
                        disabled={deletingPayment === payment.date}
                      >
                        {deletingPayment === payment.date ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <X className="size-4 text-muted-foreground hover:text-destructive" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
