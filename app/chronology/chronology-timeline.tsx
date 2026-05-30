"use client";

import { useState } from "react";
import { ChronologyEvent, Attachment } from "@/types/chronology";
import { deleteChronologyEvent } from "../actions";
import { useRouter } from "next/navigation";
import { ChronologyForm } from "./chronology-form";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  Pencil,
  MapPin,
  Search,
  FileText,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TimelineProps {
  events: ChronologyEvent[];
}

const categories: { value: string; label: string }[] = [
  { value: "meeting", label: "Meeting" },
  { value: "incident", label: "Incident" },
  { value: "payment", label: "Payment" },
  { value: "communication", label: "Communication" },
  { value: "legal", label: "Legal" },
  { value: "other", label: "Other" },
];

const categoryColors: Record<string, string> = {
  meeting: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  incident: "bg-red-500/10 text-red-600 border-red-500/20",
  payment: "bg-green-500/10 text-green-600 border-green-500/20",
  communication: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  legal: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  other: "bg-gray-500/10 text-gray-600 border-gray-500/20",
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

function AttachmentPreview({ attachments }: { attachments: Attachment[] }) {
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const current = attachments[idx];

  if (!current) return null;

  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const next = () => setIdx((i) => Math.min(attachments.length - 1, i + 1));

  return (
    <div className="mt-3">
      <div className="relative rounded-lg overflow-hidden border border-border bg-muted">
        {attachments.length > 1 && (
          <div className="absolute top-2 right-2 z-10 text-[10px] px-1.5 py-0.5 rounded-full bg-background/80 text-muted-foreground">
            {idx + 1}/{attachments.length}
          </div>
        )}

        {current.type === "image" ? (
          <img
            src={current.url}
            alt={current.name}
            className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setOpen(true)}
          />
        ) : (
          <div
            className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/80 transition-colors min-h-20"
            onClick={() => setOpen(true)}
          >
            <FileText className="size-8 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{current.name}</p>
              <p className="text-xs text-muted-foreground">PDF Document</p>
            </div>
          </div>
        )}

        {attachments.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              disabled={idx === 0}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 size-7 rounded-full bg-background/80 hover:bg-background flex items-center justify-center disabled:opacity-30 transition-opacity"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              disabled={idx === attachments.length - 1}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 size-7 rounded-full bg-background/80 hover:bg-background flex items-center justify-center disabled:opacity-30 transition-opacity"
            >
              <ChevronRight className="size-4" />
            </button>
            <div className="flex items-center justify-center gap-1 py-1.5 bg-muted/50">
              {attachments.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                  className={`size-1.5 rounded-full transition-colors ${
                    i === idx ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{current.name}</DialogTitle>
          </DialogHeader>
          {current.type === "image" ? (
            <img
              src={current.url}
              alt={current.name}
              className="w-full rounded-lg object-contain max-h-[70vh]"
            />
          ) : (
            <iframe
              src={current.url}
              className="w-full h-[70vh] rounded-lg border border-border"
              title={current.name}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EventCard({
  event,
}: {
  event: ChronologyEvent;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await deleteChronologyEvent(event._id);
    router.refresh();
  };

  return (
    <>
      <ChronologyForm
        event={event}
        open={editing}
        onOpenChange={setEditing}
      />
      <div className="relative pl-8 pb-8 last:pb-0">
        <div className="absolute left-[11px] top-1 w-[6px] h-[6px] rounded-full bg-primary ring-4 ring-background z-10" />
        <div className="absolute left-[13px] top-7 bottom-0 w-[2px] bg-border last:hidden" />

        <Card className="relative">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-medium text-muted-foreground tabular-nums">
                    {formatDate(event.date)}
                    {event.time && ` • ${event.time}`}
                  </span>
                  {event.category && (
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 h-4 ${
                        categoryColors[event.category] || "bg-gray-500/10 text-gray-600"
                      }`}
                    >
                      {categories.find((c) => c.value === event.category)
                        ?.label || event.category}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-base leading-tight mb-1">
                  {event.title}
                </h3>
                {event.location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <MapPin className="size-3" />
                    {event.location}
                  </div>
                )}
                {event.description && (
                  <div className="mt-2">
                    <p
                      className={`text-sm text-muted-foreground ${
                        expanded ? "" : "line-clamp-2"
                      }`}
                    >
                      {event.description}
                    </p>
                    {event.description.length > 120 && (
                      <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-0.5"
                      >
                        {expanded ? (
                          <>
                            Show less <ChevronUp className="size-3" />
                          </>
                        ) : (
                          <>
                            Read more <ChevronDown className="size-3" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
                {event.attachments && event.attachments.length > 0 && (
                  <AttachmentPreview attachments={event.attachments} />
                )}
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setEditing(true)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  disabled={deleting}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export function ChronologyTimeline({ events }: TimelineProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = events.filter((event) => {
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      event.title.toLowerCase().includes(term) ||
      event.description.toLowerCase().includes(term) ||
      event.location.toLowerCase().includes(term);
    const matchesCategory =
      !selectedCategory || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              !selectedCategory
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                selectedCategory === cat.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="h-32 flex items-center justify-center text-muted-foreground text-sm">
            {events.length === 0
              ? "No events yet. Add one to build your chronology."
              : "No events match your search."}
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-border rounded-full" />
          {filtered.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
