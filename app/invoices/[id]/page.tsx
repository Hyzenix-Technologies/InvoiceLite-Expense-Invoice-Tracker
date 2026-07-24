import Link from "next/link";
import { Check, Edit3, RotateCcw } from "lucide-react";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { DeleteDialog } from "@/components/delete-dialog";
import { PrintButton } from "@/components/print-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteInvoice, setInvoiceStatus } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true, items: true },
  });
  if (!invoice) notFound();

  return (
    <AppShell>
      <div className="print-hidden mx-auto mb-6 flex max-w-5xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-950">
              {invoice.invoiceNumber}
            </h1>
            <Badge variant={invoice.status === "PAID" ? "paid" : "unpaid"}>
              {invoice.status === "PAID" ? "Paid" : "Unpaid"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Issued to {invoice.client.name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PrintButton />
          <Button asChild variant="outline">
            <Link href={`/invoices/${invoice.id}/edit`}>
              <Edit3 className="h-4 w-4" />
              Edit
            </Link>
          </Button>
          <form
            action={setInvoiceStatus.bind(
              null,
              invoice.id,
              invoice.status === "PAID" ? "UNPAID" : "PAID",
            )}
          >
            <Button
              type="submit"
              className={
                invoice.status === "PAID"
                  ? "bg-slate-800 hover:bg-slate-900"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }
            >
              {invoice.status === "PAID" ? (
                <RotateCcw className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Mark {invoice.status === "PAID" ? "unpaid" : "paid"}
            </Button>
          </form>
          <DeleteDialog
            title="Delete this invoice?"
            description="The invoice and all of its line items will be permanently removed. This cannot be undone."
            action={deleteInvoice.bind(null, invoice.id)}
          />
        </div>
      </div>

      <article className="invoice-paper mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-10 lg:p-14">
        <header className="flex flex-col justify-between gap-8 border-b border-slate-200 pb-10 sm:flex-row">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
                IL
              </span>
              <div>
                <p className="font-bold text-slate-950">Alex Morgan</p>
                <p className="text-sm text-slate-500">Independent designer</p>
              </div>
            </div>
            <div className="mt-6 space-y-1 text-sm leading-6 text-slate-500">
              <p>hello@alexmorgan.design</p>
              <p>Portland, Oregon</p>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Invoice
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {invoice.invoiceNumber}
            </h2>
            <div className="mt-5 space-y-1 text-sm text-slate-500">
              <p>
                Issued{" "}
                <span className="font-medium text-slate-800">
                  {formatDate(invoice.issueDate)}
                </span>
              </p>
              <p>
                Due{" "}
                <span className="font-medium text-slate-800">
                  {formatDate(invoice.dueDate)}
                </span>
              </p>
            </div>
          </div>
        </header>

        <section className="py-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            Bill to
          </p>
          <p className="mt-3 text-lg font-bold text-slate-950">
            {invoice.client.name}
          </p>
          {invoice.client.company && (
            <p className="mt-1 text-sm text-slate-600">
              {invoice.client.company}
            </p>
          )}
          <p className="mt-1 text-sm text-slate-500">{invoice.client.email}</p>
          {invoice.client.address && (
            <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-500">
              {invoice.client.address}
            </p>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-slate-950 text-xs uppercase tracking-wide text-slate-300">
                <tr>
                  <th className="px-5 py-4 font-semibold">Description</th>
                  <th className="px-5 py-4 text-right font-semibold">Qty</th>
                  <th className="px-5 py-4 text-right font-semibold">Rate</th>
                  <th className="px-5 py-4 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-4 font-medium text-slate-800">
                      {item.description}
                    </td>
                    <td className="px-5 py-4 text-right text-slate-500">
                      {Number(item.quantity)}
                    </td>
                    <td className="px-5 py-4 text-right text-slate-500">
                      {formatCurrency(item.rate.toString())}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-900">
                      {formatCurrency(item.amount.toString())}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-7 flex justify-end">
          <div className="w-full max-w-sm space-y-3 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal.toString())}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Tax ({Number(invoice.taxRate).toFixed(2)}%)</span>
              <span>{formatCurrency(invoice.taxAmount.toString())}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-4 text-xl font-bold text-slate-950">
              <span>Total due</span>
              <span>{formatCurrency(invoice.total.toString())}</span>
            </div>
          </div>
        </section>

        {invoice.notes && (
          <section className="mt-12 rounded-xl bg-slate-50 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Notes
            </p>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
              {invoice.notes}
            </p>
          </section>
        )}

        <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
          Thank you for your business.
        </footer>
      </article>
    </AppShell>
  );
}
