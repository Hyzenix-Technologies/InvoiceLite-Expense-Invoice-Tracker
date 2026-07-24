import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CircleDollarSign,
  FileText,
  Plus,
  Receipt,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [
    paidSummary,
    expenseSummary,
    unpaidSummary,
    unpaidCount,
    recentInvoices,
  ] = await Promise.all([
    prisma.invoice.aggregate({
      where: { status: "PAID" },
      _sum: { total: true },
    }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.invoice.aggregate({
      where: { status: "UNPAID" },
      _sum: { total: true },
    }),
    prisma.invoice.count({ where: { status: "UNPAID" } }),
    prisma.invoice.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { client: true },
    }),
  ]);

  const income = Number(paidSummary._sum.total ?? 0);
  const expenses = Number(expenseSummary._sum.amount ?? 0);
  const unpaid = Number(unpaidSummary._sum.total ?? 0);
  const profit = income - expenses;

  const stats = [
    {
      label: "Total income",
      value: formatCurrency(income),
      helper: "Paid invoices",
      icon: CircleDollarSign,
      tone: "emerald",
      trend: ArrowUpRight,
    },
    {
      label: "Expenses",
      value: formatCurrency(expenses),
      helper: "Business spending",
      icon: Receipt,
      tone: "coral",
      trend: ArrowDownRight,
    },
    {
      label: "Unpaid invoices",
      value: formatCurrency(unpaid),
      helper: `${unpaidCount} ${unpaidCount === 1 ? "invoice" : "invoices"} open`,
      icon: WalletCards,
      tone: "indigo",
      trend: ArrowUpRight,
    },
    {
      label: "Net profit",
      value: formatCurrency(profit),
      helper: "Income minus expenses",
      icon: TrendingUp,
      tone: "slate",
      trend: ArrowUpRight,
    },
  ] as const;

  return (
    <AppShell>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
            Friday overview
          </p>
          <h1 className="page-heading">Good morning, Alex.</h1>
          <p className="page-subheading">
            Here&apos;s how your freelance business is doing.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/invoices/new">
            <Plus className="h-4 w-4" />
            Create invoice
          </Link>
        </Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <span
                  className={{
                    emerald:
                      "grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600",
                    coral:
                      "grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600",
                    indigo:
                      "grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600",
                    slate:
                      "grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700",
                  }[stat.tone]}
                >
                  <stat.icon className="h-5 w-5" />
                </span>
                <stat.trend className="h-4 w-4 text-slate-300" />
              </div>
              <p className="mt-5 text-sm font-medium text-slate-500">
                {stat.label}
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-slate-400">{stat.helper}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-slate-100">
            <div>
              <CardTitle>Recent invoices</CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                Your latest client billing activity
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/invoices">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          {recentInvoices.length ? (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Client</th>
                    <th>Due</th>
                    <th>Status</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="font-semibold text-slate-900 hover:text-indigo-600"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-50 text-[11px] font-bold text-indigo-600">
                            {getInitials(invoice.client.name)}
                          </span>
                          <span className="whitespace-nowrap font-medium text-slate-700">
                            {invoice.client.name}
                          </span>
                        </div>
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
                      <td className="text-right font-semibold text-slate-900">
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
              title="No invoices yet"
              description="Create your first invoice to start tracking income here."
              action={{ label: "Create invoice", href: "/invoices/new" }}
            />
          )}
        </Card>

        <Card className="bg-slate-950 text-white">
          <CardContent className="p-6">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10">
              <WalletCards className="h-5 w-5 text-indigo-300" />
            </span>
            <p className="mt-8 text-sm font-medium text-slate-400">
              Outstanding balance
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight">
              {formatCurrency(unpaid)}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Keep cash flow moving by reviewing invoices that are still waiting
              for payment.
            </p>
            <Button
              asChild
              className="mt-6 w-full bg-white text-slate-950 hover:bg-slate-100"
            >
              <Link href="/invoices?status=UNPAID">Review unpaid invoices</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
