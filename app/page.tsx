import { getDebts } from "./actions";
import { DebtForm } from "./debt-form";
import { DebtTable } from "./debt-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logout } from "./auth-actions";
import { LogOut } from "lucide-react";

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
    { label: "Active Debts", value: String(activeDebts), accent: false },
    { label: "Late / Overdue", value: String(lateDebts), danger: true },
  ];

  return (
    <div className="flex flex-col flex-1 bg-background font-sans">
      <div className="max-w-6xl mx-auto w-full px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            My Debt Dashboard
          </h1>
          <form action={logout}>
            <Button variant="ghost" size="sm">
              <LogOut className="size-4 mr-1.5" />
              Logout
            </Button>
          </form>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p
                  className={`text-2xl font-semibold mt-1 ${stat.danger ? "text-destructive" : stat.accent ? "text-chart-3" : "text-foreground"}`}
                >
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-6">
          <DebtForm />
        </div>

        <DebtTable debts={debts} />

        <div className="mt-6 text-sm text-muted-foreground">
          <p>
            Paid off: {paidOffDebts} • Active: {activeDebts} • Total commitment:
            RM{" "}
            {totalMonthly.toLocaleString("en-MY", { minimumFractionDigits: 2 })}
            /month
          </p>
        </div>
      </div>
    </div>
  );
}
