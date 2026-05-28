"use client";

import { useState, useRef } from "react";
import { addChronologyEvent, updateChronologyEvent } from "../actions";
import { useRouter } from "next/navigation";
import { useUploadThing } from "@/lib/uploadthing-client";
import type { ChronologyEvent } from "@/types/chronology";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Upload, X, Check, Loader2, FileText, Image } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface Attachment {
  _id: string;
  name: string;
  url: string;
  type: "image" | "document";
  size: number;
}

const categories = [
  { value: "meeting", label: "Meeting" },
  { value: "incident", label: "Incident" },
  { value: "payment", label: "Payment" },
  { value: "communication", label: "Communication" },
  { value: "legal", label: "Legal" },
  { value: "other", label: "Other" },
];

const steps = ["Basics", "Details", "Attachments", "Review"];

interface ChronologyFormProps {
  event?: ChronologyEvent;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ChronologyForm({ event, open: controlledOpen, onOpenChange }: ChronologyFormProps) {
  const router = useRouter();
  const isEdit = !!event;
  const [internalOpen, setInternalOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const { startUpload, isUploading } = useUploadThing("chronologyAttachment", {
    onUploadError: (err) => {
      console.error("Upload failed:", err);
    },
  });

  const [form, setForm] = useState({
    title: event?.title ?? "",
    date: event?.date ?? new Date().toISOString().split("T")[0],
    time: event?.time ?? "",
    location: event?.location ?? "",
    description: event?.description ?? "",
    category: event?.category ?? "",
  });

  const [attachments, setAttachments] = useState<Attachment[]>(
    event?.attachments ?? [],
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setStep(0);
    setForm({
      title: "",
      date: new Date().toISOString().split("T")[0],
      time: "",
      location: "",
      description: "",
      category: "",
    });
    setAttachments([]);
    setErrors({});
  };

  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (s === 0) {
      if (!form.title.trim()) newErrors.title = "Title is required";
      if (!form.date) newErrors.date = "Date is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await startUpload([file]);
      if (res?.[0]) {
        setAttachments((prev) => [
          ...prev,
          {
            _id: res[0].key,
            name: res[0].name,
            url: res[0].ufsUrl ?? res[0].url,
            type: res[0].type.startsWith("image/") ? "image" : "document",
            size: res[0].size,
          },
        ]);
      }
    } catch {
      console.error("Upload failed");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a._id !== id));
  };

  const handleSubmit = async () => {
    setSaving(true);
    const fd = new FormData();
    fd.set("title", form.title);
    fd.set("date", form.date);
    fd.set("time", form.time);
    fd.set("location", form.location);
    fd.set("description", form.description);
    fd.set("category", form.category);
    fd.set("attachments", JSON.stringify(attachments));

    if (isEdit && event) {
      await updateChronologyEvent(event._id, fd);
    } else {
      await addChronologyEvent(fd);
    }

    setSaving(false);
    setOpen(false);
    if (!controlledOpen) resetForm();
    router.refresh();
  };

  const canGoNext = () => {
    if (step === 0) return form.title.trim() && form.date;
    return true;
  };

  const wizardContent = (
    <>
      <div className="flex items-center justify-center gap-1 mb-6">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center">
            <div
              className={`flex items-center justify-center size-7 rounded-full text-xs font-medium transition-colors ${
                i < step
                  ? "bg-primary text-primary-foreground"
                  : i === step
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="size-3.5" /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-8 sm:w-12 h-[2px] mx-1 rounded-full ${
                  i < step ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">
              What happened? <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. Met with lawyer to discuss case"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="date">
                When? <span className="text-destructive">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
              />
              {errors.date && (
                <p className="text-xs text-destructive">{errors.date}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="time">Time (optional)</Label>
              <Input
                id="time"
                type="time"
                value={form.time}
                onChange={(e) =>
                  setForm({ ...form, time: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="location">Where? (optional)</Label>
            <Input
              id="location"
              placeholder="e.g. Law firm, Jalan Ampang"
              value={form.location}
              onChange={(e) =>
                setForm({ ...form, location: e.target.value })
              }
            />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">
              Description / Details (optional)
            </Label>
            <textarea
              id="description"
              rows={6}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              placeholder="Describe what happened in detail..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Category (optional)</Label>
            <Select
              value={form.category}
              onValueChange={(v) => v && setForm({ ...form, category: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label>Upload photos or documents</Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <Upload className="size-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                PNG, JPG, PDF (max 10MB each)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </div>

          {isUploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Uploading...
            </div>
          )}

          {attachments.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded files</Label>
              {attachments.map((att) => (
                <div
                  key={att._id}
                  className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {att.type === "image" ? (
                      <Image className="size-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="text-sm truncate">{att.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeAttachment(att._id)}
                    className="shrink-0 size-6"
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <Card>
            <CardContent className="p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Title</span>
                <span className="font-medium text-right max-w-[60%]">
                  {form.title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {new Date(form.date).toLocaleDateString("en-MY", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              {form.time && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{form.time}</span>
                </div>
              )}
              {form.location && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium text-right max-w-[60%]">
                    {form.location}
                  </span>
                </div>
              )}
              {form.category && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">
                    {categories.find((c) => c.value === form.category)
                      ?.label || form.category}
                  </span>
                </div>
              )}
              {form.description && (
                <div className="pt-1 border-t border-border">
                  <span className="text-muted-foreground block mb-1">
                    Description
                  </span>
                  <p className="text-sm whitespace-pre-wrap">
                    {form.description}
                  </p>
                </div>
              )}
              {attachments.length > 0 && (
                <div className="pt-1 border-t border-border">
                  <span className="text-muted-foreground block mb-1">
                    Attachments ({attachments.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {attachments.map((att) => (
                      <span
                        key={att._id}
                        className="text-xs px-2 py-0.5 rounded bg-muted"
                      >
                        {att.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-between mt-4">
        <div>
          {step > 0 && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {step < steps.length - 1 ? (
            <Button onClick={handleNext} disabled={!canGoNext()}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : isEdit ? (
                "Update Event"
              ) : (
                "Save Event"
              )}
            </Button>
          )}
        </div>
      </div>
    </>
  );

  if (isEdit) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          {wizardContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger
        render={
          <Button>
            <Plus className="size-4 mr-1.5" />
            Add Event
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Chronology Event</DialogTitle>
        </DialogHeader>
        {wizardContent}
      </DialogContent>
    </Dialog>
  );
}
