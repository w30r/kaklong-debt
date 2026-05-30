"use client";

import { useState } from "react";
import { addContribution } from "./actions";
import { MEMBER_EMOJIS } from "@/types/mortgage";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const REGULAR_MEMBERS = ["syamil", "daddy", "sha", "kaklong"] as const;
const REGULAR_SHARE = 638;
const now = new Date();

export function MortgageForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [mamaAmount, setMamaAmount] = useState("");

  const handlePayAll = async () => {
    setSaving(true);
    for (const name of REGULAR_MEMBERS) {
      const fd = new FormData();
      fd.set("memberName", name);
      fd.set("year", String(year));
      fd.set("month", String(month));
      fd.set("amountPaid", String(REGULAR_SHARE));
      await addContribution(fd);
    }
    if (mamaAmount) {
      const amount = parseFloat(mamaAmount);
      if (!isNaN(amount) && amount > 0) {
        const fd = new FormData();
        fd.set("memberName", "mama");
        fd.set("year", String(year));
        fd.set("month", String(month));
        fd.set("amountPaid", String(amount));
        await addContribution(fd);
      }
    }
    setSaving(false);
    setOpen(false);
    setMamaAmount("");
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button><Plus className="size-4 mr-1.5" />Add Month</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Monthly Contribution</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || now.getFullYear())}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="month">Month</Label>
              <Input
                id="month"
                type="number"
                min={1}
                max={12}
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-3 space-y-2">
            <p className="text-sm font-medium">Quick fill (RM638 each)</p>
            <div className="flex flex-wrap gap-2">
              {REGULAR_MEMBERS.map((name) => (
                <Button
                  key={name}
                  size="sm"
                  variant="outline"
                  className="capitalize"
                  onClick={async () => {
                    setSaving(true);
                    const fd = new FormData();
                    fd.set("memberName", name);
                    fd.set("year", String(year));
                    fd.set("month", String(month));
                    fd.set("amountPaid", String(REGULAR_SHARE));
                    await addContribution(fd);
                    setSaving(false);
                    router.refresh();
                  }}
                  disabled={saving}
                >
                  {MEMBER_EMOJIS[name]} {name}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="mamaAmount">Mama extra (optional)</Label>
            <Input
              id="mamaAmount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={mamaAmount}
              onChange={(e) => setMamaAmount(e.target.value)}
            />
          </div>

          <Button onClick={handlePayAll} disabled={saving} className="w-full">
            {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
            Pay All 4 + Mama
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
