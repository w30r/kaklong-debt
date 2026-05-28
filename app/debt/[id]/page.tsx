import { getDebts } from "@/app/actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DebtEditForm } from "./edit-form";
import { ArrowLeft } from "lucide-react";

export default async function DebtDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const debts = await getDebts();
  const debt = debts.find((d) => d._id === id);

  if (!debt) notFound();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let daysUntilDue: number | null = null;
  let isOverdue = false;
  if (debt.nextPaymentDate && debt.nextPaymentDate !== "—") {
    const dueDate = new Date(debt.nextPaymentDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    daysUntilDue = Math.round(diffTime / (1000 * 60 * 60 * 24));
    isOverdue = daysUntilDue < 0;
  }

  return (
    <div className="flex flex-col flex-1 bg-background font-sans">
      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>

        {daysUntilDue !== null && (
          <div
            className={`mb-4 px-4 py-2 rounded-lg text-sm font-medium border ${
              isOverdue
                ? "bg-destructive/10 text-destructive border-destructive/20"
                : daysUntilDue === 0
                  ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                  : "bg-primary/5 text-primary border-primary/20"
            }`}
          >
            {isOverdue
              ? `${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? "s" : ""} overdue`
              : daysUntilDue === 0
                ? "Due today"
                : `${daysUntilDue} day${daysUntilDue !== 1 ? "s" : ""} until due`}
          </div>
        )}

        <DebtEditForm debt={debt} />
      </div>
    </div>
  );
}
