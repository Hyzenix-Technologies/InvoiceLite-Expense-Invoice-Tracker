import { AppShell } from "@/components/app-shell";
import { ClientForm } from "@/components/client-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/actions";

export default function NewClientPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <div className="mb-7">
          <h1 className="page-heading">Add a new client</h1>
          <p className="page-subheading">
            Save their billing details for faster invoices.
          </p>
        </div>
        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Client information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ClientForm action={createClient} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
