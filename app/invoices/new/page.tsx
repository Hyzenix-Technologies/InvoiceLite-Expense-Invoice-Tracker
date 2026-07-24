import Link from "next/link";
import { UserPlus } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { InvoiceForm } from "@/components/invoice-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createInvoice } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  const [clients, invoiceCount] = await Promise.all([
    prisma.client.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, company: true },
    }),
    prisma.invoice.count(),
  ]);
  const suggestedNumber = `INV-${new Date().getFullYear()}-${String(
    invoiceCount + 1,
  ).padStart(3, "0")}`;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <div className="mb-7">
          <h1 className="page-heading">Create an invoice</h1>
          <p className="page-subheading">
            Add line items and totals will calculate automatically.
          </p>
        </div>
        {clients.length ? (
          <Card>
            <CardHeader className="border-b border-slate-100">
              <CardTitle>Invoice details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <InvoiceForm
                action={createInvoice}
                clients={clients}
                suggestedNumber={suggestedNumber}
                selectedClientId={clientId}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center p-12 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                <UserPlus className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-semibold text-slate-950">
                Add a client first
              </h2>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Every invoice needs a client with billing contact information.
              </p>
              <Button asChild className="mt-5">
                <Link href="/clients/new">Add client</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
