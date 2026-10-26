"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { DownloadIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApi, adminKeys } from "@/lib/admin-api";
import { Callout, ConfirmButton, EmptyState, formatDateTime, PageHeader, PaginationBar, QueryState, useSave } from "./ui";

export function NewsletterAdmin() {
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const subscribers = useQuery({
    queryKey: [...adminKeys.subscribers, page],
    queryFn: () => adminApi.subscribers(page),
    placeholderData: keepPreviousData,
  });
  const remove = useSave({
    mutationFn: adminApi.deleteSubscriber,
    invalidate: [adminKeys.subscribers],
    // Removing the last row on a page would otherwise leave an empty page behind.
    onSuccess: () => subscribers.data?.subscribers.length === 1 && page > 1 && setPage(page - 1),
  });

  const exportCsv = async () => {
    setExporting(true);
    try {
      await adminApi.exportSubscribers();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Newsletter"
        description={
          subscribers.data
            ? `${subscribers.data.meta.total} ${subscribers.data.meta.total === 1 ? "person has" : "people have"} subscribed from the website.`
            : "People who subscribed from the website."
        }
        actions={
          <Button variant="outline" onClick={exportCsv} disabled={exporting}>
            <DownloadIcon data-icon="inline-start" /> {exporting ? "Preparing…" : "Export CSV"}
          </Button>
        }
      />
      <Callout>
        <p>
          Everyone here ticked the consent box. Include an unsubscribe option in every email, and remove anyone who asks
          to stop receiving them.
        </p>
      </Callout>

      <QueryState isPending={subscribers.isPending} error={subscribers.error} onRetry={() => subscribers.refetch()}>
        {subscribers.data?.subscribers.length === 0 ? (
          <EmptyState title="No subscribers yet">Sign-ups from the home page will appear here.</EmptyState>
        ) : (
          subscribers.data && (
            <div className="rounded-xl bg-card ring-1 ring-foreground/10">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead className="hidden sm:table-cell">Subscribed</TableHead>
                    <TableHead className="hidden md:table-cell">Consent given</TableHead>
                    <TableHead className="text-right">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.data.subscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium break-all whitespace-normal">{subscriber.email}</TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">
                        {formatDateTime(subscriber.created_at)}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {formatDateTime(subscriber.consented_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <ConfirmButton
                          label={<Trash2Icon />}
                          ariaLabel={`Remove ${subscriber.email}`}
                          size="icon-sm"
                          variant="ghost"
                          title="Remove this subscriber?"
                          description={`${subscriber.email} will be taken off the list.`}
                          confirmLabel="Remove"
                          pending={remove.isPending}
                          onConfirm={() => remove.mutateAsync(subscriber.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        )}
        {subscribers.data && <PaginationBar meta={subscribers.data.meta} onPage={setPage} />}
      </QueryState>
    </>
  );
}
