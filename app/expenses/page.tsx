import Link from "next/link";
import { Edit3, Plus, Receipt } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { DeleteDialog } from "@/components/delete-dialog";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteExpense } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const [expenses, summary] = await Promise.all([
    prisma.expense.findMany({
      orderBy: { expenseDate: "desc" },
      include: { client: true },
    }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
  ]);
  const total = Number(summary._sum.amount ?? 0);

  return (
    <AppShell>
      <PageHeader
        title="Expenses"
        description="Track business costs and keep profit figures accurate."
        action={{ label: "Add expense", href: "/expenses/new", icon: Plus }}
      />

      <Card className="mb-6 overflow-hidden border-0 bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-100">
        <CardContent className="flex flex-col justify-between gap-3 p-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-orange-100">
              Total recorded expenses
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight">
              {formatCurrency(total)}
            </p>
          </div>
          <p className="text-sm text-orange-100">
            {expenses.length} {expenses.length === 1 ? "entry" : "entries"}
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        {expenses.length ? (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Expense</th>
                  <th>Category</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th className="text-right">Amount</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>
                      <p className="font-semibold text-slate-900">
                        {expense.description}
                      </p>
                      {expense.notes && (
                        <p className="mt-0.5 max-w-xs truncate text-xs text-slate-400">
                          {expense.notes}
                        </p>
                      )}
                    </td>
                    <td>
                      <Badge variant="outline">{expense.category}</Badge>
                    </td>
                    <td className="whitespace-nowrap text-slate-500">
                      {expense.client?.name || "General"}
                    </td>
                    <td className="whitespace-nowrap text-slate-500">
                      {formatDate(expense.expenseDate)}
                    </td>
                    <td className="text-right font-semibold text-slate-900">
                      {formatCurrency(expense.amount.toString())}
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon">
                          <Link
                            href={`/expenses/${expense.id}/edit`}
                            aria-label={`Edit ${expense.description}`}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DeleteDialog
                          compact
                          title="Delete this expense?"
                          description="This expense will be permanently removed and dashboard totals will update immediately."
                          action={deleteExpense.bind(null, expense.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Receipt}
            title="No expenses recorded"
            description="Add your business costs to see an accurate profit on the dashboard."
            action={{ label: "Add first expense", href: "/expenses/new" }}
          />
        )}
      </Card>
    </AppShell>
  );
}
