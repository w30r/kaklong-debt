import { getDebts } from "@/app/actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

export default async function DebtDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const debts = await getDebts();
  const debt = debts.find((d) => d._id === id);

  if (!debt) notFound();

  const paidAmount = debt.totalAmount - debt.outstanding;
  const progress = debt.totalAmount > 0 ? (paidAmount / debt.totalAmount) * 100 : 0;

  const details = [
    { label: "Total Amount", value: `RM ${debt.totalAmount.toLocaleString("en-MY", { minimumFractionDigits: 2 })}` },
    { label: "Outstanding", value: `RM ${debt.outstanding.toLocaleString("en-MY", { minimumFractionDigits: 2 })}` },
    { label: "Amount Paid", value: `RM ${paidAmount.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`, highlight: "text-chart-3" },
    { label: "Monthly Payment", value: `RM ${debt.monthlyPayment.toLocaleString("en-MY", { minimumFractionDigits: 2 })}` },
    { label: "Interest Rate", value: `${debt.interestRate}%` },
    { label: "Next Payment", value: debt.nextPaymentDate },
  ];

  if (debt.createdAt) {
    details.push({ label: "Created", value: new Date(debt.createdAt).toLocaleDateString("en-MY") });
  }

  const statusVariant = (status: typeof debt.status) => {
    switch (status) {
      case "paid-off": return "default";
      case "late": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-background font-sans">
      <div className="max-w-3xl mx-auto w-full px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{debt.bank}</h1>
            <p className="text-muted-foreground mt-1">{debt.type}</p>
          </div>
          <Badge variant={statusVariant(debt.status)} className="text-sm px-3 py-1">
            {debt.status}
          </Badge>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary transition-all rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} />
              </div>
              <span className="text-sm text-muted-foreground tabular-nums">{progress.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {details.map((detail, i) => (
                <div key={detail.label} className={`flex justify-between py-3 ${i < details.length - 1 ? "border-b border-border" : ""}`}>
                  <span className="text-muted-foreground">{detail.label}</span>
                  <span className={`font-medium ${detail.highlight || "text-foreground"}`}>{detail.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
