"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CheckIcon, DownloadIcon, MailWarningIcon, RotateCcwIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminApi, adminKeys, type Enquiry, type EnquiryStatus } from "@/lib/admin-api";
import { EmptyState, formatDateTime, PageHeader, PaginationBar, QueryState, useSave } from "./ui";

type Filter = EnquiryStatus | "all";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "new", label: "New" },
  { value: "handled", label: "Handled" },
  { value: "all", label: "All" },
];

export function EnquiriesAdmin() {
  const [filter, setFilter] = useState<Filter>("new");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const status = filter === "all" ? null : filter;

  const enquiries = useQuery({
    queryKey: [...adminKeys.enquiries, { page, status }],
    queryFn: () => adminApi.enquiries({ page, status }),
    placeholderData: keepPreviousData,
  });

  const setHandled = useSave({
    mutationFn: ({ id, handled }: { id: number; handled: boolean }) => adminApi.setEnquiryHandled(id, handled),
    invalidate: [adminKeys.enquiries],
    // Under New or Handled the enquiry moves out of the list; don't leave an empty last page behind.
    onSuccess: () => status && enquiries.data?.enquiries.length === 1 && page > 1 && setPage(page - 1),
  });

  const exportCsv = async () => {
    setExporting(true);
    try {
      await adminApi.exportEnquiries(status);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setExporting(false);
    }
  };

  const open = enquiries.data?.enquiries.find((e) => e.id === openId) ?? null;

  return (
    <>
      <PageHeader
        title="Enquiries"
        description="Messages sent through the website's enquiry and contact forms. Mark each one as handled once you've replied."
        actions={
          <Button variant="outline" onClick={exportCsv} disabled={exporting}>
            <DownloadIcon data-icon="inline-start" /> {exporting ? "Preparing…" : "Export CSV"}
          </Button>
        }
      />

      <Tabs
        value={filter}
        onValueChange={(value) => {
          setFilter(value as Filter);
          setPage(1);
        }}
        className="mb-4"
      >
        <TabsList>
          {FILTERS.map((f) => (
            <TabsTrigger key={f.value} value={f.value}>
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <QueryState isPending={enquiries.isPending} error={enquiries.error} onRetry={() => enquiries.refetch()}>
        {enquiries.data && enquiries.data.enquiries.length === 0 ? (
          <EmptyState title={filter === "new" ? "No new enquiries" : "No enquiries yet"}>
            {filter === "new" ? "Everything has been handled." : "Enquiries from the website will appear here."}
          </EmptyState>
        ) : (
          enquiries.data && (
            <div className="rounded-xl bg-card ring-1 ring-foreground/10">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Received</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                    <TableHead className="hidden sm:table-cell">Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enquiries.data.enquiries.map((enquiry) => (
                    <TableRow key={enquiry.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDateTime(enquiry.created_at)}
                      </TableCell>
                      <TableCell className="font-medium">{enquiry.name}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div>{enquiry.phone}</div>
                        <div className="text-muted-foreground">{enquiry.email}</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{enquiry.service_label ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={enquiry.handled ? "secondary" : "default"}>
                          {enquiry.handled ? "Handled" : "New"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => setOpenId(enquiry.id)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        )}
        {enquiries.data && <PaginationBar meta={enquiries.data.meta} onPage={setPage} />}
      </QueryState>

      <EnquiryDialog
        enquiry={open}
        onClose={() => setOpenId(null)}
        pending={setHandled.isPending}
        onSetHandled={(handled) => open && setHandled.mutate({ id: open.id, handled })}
      />
    </>
  );
}

function EnquiryDialog({
  enquiry,
  onClose,
  onSetHandled,
  pending,
}: {
  enquiry: Enquiry | null;
  onClose: () => void;
  onSetHandled: (handled: boolean) => void;
  pending: boolean;
}) {
  return (
    <Dialog open={enquiry !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {enquiry && (
          <>
            <DialogHeader>
              <DialogTitle>{enquiry.name}</DialogTitle>
              <DialogDescription>Received {formatDateTime(enquiry.created_at)}</DialogDescription>
            </DialogHeader>
            <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Phone</dt>
              <dd>
                <a className="underline underline-offset-4" href={`tel:${enquiry.phone.replace(/[^\d+]/g, "")}`}>
                  {enquiry.phone}
                </a>
              </dd>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="break-all">
                <a className="underline underline-offset-4" href={`mailto:${enquiry.email}`}>
                  {enquiry.email}
                </a>
              </dd>
              <dt className="text-muted-foreground">City</dt>
              <dd>{enquiry.city ?? "—"}</dd>
              <dt className="text-muted-foreground">Service</dt>
              <dd>{enquiry.service_label ?? "—"}</dd>
              <dt className="text-muted-foreground">Message</dt>
              <dd className="whitespace-pre-wrap">{enquiry.message ?? "—"}</dd>
              {enquiry.handled_at && (
                <>
                  <dt className="text-muted-foreground">Handled</dt>
                  <dd>{formatDateTime(enquiry.handled_at)}</dd>
                </>
              )}
            </dl>
            {!enquiry.notified_at && (
              <p className="flex gap-2 rounded-md bg-amber-50 p-2.5 text-xs text-amber-950">
                <MailWarningIcon className="size-4 shrink-0" aria-hidden />
                The office wasn&apos;t emailed about this enquiry (email isn&apos;t set up, or sending failed), so it may
                not have been seen yet.
              </p>
            )}
            <DialogFooter>
              {enquiry.handled ? (
                <Button variant="outline" disabled={pending} onClick={() => onSetHandled(false)}>
                  <RotateCcwIcon data-icon="inline-start" /> Mark as new
                </Button>
              ) : (
                <Button disabled={pending} onClick={() => onSetHandled(true)}>
                  <CheckIcon data-icon="inline-start" /> Mark as handled
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
