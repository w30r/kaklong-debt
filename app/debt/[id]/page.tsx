import { getDebts } from "@/app/actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DebtEditForm } from "./edit-form";
import { ArrowLeft } from "lucide-react";

export default async function DebtDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const debts = await getDebts();
  const debt = debts.find((d) => d._id === id);

  if (!debt) notFound();

  return (
    <div className="flex flex-col flex-1 bg-background font-sans">
      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>

        <DebtEditForm debt={debt} />
      </div>
    </div>
  );
}
