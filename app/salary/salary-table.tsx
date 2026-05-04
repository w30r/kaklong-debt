"use client";

import { SalaryEntry } from "@/types/salary";
import { deleteSalaryEntry } from "../actions";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SalaryTableProps {
  entries: SalaryEntry[];
}

const truncate = (str: string, n: number) => {
  return str?.length > n ? str.substr(0, n - 1) + "..." : str;
};

export function SalaryTable({ entries }: SalaryTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = entries.filter((entry) => {
    const term = search.toLowerCase();
    return entry.description.toLowerCase().includes(term);
  });

  const handleDelete = async (id: string) => {
    await deleteSalaryEntry(id);
    router.refresh();
  };

  const formatCurrency = (val: number) =>
    val.toLocaleString("en-MY", { minimumFractionDigits: 2 });

  const groupedByMonth: { [key: string]: SalaryEntry[] } = {};
  filtered.forEach((entry) => {
    const monthKey = entry.date.substring(0, 7);
    if (!groupedByMonth[monthKey]) {
      groupedByMonth[monthKey] = [];
    }
    groupedByMonth[monthKey].push(entry);
  });

  const monthLabels: { [key: string]: string } = {
    "2025-01": "January 2025",
    "2025-02": "February 2025",
    "2025-03": "March 2025",
    "2025-04": "April 2025",
    "2025-05": "May 2025",
    "2025-06": "June 2025",
    "2025-07": "July 2025",
    "2025-08": "August 2025",
    "2025-09": "September 2025",
    "2025-10": "October 2025",
    "2025-11": "November 2025",
    "2025-12": "December 2025",
    "2026-01": "January 2026",
    "2026-02": "February 2026",
    "2026-03": "March 2026",
    "2026-04": "April 2026",
    "2026-05": "May 2026",
    "2026-06": "June 2026",
    "2026-07": "July 2026",
    "2026-08": "August 2026",
    "2026-09": "September 2026",
    "2026-10": "October 2026",
    "2026-11": "November 2026",
    "2026-12": "December 2026",
  };

  const sortedMonths = Object.keys(groupedByMonth).sort().reverse();

  return (
    <>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {sortedMonths.length === 0 ? (
        <Card>
          <CardContent className="h-24 flex items-center justify-center text-muted-foreground">
            No entries yet. Add one to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedMonths.map((month) => {
            const monthEntries = groupedByMonth[month];
            const total = monthEntries.reduce((sum, e) => sum + e.amount, 0);
            const monthLabel = monthLabels[month] || month;

            return (
              <Card key={month}>
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                    <span className="font-semibold">{monthLabel}</span>
                    <span
                      className={`font-bold ${total >= 0 ? "text-chart-3" : "text-destructive"}`}
                    >
                      {total >= 0 ? "+" : ""}RM {formatCurrency(total)}
                    </span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-32">Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthEntries.map((entry) => (
                        <TableRow key={entry._id}>
                          <TableCell className="text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString("en-MY", {
                              day: "numeric",
                              month: "short",
                            })}
                          </TableCell>
                          <TableCell>
                            {truncate(entry.description, 40)}
                          </TableCell>
                          <TableCell
                            className={`text-right font-medium tabular-nums ${
                              entry.amount >= 0
                                ? "text-chart-3"
                                : "text-destructive"
                            }`}
                          >
                            {entry.amount >= 0 ? "+" : ""}RM{" "}
                            {formatCurrency(entry.amount)}
                          </TableCell>
                          <TableCell>
                            <form
                              action={async () => {
                                await handleDelete(entry._id);
                              }}
                            >
                              <Button
                                type="submit"
                                variant="ghost"
                                size="icon-sm"
                              >
                                <Trash className="size-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </form>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
