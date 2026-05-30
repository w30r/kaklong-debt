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

export const REGULAR_MEMBERS = ["angah", "daddy", "sha", "kaklong"] as const;
export const ALL_MEMBERS = ["mama", "angah", "daddy", "sha", "kaklong"] as const;
export const MONTHLY_TARGET = 2552;
export const REGULAR_SHARE = 638;
