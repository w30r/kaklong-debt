export interface BankDebt {
  _id: string;
  bank: string;
  type: string;
  totalAmount: number;
  outstanding: number;
  monthlyPayment: number;
  interestRate: number;
  nextPaymentDate: string;
  status: "up-to-date" | "late" | "paid-off";
  createdAt?: string;
  updatedAt?: string;
}
