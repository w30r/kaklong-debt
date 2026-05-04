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
  outstanding: number;
  monthlyPayment: number;
  interestRate: number;
  nextPaymentDate: string;
  status: "up-to-date" | "late" | "paid-off" | "pending";
  payments?: Payment[];
  createdAt?: string;
  updatedAt?: string;
}
