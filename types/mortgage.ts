export interface MortgageMonth {
  _id: string;
  year: number;
  month: number;
  monthlyAmount: number;
  isPaidToBank: boolean;
  paidDate: string | null;
  totalCollected: number;
  extraAmount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MemberContribution {
  _id: string;
  memberName: string;
  month: number;
  year: number;
  amountPaid: number;
  paidAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const REGULAR_MEMBERS = ["syamil", "daddy", "sha", "kaklong"] as const;
export const ALL_MEMBERS = ["mama", "syamil", "daddy", "sha", "kaklong"] as const;
export const MEMBER_EMOJIS: Record<string, string> = {
  syamil: "\u{1F466}\u{1F3FB}",
  daddy: "\u{1F468}\u{1F3FB}",
  mama: "\u{1F469}\u{1F3FB}",
  sha: "\u{1F467}\u{1F3FB}",
  kaklong: "\u{1F467}\u{1F3FB}",
};
export const MONTHLY_TARGET = 2552;
export const REGULAR_SHARE = 638;

export const LOAN_AMOUNT = 596558;
export const INTEREST_RATE = 0.038;
export const CURRENT_OUTSTANDING = 566717.61;

export interface AmortizationRow {
  paymentNumber: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function buildAmortizationSchedule(
  loanAmount = LOAN_AMOUNT,
  annualRate = INTEREST_RATE,
  monthlyPayment = MONTHLY_TARGET
): AmortizationRow[] {
  const monthlyRate = annualRate / 12;
  const schedule: AmortizationRow[] = [];
  let balance = loanAmount;

  const ratio = monthlyPayment / (monthlyPayment - loanAmount * monthlyRate);
  const totalMonths = Math.round(Math.log(ratio) / Math.log(1 + monthlyRate));

  for (let i = 1; i <= totalMonths; i++) {
    const interest = balance * monthlyRate;
    let principal = monthlyPayment - interest;
    if (principal > balance) principal = balance;
    balance = Math.max(0, balance - principal);

    schedule.push({
      paymentNumber: i,
      payment: monthlyPayment,
      interest: round2(interest),
      principal: round2(principal),
      balance: round2(balance),
    });

    if (balance <= 0) break;
  }

  return schedule;
}

export function findPaymentsMade(
  schedule: AmortizationRow[],
  targetBalance: number
): number {
  let closest = 0;
  let closestDiff = Infinity;
  for (const row of schedule) {
    const diff = Math.abs(row.balance - targetBalance);
    if (diff < closestDiff) {
      closestDiff = diff;
      closest = row.paymentNumber;
    }
  }
  return closest;
}
