import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { ExpenseForm } from "@/components/expense-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateExpense } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [expense, clients] = await Promise.all([
    prisma.expense.findUnique({ where: { id } }),
    prisma.client.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!expense) notFound();

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <div className="mb-7">
          <h1 className="page-heading">Edit expense</h1>
          <p className="page-subheading">
            Update the amount, category, date, or client link.
          </p>
        </div>
        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Expense details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ExpenseForm
              action={updateExpense.bind(null, expense.id)}
              clients={clients}
              expense={{
                ...expense,
                amount: expense.amount.toString(),
              }}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
