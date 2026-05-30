"use client";

import { useState } from "react";
import { backfillMortgageHistory } from "./actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, History } from "lucide-react";

export function BackfillButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleBackfill = async () => {
    if (
      !confirm(
        "This will create historical mortgage months back to the start of the loan. Continue?"
      )
    )
      return;

    setLoading(true);
    setResult(null);
    const res = await backfillMortgageHistory();
    setLoading(false);

    if (res.success) {
      setResult(`Created ${res.monthsCreated} months of history`);
      router.refresh();
    } else {
      setResult(res.error || "Failed");
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button onClick={handleBackfill} disabled={loading} variant="outline" size="sm">
        {loading ? (
          <Loader2 className="size-4 animate-spin mr-1.5" />
        ) : (
          <History className="size-4 mr-1.5" />
        )}
        Backfill History
      </Button>
      {result && <span className="text-sm text-muted-foreground">{result}</span>}
    </div>
  );
}
