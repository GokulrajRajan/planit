"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { AlertCircleIcon, ChevronLeftIcon, ChevronRightIcon, InfoIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Saved, PageMeta } from "@/lib/admin-api";
import { toApiError, type ApiError } from "@/lib/api";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** A plain-language guidance box: where content appears, or a compliance reminder. */
export function Callout({ tone = "info", children }: { tone?: "info" | "warning"; children: React.ReactNode }) {
  const Icon = tone === "warning" ? AlertCircleIcon : InfoIcon;
  return (
    <div
      className={
        tone === "warning"
          ? "mb-6 flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950"
          : "mb-6 flex gap-3 rounded-lg border bg-muted/50 p-3 text-sm text-foreground"
      }
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="space-y-1">{children}</div>
    </div>
  );
}

/** Loading and error states for a query; renders children only once data is there. */
export function QueryState({
  isPending,
  error,
  onRetry,
  rows = 4,
  children,
}: {
  isPending: boolean;
  error: Error | null;
  onRetry: () => void;
  rows?: number;
  children: React.ReactNode;
}) {
  if (isPending) {
    return (
      <div className="space-y-2" aria-busy="true" aria-label="Loading">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3 rounded-lg border border-destructive/30 p-4 text-sm">
        <p>{error.message}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }
  return children;
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center text-sm">
      <p className="font-medium">{title}</p>
      {children && <div className="mt-1 text-muted-foreground">{children}</div>}
    </div>
  );
}

export function PaginationBar({ meta, onPage }: { meta: PageMeta; onPage: (page: number) => void }) {
  if (meta.pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-between gap-2 text-sm">
      <p className="text-muted-foreground">
        Page {meta.page} of {meta.pages} · {meta.total} total
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>
          <ChevronLeftIcon data-icon="inline-start" /> Previous
        </Button>
        <Button variant="outline" size="sm" disabled={meta.page >= meta.pages} onClick={() => onPage(meta.page + 1)}>
          Next <ChevronRightIcon data-icon="inline-end" />
        </Button>
      </div>
    </nav>
  );
}

/**
 * A write that shows the server's message as a toast and refreshes every query under `invalidate`.
 * Errors become an error toast unless `onError` handles them (e.g. to place them on form fields).
 */
export function useSave<TInput, TData>({
  mutationFn,
  invalidate,
  onSuccess,
  onError,
}: {
  mutationFn: (input: TInput) => Promise<Saved<TData>>;
  invalidate: QueryKey[];
  onSuccess?: (data: TData, input: TInput) => void;
  onError?: (error: ApiError) => boolean | void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async (saved, input) => {
      toast.success(saved.message);
      onSuccess?.(saved.data, input);
      // The dashboard counts depend on almost everything, so they refresh with every write.
      await Promise.all(
        [...invalidate, ["admin", "stats"]].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      );
    },
    onError: (err) => {
      const error = toApiError(err);
      if (!onError?.(error)) toast.error(error.message);
    },
  });
}

/** A destructive action behind a confirmation dialog. */
export function ConfirmButton({
  label,
  ariaLabel,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  pending,
  size = "sm",
  variant = "destructive",
}: {
  label: React.ReactNode;
  /** Needed when `label` is only an icon. */
  ariaLabel?: string;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  onConfirm: () => Promise<unknown>;
  pending?: boolean;
  size?: "sm" | "default" | "icon-sm";
  variant?: "destructive" | "ghost" | "outline";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={variant} size={size} aria-label={ariaLabel} onClick={() => setOpen(true)}>
        {label}
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={async () => {
                try {
                  await onConfirm();
                  setOpen(false);
                } catch {
                  // useSave has already shown the error; keep the dialog open so it can be retried.
                }
              }}
            >
              {pending ? "Working…" : confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

const IST: Intl.DateTimeFormatOptions = { timeZone: "Asia/Kolkata" };

export const formatDateTime = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", { ...IST, day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })
    : "—";

export const formatShortDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { ...IST, day: "numeric", month: "short", year: "numeric" }) : "—";
