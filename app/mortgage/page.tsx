import { getMortgageMonths, getAllContributions } from "./actions";
import { MortgageTable } from "./mortgage-table";
import { MortgageForm } from "./mortgage-form";
import { Card, CardContent } from "@/components/ui/card";

export default async function MortgagePage() {
  const months = await getMortgageMonths();
  const contributions = await getAllContributions();

  const totalExtraPaid = months.reduce((sum, m) => sum + m.extraAmount, 0);

  const stats = [
    { label: "Monthly Target", value: "RM 2,552.00" },
    { label: "Total Loan", value: "RM 596,558.00" },
    { label: "Outstanding", value: "RM 566,717.61" },
    { label: "Interest Rate", value: "3.8% p.a." },
    { label: "Total Extra Paid", value: `RM ${totalExtraPaid.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`, highlight: true },
  ];

  return (
    <div className="flex flex-col flex-1 bg-background font-sans">
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 pl-10 sm:pl-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Mortgage Tracker
          </h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-6 sm:mb-8 font-mono">
          {stats.map((stat) => (
            <Card key={stat.label} className={stat.highlight ? "border-chart-3 border-2" : ""}>
              <CardContent className="p-2 sm:p-5">
                <p className="text-[10px] sm:text-sm text-muted-foreground leading-tight">
                  {stat.label}
                </p>
                <p className={`text-sm sm:text-2xl font-semibold mt-0.5 sm:mt-1 truncate ${
                  stat.highlight ? "text-chart-3" : "text-foreground"
                }`}>
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end mb-4 sm:mb-6">
          <MortgageForm />
        </div>

        <MortgageTable months={months} contributions={contributions} />
      </div>
    </div>
  );
}
