import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { InvoiceForm } from "@/components/invoice-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateInvoice } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [invoice, clients] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    }),
    prisma.client.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, company: true },
    }),
  ]);
  if (!invoice) notFound();

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <div className="mb-7">
          <h1 className="page-heading">Edit {invoice.invoiceNumber}</h1>
          <p className="page-subheading">
            Update billing details, line items, tax, or payment status.
          </p>
        </div>
        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Invoice details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <InvoiceForm
              action={updateInvoice.bind(null, invoice.id)}
              clients={clients}
              invoice={{
                id: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                clientId: invoice.clientId,
                issueDate: invoice.issueDate,
                dueDate: invoice.dueDate,
                status: invoice.status,
                taxRate: invoice.taxRate.toString(),
                notes: invoice.notes,
                items: invoice.items.map((item) => ({
                  id: item.id,
                  description: item.description,
                  quantity: item.quantity.toString(),
                  rate: item.rate.toString(),
                })),
              }}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
