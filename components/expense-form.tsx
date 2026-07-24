"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/lib/actions";
import { toDateInput } from "@/lib/utils";

import { SubmitButton } from "./submit-button";

const categories = [
  "Software",
  "Equipment",
  "Marketing",
  "Travel",
  "Office",
  "Professional services",
  "Education",
  "Other",
];

type ExpenseValues = {
  description: string;
  category: string;
  amount: string;
  expenseDate: Date | string;
  clientId: string | null;
  notes: string | null;
};

type ClientOption = { id: string; name: string };

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-xs font-medium text-rose-600">{messages[0]}</p>;
}

export function ExpenseForm({
  action,
  clients,
  expense,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  clients: ClientOption[];
  expense?: ExpenseValues;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-6">
      {state.error && <Alert message={state.error} />}
      <div className="form-grid">
        <div className="form-field sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            name="description"
            placeholder="Figma Professional subscription"
            defaultValue={expense?.description}
            aria-invalid={Boolean(state.fieldErrors?.description)}
            required
          />
          <FieldError messages={state.fieldErrors?.description} />
        </div>
        <div className="form-field">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              $
            </span>
            <Input
              id="amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              className="pl-7"
              placeholder="0.00"
              defaultValue={expense?.amount}
              aria-invalid={Boolean(state.fieldErrors?.amount)}
              required
            />
          </div>
          <FieldError messages={state.fieldErrors?.amount} />
        </div>
        <div className="form-field">
          <Label htmlFor="expenseDate">Date</Label>
          <Input
            id="expenseDate"
            name="expenseDate"
            type="date"
            defaultValue={
              expense
                ? toDateInput(expense.expenseDate)
                : toDateInput(new Date())
            }
            aria-invalid={Boolean(state.fieldErrors?.expenseDate)}
            required
          />
          <FieldError messages={state.fieldErrors?.expenseDate} />
        </div>
        <div className="form-field">
          <Label htmlFor="category">Category</Label>
          <Select
            id="category"
            name="category"
            defaultValue={expense?.category ?? "Software"}
            aria-invalid={Boolean(state.fieldErrors?.category)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
          <FieldError messages={state.fieldErrors?.category} />
        </div>
        <div className="form-field">
          <Label htmlFor="clientId">Client (optional)</Label>
          <Select
            id="clientId"
            name="clientId"
            defaultValue={expense?.clientId ?? ""}
          >
            <option value="">General business expense</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="form-field">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Add a receipt reference or project context..."
          defaultValue={expense?.notes ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.notes)}
        />
        <FieldError messages={state.fieldErrors?.notes} />
      </div>
      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
        <Button asChild type="button" variant="outline">
          <Link href="/expenses">Cancel</Link>
        </Button>
        <SubmitButton>
          {expense ? "Save changes" : "Add expense"}
        </SubmitButton>
      </div>
    </form>
  );
}
