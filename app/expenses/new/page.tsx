import { AppShell } from "@/components/app-shell";
import { ExpenseForm } from "@/components/expense-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createExpense } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewExpensePage() {
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <div className="mb-7">
          <h1 className="page-heading">Add an expense</h1>
          <p className="page-subheading">
            Record a business cost and optionally link it to a client.
          </p>
        </div>
        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Expense details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ExpenseForm action={createExpense} clients={clients} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
