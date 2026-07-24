"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/lib/actions";

import { SubmitButton } from "./submit-button";

type ClientValues = {
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  address: string | null;
};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-xs font-medium text-rose-600">{messages[0]}</p>;
}

export function ClientForm({
  action,
  client,
  cancelHref = "/clients",
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  client?: ClientValues;
  cancelHref?: string;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-6">
      {state.error && <Alert message={state.error} />}
      <div className="form-grid">
        <div className="form-field">
          <Label htmlFor="name">Client name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Jordan Lee"
            defaultValue={client?.name}
            aria-invalid={Boolean(state.fieldErrors?.name)}
            required
          />
          <FieldError messages={state.fieldErrors?.name} />
        </div>
        <div className="form-field">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="jordan@studio.co"
            defaultValue={client?.email}
            aria-invalid={Boolean(state.fieldErrors?.email)}
            required
          />
          <FieldError messages={state.fieldErrors?.email} />
        </div>
        <div className="form-field">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            name="company"
            placeholder="Northstar Studio"
            defaultValue={client?.company ?? ""}
            aria-invalid={Boolean(state.fieldErrors?.company)}
          />
          <FieldError messages={state.fieldErrors?.company} />
        </div>
        <div className="form-field">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+1 (555) 014-9082"
            defaultValue={client?.phone ?? ""}
            aria-invalid={Boolean(state.fieldErrors?.phone)}
          />
          <FieldError messages={state.fieldErrors?.phone} />
        </div>
      </div>
      <div className="form-field">
        <Label htmlFor="address">Billing address</Label>
        <Textarea
          id="address"
          name="address"
          placeholder={"248 Market Street\nSan Francisco, CA 94105"}
          defaultValue={client?.address ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.address)}
        />
        <FieldError messages={state.fieldErrors?.address} />
      </div>
      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
        <Button asChild type="button" variant="outline">
          <Link href={cancelHref}>Cancel</Link>
        </Button>
        <SubmitButton>{client ? "Save changes" : "Create client"}</SubmitButton>
      </div>
    </form>
  );
}
