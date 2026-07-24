import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { ClientForm } from "@/components/client-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateClient } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) notFound();

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <div className="mb-7">
          <h1 className="page-heading">Edit client</h1>
          <p className="page-subheading">
            Keep contact and billing details up to date.
          </p>
        </div>
        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Client information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ClientForm
              action={updateClient.bind(null, client.id)}
              client={client}
              cancelHref={`/clients/${client.id}`}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
