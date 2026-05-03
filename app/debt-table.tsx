"use client";

import { BankDebt } from "@/types/bank-debt";
import { markAsPaidOff, deleteDebt } from "./actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface DebtTableProps {
  debts: BankDebt[];
}

type SortKey = keyof BankDebt;
type SortDir = "asc" | "desc";

export function DebtTable({ debts }: DebtTableProps) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("bank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = [...debts].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    }
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();
    if (aStr < bStr) return sortDir === "asc" ? -1 : 1;
    if (aStr > bStr) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="ml-1 size-3 text-muted-foreground/50" />;
    return sortDir === "asc" ? <ArrowUp className="ml-1 size-3" /> : <ArrowDown className="ml-1 size-3" />;
  };

  const formatCurrency = (val: number) =>
    `RM ${val.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`;

  const statusVariant = (status: BankDebt["status"]) => {
    switch (status) {
      case "paid-off": return "default";
      case "late": return "destructive";
      default: return "secondary";
    }
  };

  const sortableCols: { key: SortKey; label: string }[] = [
    { key: "bank", label: "Bank" },
    { key: "type", label: "Type" },
    { key: "totalAmount", label: "Total" },
    { key: "outstanding", label: "Outstanding" },
    { key: "monthlyPayment", label: "Monthly" },
    { key: "interestRate", label: "Interest" },
    { key: "nextPaymentDate", label: "Next Payment" },
    { key: "status", label: "Status" },
  ];

  return (
    <>
      <div className="hidden sm:block">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {sortableCols.map(({ key, label }) => (
                    <TableHead
                      key={key}
                      className="cursor-pointer select-none hover:text-foreground transition-colors"
                      onClick={() => toggleSort(key)}
                    >
                      <span className="inline-flex items-center">{label}<SortIcon col={key} /></span>
                    </TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((debt) => (
                  <TableRow
                    key={debt._id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/debt/${debt._id}`)}
                  >
                    <TableCell className="font-medium">{debt.bank}</TableCell>
                    <TableCell className="text-muted-foreground">{debt.type}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">{formatCurrency(debt.totalAmount)}</TableCell>
                    <TableCell className="tabular-nums font-medium">{formatCurrency(debt.outstanding)}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">{formatCurrency(debt.monthlyPayment)}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">{debt.interestRate}%</TableCell>
                    <TableCell className="text-muted-foreground">{debt.nextPaymentDate}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(debt.status)}>{debt.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                      {debt.status !== "paid-off" && (
                        <form action={async (fd) => { await markAsPaidOff(debt._id); }} className="inline">
                          <Button type="submit" variant="default" size="sm">Paid Off</Button>
                        </form>
                      )}
                      <form action={async (fd) => { await deleteDebt(debt._id); }} className="inline">
                        <Button type="submit" variant="destructive" size="sm">Delete</Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
                {sorted.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                      No debts tracked yet. Add one to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="sm:hidden space-y-3">
        {sorted.map((debt) => (
          <Card
            key={debt._id}
            className="cursor-pointer active:scale-[0.99] transition-transform"
            onClick={() => router.push(`/debt/${debt._id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground">{debt.bank}</p>
                  <p className="text-sm text-muted-foreground">{debt.type}</p>
                </div>
                <Badge variant={statusVariant(debt.status)}>{debt.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <p className="text-muted-foreground text-xs">Outstanding</p>
                  <p className="font-medium tabular-nums">{formatCurrency(debt.outstanding)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Monthly</p>
                  <p className="tabular-nums">{formatCurrency(debt.monthlyPayment)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Interest</p>
                  <p>{debt.interestRate}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Next Payment</p>
                  <p className="text-foreground">{debt.nextPaymentDate}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-border" onClick={(e) => e.stopPropagation()}>
                {debt.status !== "paid-off" && (
                  <form action={async (fd) => { await markAsPaidOff(debt._id); }} className="flex-1">
                    <Button type="submit" variant="default" size="sm" className="w-full">Paid Off</Button>
                  </form>
                )}
                <form action={async (fd) => { await deleteDebt(debt._id); }} className="flex-1">
                  <Button type="submit" variant="destructive" size="sm" className="w-full">Delete</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
        {sorted.length === 0 && (
          <Card>
            <CardContent className="h-24 flex items-center justify-center text-muted-foreground">
              No debts tracked yet. Add one to get started.
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
