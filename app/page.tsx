import { getDebts } from "./actions";
import { DebtForm } from "./debt-form";
import { DebtTable } from "./debt-table";
import { Card, CardContent } from "@/components/ui/card";

export default async function Home() {
  const debts = await getDebts();

  const totalDebt = debts.reduce((sum, d) => sum + d.outstanding, 0);
  const totalDebtBebetul = debts.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalMonthly = debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
  const activeDebts = debts.filter((d) => d.status !== "paid-off").length;
  const paidOffDebts = debts.filter((d) => d.status === "paid-off").length;
  const lateDebts = debts.filter((d) => d.status === "late").length;

  const stats = [
    {
      label: "Total Outstanding",
      value: `RM ${totalDebt.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`,
      accent: false,
    },
    {
      label: "Total Debt",
      value: `RM ${totalDebtBebetul.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`,
      accent: false,
    },
    {
      label: "Monthly Commitment",
      value: `RM ${totalMonthly.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`,
      accent: true,
    },
    { label: "Late / Overdue", value: String(lateDebts), danger: true },
  ];

  return (
    <div className="flex flex-col flex-1 bg-background font-sans">
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight pl-10 sm:pl-0">
            Debt Tracker
          </h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8 font-mono">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-3 sm:p-5">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {stat.label}
                </p>
                <p
                  className={`text-lg sm:text-2xl font-semibold mt-1 ${stat.danger ? "text-destructive" : stat.accent ? "text-chart-3" : "text-foreground"}`}
                >
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-4 sm:mb-6">
          <DebtForm />
        </div>

        <DebtTable debts={debts} />

        <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-muted-foreground text-center">
          <p>
            Paid off: {paidOffDebts} • Active: {activeDebts} • Total: RM{" "}
            {totalMonthly.toLocaleString("en-MY", { minimumFractionDigits: 2 })}
            /month
          </p>
        </div>
      </div>
    </div>
  );
}
