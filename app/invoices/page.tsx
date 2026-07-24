import Link from "next/link";
import { Edit3, FileText, Plus, Search } from "lucide-react";
import type { Prisma } from "@prisma/client";

import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { setInvoiceStatus } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type InvoiceSearchParams = {
  search?: string;
  clientId?: string;
  status?: string;
};

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<InvoiceSearchParams>;
}) {
  const filters = await searchParams;
  const search = filters.search?.trim() ?? "";
  const clientId = filters.clientId ?? "";
  const status =
    filters.status === "PAID" || filters.status === "UNPAID"
      ? filters.status
      : "";

  const where: Prisma.InvoiceWhereInput = {
    ...(clientId ? { clientId } : {}),
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { invoiceNumber: { contains: search, mode: "insensitive" } },
            {
              client: {
                is: { name: { contains: search, mode: "insensitive" } },
              },
            },
            {
              client: {
                is: { company: { contains: search, mode: "insensitive" } },
              },
            },
          ],
        }
      : {}),
  };

  const [invoices, clients] = await Promise.all([
    prisma.invoice.findMany({
      where,
      orderBy: { issueDate: "desc" },
      include: { client: true },
    }),
    prisma.client.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  const hasFilters = Boolean(search || clientId || status);

  return (
    <AppShell>
      <PageHeader
        title="Invoices"
        description="Create, track, and manage every client invoice."
        action={{ label: "Create invoice", href: "/invoices/new", icon: Plus }}
      />

      <Card className="mb-5 p-4">
        <form className="grid gap-3 lg:grid-cols-[1fr_220px_180px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              name="search"
              defaultValue={search}
              placeholder="Search invoice or client..."
              className="pl-9"
              aria-label="Search invoices"
            />
          </div>
          <Select
            name="clientId"
            defaultValue={clientId}
            aria-label="Filter by client"
          >
            <option value="">All clients</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </Select>
          <Select
            name="status"
            defaultValue={status}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
          </Select>
          <div className="flex gap-2">
            <Button type="submit">Apply filters</Button>
            {hasFilters && (
              <Button asChild type="button" variant="ghost">
                <Link href="/invoices">Clear</Link>
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden">
        {invoices.length ? (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Client</th>
                  <th>Issued</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th className="text-right">Total</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="font-semibold text-slate-950 hover:text-indigo-600"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap">
                      <p className="font-medium text-slate-700">
                        {invoice.client.name}
                      </p>
                      {invoice.client.company && (
                        <p className="text-xs text-slate-400">
                          {invoice.client.company}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap text-slate-500">
                      {formatDate(invoice.issueDate)}
                    </td>
                    <td className="whitespace-nowrap text-slate-500">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td>
                      <Badge
                        variant={invoice.status === "PAID" ? "paid" : "unpaid"}
                      >
                        {invoice.status === "PAID" ? "Paid" : "Unpaid"}
                      </Badge>
                    </td>
                    <td className="text-right font-semibold text-slate-950">
                      {formatCurrency(invoice.total.toString())}
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <form
                          action={setInvoiceStatus.bind(
                            null,
                            invoice.id,
                            invoice.status === "PAID" ? "UNPAID" : "PAID",
                          )}
                        >
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="whitespace-nowrap"
                          >
                            Mark{" "}
                            {invoice.status === "PAID" ? "unpaid" : "paid"}
                          </Button>
                        </form>
                        <Button asChild variant="ghost" size="icon">
                          <Link
                            href={`/invoices/${invoice.id}/edit`}
                            aria-label={`Edit ${invoice.invoiceNumber}`}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title={hasFilters ? "No matching invoices" : "No invoices yet"}
            description={
              hasFilters
                ? "Try changing or clearing your search and filters."
                : "Create your first invoice to start tracking client income."
            }
            action={
              hasFilters
                ? { label: "Clear filters", href: "/invoices" }
                : { label: "Create invoice", href: "/invoices/new" }
            }
          />
        )}
      </Card>
    </AppShell>
  );
}
