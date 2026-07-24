import Link from "next/link";
import { Building2, Mail, Plus, Users } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatCurrency, getInitials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    include: {
      invoices: { select: { total: true, status: true } },
      _count: { select: { invoices: true } },
    },
  });

  return (
    <AppShell>
      <PageHeader
        title="Clients"
        description="Keep client details and billing history in one place."
        action={{ label: "Add client", href: "/clients/new", icon: Plus }}
      />

      {clients.length ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {clients.map((client) => {
            const billed = client.invoices.reduce(
              (sum, invoice) => sum + Number(invoice.total),
              0,
            );
            const outstanding = client.invoices
              .filter((invoice) => invoice.status === "UNPAID")
              .reduce((sum, invoice) => sum + Number(invoice.total), 0);
            return (
              <Link key={client.id} href={`/clients/${client.id}`}>
                <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-sm font-bold text-indigo-600">
                        {getInitials(client.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate font-semibold text-slate-950">
                          {client.name}
                        </h2>
                        <p className="mt-0.5 truncate text-sm text-slate-500">
                          {client.company || "Independent client"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 space-y-2.5 text-sm text-slate-500">
                      <p className="flex items-center gap-2 truncate">
                        <Mail className="h-4 w-4 text-slate-400" />
                        {client.email}
                      </p>
                      <p className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        {client._count.invoices}{" "}
                        {client._count.invoices === 1 ? "invoice" : "invoices"}
                      </p>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-xs text-slate-400">Total billed</p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {formatCurrency(billed)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Outstanding</p>
                        <p className="mt-1 font-semibold text-orange-600">
                          {formatCurrency(outstanding)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={Users}
            title="No clients yet"
            description="Add your first client, then you can create invoices and track project expenses."
            action={{ label: "Add your first client", href: "/clients/new" }}
          />
        </Card>
      )}
    </AppShell>
  );
}
