export interface Payment {
  amount: number;
  date: string;
  _id?: string;
}

export interface BankDebt {
  _id: string;
  bank: string;
  type: string;
  totalAmount: number;
  remaining: number;
  monthlyPayment: number;
  interestRate: number;
  nextPaymentDate: string;
  status: "up-to-date" | "late" | "paid-off" | "pending";
  payments?: Payment[];
  createdAt?: string;
  updatedAt?: string;
}

export function calculateOutstanding(debt: BankDebt): number {
  if (debt.status === "paid-off" || debt.monthlyPayment <= 0) return 0;
  if (!debt.nextPaymentDate || debt.nextPaymentDate === "—") return 0;

  const dueDate = new Date(debt.nextPaymentDate);
  const today = new Date();

  if (today <= dueDate) return 0;

  const msPerMonth = 30 * 24 * 60 * 60 * 1000;
  const monthsOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / msPerMonth);

  const paymentsSinceDue = (debt.payments || [])
    .filter((p) => new Date(p.date) >= dueDate)
    .reduce((sum, p) => sum + p.amount, 0);

  const expected = monthsOverdue * debt.monthlyPayment;

  return Math.max(0, Math.round((expected - paymentsSinceDue) * 100) / 100);
}
