import { getSalaryEntries } from "../actions";
import { SalaryForm } from "./salary-form";
import { SalaryTable } from "./salary-table";
import { Card, CardContent } from "@/components/ui/card";

export default async function SalaryPage() {
  const entries = await getSalaryEntries();

  const totalIncome = entries
    .filter((e) => e.amount > 0)
    .reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = entries
    .filter((e) => e.amount < 0)
    .reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalIncome + totalExpense;

  const stats = [
    {
      label: "Net Balance",
      value: `RM ${netBalance.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`,
      accent: netBalance >= 0,
    },
    {
      label: "Total Income",
      value: `RM ${totalIncome.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`,
      accent: true,
    },
    {
      label: "Total Expenses",
      value: `RM ${Math.abs(totalExpense).toLocaleString("en-MY", { minimumFractionDigits: 2 })}`,
      danger: true,
    },
  ];

  return (
    <div className="flex flex-col flex-1 bg-background font-sans">
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 pl-10 sm:pl-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Salary Tracker
          </h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8 font-mono">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-3 sm:p-5">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {stat.label}
                </p>
                <p
                  className={`text-lg sm:text-2xl font-semibold mt-1 ${
                    stat.danger
                      ? "text-destructive"
                      : stat.accent
                        ? "text-chart-3"
                        : "text-foreground"
                  }`}
                >
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-4 sm:mb-6">
          <SalaryForm />
        </div>

        <SalaryTable entries={entries} />
      </div>
    </div>
  );
}
