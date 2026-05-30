"use client";

import { useState, useMemo } from "react";
import { MortgageMonth, MemberContribution, REGULAR_MEMBERS, ALL_MEMBERS, MONTHLY_TARGET, REGULAR_SHARE } from "@/types/mortgage";
import { addContribution, togglePaidToBank, deleteContribution } from "./actions";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Ban, Banknote, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const MONTH_NAMES = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FULL_MONTH_NAMES = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

interface Props {
  months: MortgageMonth[];
  contributions: MemberContribution[];
}

export function MortgageTable({ months, contributions }: Props) {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState<{ year: number; month: number } | null>(null);
  const [mamaAmount, setMamaAmount] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const contribMap = useMemo(() => {
    const map = new Map<string, MemberContribution>();
    for (const c of contributions) {
      map.set(`${c.memberName}-${c.year}-${c.month}`, c);
    }
    return map;
  }, [contributions]);

  const getContrib = (memberName: string, year: number, month: number) =>
    contribMap.get(`${memberName}-${year}-${month}`);

  const getContribsForMonth = (year: number, month: number) =>
    contributions.filter((c) => c.year === year && c.month === month);

  const selectedContribs = selectedMonth
    ? getContribsForMonth(selectedMonth.year, selectedMonth.month)
    : [];

  const selectedMonthDoc = selectedMonth
    ? months.find((m) => m.year === selectedMonth.year && m.month === selectedMonth.month)
    : null;

  const handlePayShare = async (memberName: string, year: number, month: number) => {
    setSaving(true);
    const fd = new FormData();
    fd.set("memberName", memberName);
    fd.set("year", String(year));
    fd.set("month", String(month));
    fd.set("amountPaid", String(REGULAR_SHARE));
    await addContribution(fd);
    setSaving(false);
    router.refresh();
  };

  const handleMamaContribute = async (year: number, month: number) => {
    const amount = parseFloat(mamaAmount);
    if (isNaN(amount) || amount <= 0) return;
    setSaving(true);
    const fd = new FormData();
    fd.set("memberName", "mama");
    fd.set("year", String(year));
    fd.set("month", String(month));
    fd.set("amountPaid", String(amount));
    await addContribution(fd);
    setMamaAmount("");
    setSaving(false);
    router.refresh();
  };

  const handleTogglePaidToBank = async (year: number, month: number) => {
    setSaving(true);
    await togglePaidToBank(year, month);
    setSaving(false);
    router.refresh();
  };

  const handleDeleteContribution = async (id: string) => {
    setSaving(true);
    await deleteContribution(id);
    setDeleteTarget(null);
    setSaving(false);
    router.refresh();
  };

  const formatCurrency = (val: number) =>
    val.toLocaleString("en-MY", { minimumFractionDigits: 2 });

  const totalSelected = selectedContribs.reduce((sum, c) => sum + c.amountPaid, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Timeline Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm">Month</TableHead>
                  {REGULAR_MEMBERS.map((name) => (
                    <TableHead key={name} className="text-center text-sm capitalize">{name}</TableHead>
                  ))}
                  <TableHead className="text-center text-sm">Mama</TableHead>
                  <TableHead className="text-right text-sm">Total</TableHead>
                  <TableHead className="text-center text-sm">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {months.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No records yet. Click "Add Month" to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  months.map((m) => {
                    const isSelected = selectedMonth?.year === m.year && selectedMonth?.month === m.month;
                    return (
                      <TableRow
                        key={`${m.year}-${m.month}`}
                        className={`cursor-pointer transition-colors ${isSelected ? "bg-muted/50" : ""}`}
                        onClick={() => setSelectedMonth(isSelected ? null : { year: m.year, month: m.month })}
                      >
                        <TableCell className="font-medium text-sm">
                          {MONTH_NAMES[m.month]} {m.year}
                        </TableCell>
                        {REGULAR_MEMBERS.map((name) => {
                          const c = getContrib(name, m.year, m.month);
                          const paid = c && c.amountPaid > 0;
                          return (
                            <TableCell key={name} className="text-center text-sm">
                              <span className={`inline-flex items-center gap-1 ${paid ? "text-chart-3" : "text-muted-foreground/50"}`}>
                                {paid ? <Check className="size-4" /> : <X className="size-4" />}
                              </span>
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center text-sm">
                          {(() => {
                            const c = getContrib("mama", m.year, m.month);
                            return c ? (
                              <span className="text-xs text-chart-3">RM {formatCurrency(c.amountPaid)}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground/50">—</span>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums text-sm">
                          RM {formatCurrency(m.totalCollected)}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {m.isPaidToBank ? (
                            <Badge variant="default" className="gap-1 bg-chart-3 hover:bg-chart-3">
                              <Banknote className="size-3" /> Paid
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <Ban className="size-3" /> Due
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Member Detail Panel */}
      {selectedMonth && (
        <Card>
          <CardContent className="p-4 sm:p-5">
            <h3 className="text-lg font-semibold mb-4">
              {FULL_MONTH_NAMES[selectedMonth.month]} {selectedMonth.year} — Contributions
            </h3>

            <div className="space-y-3">
              {ALL_MEMBERS.map((name) => {
                const c = getContrib(name, selectedMonth.year, selectedMonth.month);
                const isRegular = REGULAR_MEMBERS.includes(name as typeof REGULAR_MEMBERS[number]);
                const isPaid = c && c.amountPaid > 0;

                return (
                  <div key={name} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <span className="font-medium capitalize min-w-[80px]">{name}</span>
                      {isPaid ? (
                        <span className="text-sm text-chart-3 font-medium">
                          RM {formatCurrency(c!.amountPaid)}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not paid</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isRegular && (
                        <Button
                          size="sm"
                          variant={isPaid ? "outline" : "default"}
                          onClick={() => handlePayShare(name, selectedMonth.year, selectedMonth.month)}
                          disabled={saving}
                        >
                          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                          {isPaid ? "Update RM638" : "Pay RM638"}
                        </Button>
                      )}
                      {name === "mama" && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="Amount"
                            className="w-24 h-8 text-sm"
                            value={mamaAmount}
                            onChange={(e) => setMamaAmount(e.target.value)}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleMamaContribute(selectedMonth.year, selectedMonth.month)}
                            disabled={saving || !mamaAmount}
                          >
                            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                            {c ? "Update" : "Add"}
                          </Button>
                        </div>
                      )}
                      {isPaid && (
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(c!._id); }}
                        >
                          <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paid to Bank toggle */}
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Bank Payment Status</p>
                  <p className="text-sm text-muted-foreground">
                    Collected: RM {formatCurrency(totalSelected)} / RM {formatCurrency(MONTHLY_TARGET)}
                    {selectedMonthDoc?.extraAmount ? ` (+RM ${formatCurrency(selectedMonthDoc.extraAmount)} extra)` : ""}
                  </p>
                </div>
                <Button
                  variant={selectedMonthDoc?.isPaidToBank ? "outline" : "default"}
                  onClick={() => handleTogglePaidToBank(selectedMonth.year, selectedMonth.month)}
                  disabled={saving || (!selectedMonthDoc?.isPaidToBank && totalSelected < MONTHLY_TARGET)}
                >
                  {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                  {selectedMonthDoc?.isPaidToBank ? "Mark as Unpaid" : "Mark as Paid to Bank"}
                </Button>
              </div>
              {!selectedMonthDoc?.isPaidToBank && totalSelected < MONTHLY_TARGET && (
                <p className="text-xs text-destructive mt-2">
                  Need RM {formatCurrency(MONTHLY_TARGET - totalSelected)} more to mark as paid
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contribution</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteTarget && handleDeleteContribution(deleteTarget)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
