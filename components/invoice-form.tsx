"use client";

import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { useActionState, useMemo, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/lib/actions";
import { formatCurrency, toDateInput } from "@/lib/utils";

import { SubmitButton } from "./submit-button";

type ClientOption = {
  id: string;
  name: string;
  company: string | null;
};

type InvoiceItemValue = {
  id?: string;
  description: string;
  quantity: string;
  rate: string;
};

type InvoiceValues = {
  id: string;
  invoiceNumber: string;
  clientId: string;
  issueDate: Date | string;
  dueDate: Date | string;
  status: "PAID" | "UNPAID";
  taxRate: string;
  notes: string | null;
  items: InvoiceItemValue[];
};

function todayInput() {
  return toDateInput(new Date());
}

function dueDateInput() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return toDateInput(date);
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-xs font-medium text-rose-600">{messages[0]}</p>;
}

export function InvoiceForm({
  action,
  clients,
  invoice,
  suggestedNumber,
  selectedClientId,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  clients: ClientOption[];
  invoice?: InvoiceValues;
  suggestedNumber?: string;
  selectedClientId?: string;
}) {
  const [state, formAction] = useActionState(action, {});
  const [items, setItems] = useState<InvoiceItemValue[]>(
    invoice?.items?.length
      ? invoice.items
      : [{ description: "", quantity: "1", rate: "" }],
  );
  const [taxRate, setTaxRate] = useState(invoice?.taxRate ?? "8.25");

  const totals = useMemo(() => {
    const subtotalCents = items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const rateCents = Math.round((Number(item.rate) || 0) * 100);
      return sum + Math.round(quantity * rateCents);
    }, 0);
    const taxCents = Math.round(
      (subtotalCents * (Number(taxRate) || 0)) / 100,
    );
    return {
      subtotal: subtotalCents / 100,
      tax: taxCents / 100,
      total: (subtotalCents + taxCents) / 100,
    };
  }, [items, taxRate]);

  function updateItem(
    index: number,
    field: keyof InvoiceItemValue,
    value: string,
  ) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      { description: "", quantity: "1", rate: "" },
    ]);
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <form action={formAction} className="space-y-7">
      {state.error && <Alert message={state.error} />}

      <div className="form-grid">
        <div className="form-field">
          <Label htmlFor="invoiceNumber">Invoice number</Label>
          <Input
            id="invoiceNumber"
            name="invoiceNumber"
            defaultValue={invoice?.invoiceNumber ?? suggestedNumber}
            aria-invalid={Boolean(state.fieldErrors?.invoiceNumber)}
            required
          />
          <FieldError messages={state.fieldErrors?.invoiceNumber} />
        </div>
        <div className="form-field">
          <Label htmlFor="clientId">Bill to</Label>
          <Select
            id="clientId"
            name="clientId"
            defaultValue={invoice?.clientId ?? selectedClientId ?? ""}
            aria-invalid={Boolean(state.fieldErrors?.clientId)}
            required
          >
            <option value="" disabled>
              Select a client
            </option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
                {client.company ? ` — ${client.company}` : ""}
              </option>
            ))}
          </Select>
          <FieldError messages={state.fieldErrors?.clientId} />
        </div>
        <div className="form-field">
          <Label htmlFor="issueDate">Issue date</Label>
          <Input
            id="issueDate"
            name="issueDate"
            type="date"
            defaultValue={
              invoice ? toDateInput(invoice.issueDate) : todayInput()
            }
            aria-invalid={Boolean(state.fieldErrors?.issueDate)}
            required
          />
          <FieldError messages={state.fieldErrors?.issueDate} />
        </div>
        <div className="form-field">
          <Label htmlFor="dueDate">Due date</Label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={
              invoice ? toDateInput(invoice.dueDate) : dueDateInput()
            }
            aria-invalid={Boolean(state.fieldErrors?.dueDate)}
            required
          />
          <FieldError messages={state.fieldErrors?.dueDate} />
        </div>
        <div className="form-field">
          <Label htmlFor="status">Payment status</Label>
          <Select
            id="status"
            name="status"
            defaultValue={invoice?.status ?? "UNPAID"}
          >
            <option value="UNPAID">Unpaid</option>
            <option value="PAID">Paid</option>
          </Select>
        </div>
        <div className="form-field">
          <Label htmlFor="taxRate">Tax rate</Label>
          <div className="relative">
            <Input
              id="taxRate"
              name="taxRate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              className="pr-9"
              value={taxRate}
              onChange={(event) => setTaxRate(event.target.value)}
              aria-invalid={Boolean(state.fieldErrors?.taxRate)}
              required
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              %
            </span>
          </div>
          <FieldError messages={state.fieldErrors?.taxRate} />
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-950">Invoice items</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Add each service or deliverable as a line item.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4" />
            Add item
          </Button>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="hidden grid-cols-[1fr_100px_140px_120px_44px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
            <span>Description</span>
            <span>Quantity</span>
            <span>Rate</span>
            <span className="text-right">Amount</span>
            <span />
          </div>
          <div className="divide-y divide-slate-100">
            {items.map((item, index) => {
              const amountCents =
                Math.round((Number(item.quantity) || 0) * 100) *
                Math.round((Number(item.rate) || 0) * 100);
              const amount = amountCents / 10000;
              return (
                <div
                  key={item.id ?? `item-${index}`}
                  className="grid gap-3 p-4 md:grid-cols-[1fr_100px_140px_120px_44px] md:items-center"
                >
                  <div className="form-field md:block">
                    <Label
                      htmlFor={`item-description-${index}`}
                      className="md:sr-only"
                    >
                      Description
                    </Label>
                    <Input
                      id={`item-description-${index}`}
                      name="itemDescription"
                      placeholder="Brand identity design"
                      value={item.description}
                      onChange={(event) =>
                        updateItem(index, "description", event.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="form-field md:block">
                    <Label
                      htmlFor={`item-quantity-${index}`}
                      className="md:sr-only"
                    >
                      Quantity
                    </Label>
                    <Input
                      id={`item-quantity-${index}`}
                      name="itemQuantity"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(event) =>
                        updateItem(index, "quantity", event.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="form-field md:block">
                    <Label
                      htmlFor={`item-rate-${index}`}
                      className="md:sr-only"
                    >
                      Rate
                    </Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                        $
                      </span>
                      <Input
                        id={`item-rate-${index}`}
                        name="itemRate"
                        type="number"
                        min="0"
                        step="0.01"
                        className="pl-7"
                        placeholder="0.00"
                        value={item.rate}
                        onChange={(event) =>
                          updateItem(index, "rate", event.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:block md:text-right">
                    <span className="text-sm font-medium text-slate-500 md:hidden">
                      Amount
                    </span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Remove item ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="form-field">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Thank you for your business. Payment is due within 14 days."
            defaultValue={invoice?.notes ?? ""}
            className="min-h-32"
            aria-invalid={Boolean(state.fieldErrors?.notes)}
          />
          <FieldError messages={state.fieldErrors?.notes} />
        </div>
        <div className="rounded-xl bg-slate-950 p-5 text-white">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Tax ({Number(taxRate || 0).toFixed(2)}%)</span>
              <span>{formatCurrency(totals.tax)}</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-4 text-base font-bold">
              <span>Total</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
        <Button asChild type="button" variant="outline">
          <Link href={invoice ? `/invoices/${invoice.id}` : "/invoices"}>
            Cancel
          </Link>
        </Button>
        <SubmitButton pendingLabel="Saving invoice...">
          {invoice ? "Save changes" : "Create invoice"}
        </SubmitButton>
      </div>
    </form>
  );
}
