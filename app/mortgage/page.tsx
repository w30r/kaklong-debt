import { getMortgageMonths, getAllContributions } from "./actions";
import { MortgageTable } from "./mortgage-table";
import { MortgageForm } from "./mortgage-form";
import { BackfillButton } from "./backfill-button";
import {
  LOAN_AMOUNT,
  MONTHLY_TARGET,
  CURRENT_OUTSTANDING,
  buildAmortizationSchedule,
  findPaymentsMade,
} from "@/types/mortgage";

export default async function MortgagePage() {
  const months = await getMortgageMonths();
  const contributions = await getAllContributions();

  const schedule = buildAmortizationSchedule();
  const paymentsMade = findPaymentsMade(schedule, CURRENT_OUTSTANDING);

  const lastPayment = schedule[paymentsMade - 1];
  const totalPaid = paymentsMade * MONTHLY_TARGET;
  const principalPaid = LOAN_AMOUNT - lastPayment.balance;
  const interestPaid = totalPaid - principalPaid;
  const progressPct = (principalPaid / LOAN_AMOUNT) * 100;

  const payoffRow = schedule.find((r) => r.balance <= 0) || schedule[schedule.length - 1];
  const remainingPayments = payoffRow.paymentNumber - paymentsMade;
  const payoffDate = new Date(
    Math.floor((2026 * 12 + 5 + remainingPayments - 1) / 12),
    ((2026 * 12 + 5 + remainingPayments - 1) % 12) + 0
  );

  return (
    <div className="flex flex-col flex-1 bg-background font-sans">
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 pl-10 sm:pl-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Mortgage Tracker
          </h1>
        </div>

        <div className="flex justify-between items-center mb-4 sm:mb-6">
          {months.length <= 1 && <BackfillButton />}
          <div className={months.length <= 1 ? "" : "ml-auto"}>
            <MortgageForm />
          </div>
        </div>

        <MortgageTable
          months={months}
          contributions={contributions}
          amortization={{
            loanAmount: LOAN_AMOUNT,
            currentOutstanding: lastPayment.balance,
            payoffDate,
            principalPaid,
            interestPaid,
            paymentsMade,
            totalPayments: schedule.length,
            progressPct,
          }}
        />
      </div>
    </div>
  );
}
