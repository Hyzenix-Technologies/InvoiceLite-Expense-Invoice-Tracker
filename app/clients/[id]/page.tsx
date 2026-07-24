import Link from "next/link";
import { Building2, Edit3, FileText, Mail, MapPin, Phone } from "lucide-react";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { DeleteDialog } from "@/components/delete-dialog";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteClient } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      invoices: { orderBy: { issueDate: "desc" } },
      expenses: { orderBy: { expenseDate: "desc" }, take: 5 },
    },
  });
  if (!client) notFound();

  const billed = client.invoices.reduce(
    (sum, invoice) => sum + Number(invoice.total),
    0,
  );
  const outstanding = client.invoices
    .filter((invoice) => invoice.status === "UNPAID")
    .reduce((sum, invoice) => sum + Number(invoice.total), 0);

  return (
    <AppShell>
      <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-indigo-100 text-base font-bold text-indigo-700">
            {getInitials(client.name)}
          </span>
          <div>
            <h1 className="page-heading">{client.name}</h1>
            <p className="page-subheading">
              {client.company || "Independent client"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/clients/${client.id}/edit`}>
              <Edit3 className="h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DeleteDialog
            title="Delete this client?"
            description="This will permanently delete the client and all of their invoices. Expenses will remain but will no longer be linked."
            action={deleteClient.bind(null, client.id)}
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <a
                href={`mailto:${client.email}`}
                className="flex items-start gap-3 text-slate-600 hover:text-indigo-600"
              >
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span className="break-all">{client.email}</span>
              </a>
              {client.phone && (
                <a
                  href={`tel:${client.phone}`}
                  className="flex items-start gap-3 text-slate-600 hover:text-indigo-600"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  {client.phone}
                </a>
              )}
              {client.company && (
                <p className="flex items-start gap-3 text-slate-600">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  {client.company}
                </p>
              )}
              {client.address && (
                <p className="flex items-start gap-3 whitespace-pre-line text-slate-600">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  {client.address}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="grid grid-cols-2 gap-4 p-5">
              <div>
                <p className="text-xs text-slate-400">Total billed</p>
                <p className="mt-1 text-lg font-bold text-slate-950">
                  {formatCurrency(billed)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Outstanding</p>
                <p className="mt-1 text-lg font-bold text-orange-600">
                  {formatCurrency(outstanding)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-slate-100">
            <CardTitle>Invoice history</CardTitle>
            <Button asChild size="sm">
              <Link href={`/invoices/new?clientId=${client.id}`}>
                Create invoice
              </Link>
            </Button>
          </CardHeader>
          {client.invoices.length ? (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Issued</th>
                    <th>Due</th>
                    <th>Status</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {client.invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>
                        <Link
                          className="font-semibold text-slate-900 hover:text-indigo-600"
                          href={`/invoices/${invoice.id}`}
                        >
                          {invoice.invoiceNumber}
                        </Link>
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
                      <td className="text-right font-semibold">
                        {formatCurrency(invoice.total.toString())}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No invoices for this client"
              description="Create an invoice when you're ready to bill for your work."
              action={{
                label: "Create invoice",
                href: `/invoices/new?clientId=${client.id}`,
              }}
            />
          )}
        </Card>
      </div>
    </AppShell>
  );
}
