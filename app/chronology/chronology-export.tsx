"use client";

import { useState, useRef } from "react";
import { ChronologyEvent } from "@/types/chronology";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ExportProps {
  events: ChronologyEvent[];
}

const categories: Record<string, string> = {
  meeting: "Meeting",
  incident: "Incident",
  payment: "Payment",
  communication: "Communication",
  legal: "Legal",
  other: "Other",
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-MY", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ExportDocument({ events }: { events: ChronologyEvent[] }) {
  const totalEvents = events.length;
  const dateRange =
    events.length > 0
      ? `${formatDate(events[0].date)} — ${formatDate(events[events.length - 1].date)}`
      : "";

  return (
    <div className="bg-[#ffffff] text-[#000000] p-8 font-sans" style={{ color: "#000000", background: "#ffffff" }}>
      <div className="text-center mb-8 pb-6 border-b-2 border-[#d1d5db]">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#000000" }}>
          Event Chronology
        </h1>
        <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
          {totalEvents} events • {dateRange}
        </p>
        <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>
          Generated on{" "}
          {new Date().toLocaleDateString("en-MY", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="space-y-6">
        {events.map((event, i) => (
          <div key={event._id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full mt-1.5" style={{ backgroundColor: "#111827" }} />
              {i < events.length - 1 && (
                <div className="w-0.5 flex-1" style={{ backgroundColor: "#e5e7eb" }} />
              )}
            </div>
            <div className="flex-1 pb-6">
              <div className="text-xs mb-1" style={{ color: "#6b7280" }}>
                {formatDate(event.date)}
                {event.time && ` • ${event.time}`}
              </div>
              <h3 className="font-semibold text-sm mb-1" style={{ color: "#000000" }}>{event.title}</h3>
              {event.location && (
                <p className="text-xs mb-1" style={{ color: "#6b7280" }}>{event.location}</p>
              )}
              {event.category && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: "#f3f4f6", color: "#4b5563" }}
                >
                  {categories[event.category] || event.category}
                </span>
              )}
              {event.description && (
                <p className="text-xs mt-1 leading-relaxed" style={{ color: "#374151" }}>
                  {event.description}
                </p>
              )}
              {event.attachments && event.attachments.length > 0 && (
                <p className="text-[10px] mt-1" style={{ color: "#9ca3af" }}>
                  {event.attachments.length} attachment
                  {event.attachments.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-8 pt-4 border-t text-center text-[10px]"
        style={{ borderColor: "#e5e7eb", color: "#9ca3af" }}
      >
        Confidential — prepared for legal consultation
      </div>
    </div>
  );
}

export function ChronologyExport({ events }: ExportProps) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "image" | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    const [{ default: jsPDF }, { toPng }] = await Promise.all([
      import("jspdf"),
      import("html-to-image"),
    ]);

    setExporting("pdf");
    try {
      const element = contentRef.current;
      if (!element) return;

      const imgData = await toPng(element, {
        quality: 1,
        pixelRatio: 2,
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("chronology.pdf");
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      setExporting(null);
    }
  };

  const handleExportImage = async () => {
    const { toPng } = await import("html-to-image");

    setExporting("image");
    try {
      const element = contentRef.current;
      if (!element) return;

      const dataUrl = await toPng(element, {
        quality: 1,
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = "chronology.png";
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Image export failed:", error);
    } finally {
      setExporting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" disabled={events.length === 0}>
            <Download className="size-4 mr-1.5" />
            Export
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Chronology</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Button
            onClick={handleExportPDF}
            disabled={exporting !== null}
            className="w-full justify-start"
            variant="outline"
          >
            {exporting === "pdf" ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <Download className="size-4 mr-2" />
            )}
            Export as PDF
          </Button>
          <Button
            onClick={handleExportImage}
            disabled={exporting !== null}
            className="w-full justify-start"
            variant="outline"
          >
            {exporting === "image" ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <Download className="size-4 mr-2" />
            )}
            Export as Image (PNG)
          </Button>
        </div>

        <div className="fixed -left-[9999px]">
          <div ref={contentRef}>
            <ExportDocument events={events} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
