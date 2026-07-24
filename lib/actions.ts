"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

const clientSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  company: z.string().trim().max(100, "Company is too long.").optional(),
  phone: z.string().trim().max(30, "Phone number is too long.").optional(),
  address: z.string().trim().max(300, "Address is too long.").optional(),
});

const expenseSchema = z.object({
  description: z
    .string()
    .trim()
    .min(2, "Description must be at least 2 characters."),
  category: z.string().trim().min(2, "Choose a category."),
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  expenseDate: z.coerce.date({ error: "Choose a valid date." }),
  clientId: z.string().trim().optional(),
  notes: z.string().trim().max(500, "Notes are too long.").optional(),
});

const invoiceSchema = z.object({
  invoiceNumber: z
    .string()
    .trim()
    .min(3, "Invoice number must be at least 3 characters.")
    .max(30, "Invoice number is too long."),
  clientId: z.string().min(1, "Choose a client."),
  issueDate: z.coerce.date({ error: "Choose a valid issue date." }),
  dueDate: z.coerce.date({ error: "Choose a valid due date." }),
  status: z.enum(["PAID", "UNPAID"]),
  taxRate: z.coerce
    .number()
    .min(0, "Tax cannot be negative.")
    .max(100, "Tax cannot exceed 100%."),
  notes: z.string().trim().max(1000, "Notes are too long.").optional(),
});

function emptyToUndefined(value: FormDataEntryValue | null) {
  const stringValue = String(value ?? "").trim();
  return stringValue || undefined;
}

function prismaMessage(error: unknown, duplicateMessage: string) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return duplicateMessage;
  }
  return "Something went wrong while saving. Please try again.";
}

function clientInput(formData: FormData) {
  return {
    name: formData.get("name"),
    email: formData.get("email"),
    company: emptyToUndefined(formData.get("company")),
    phone: emptyToUndefined(formData.get("phone")),
    address: emptyToUndefined(formData.get("address")),
  };
}

export async function createClient(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = clientSchema.safeParse(clientInput(formData));
  if (!parsed.success) {
    return {
      error: "Check the highlighted information and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let clientId: string;
  try {
    const client = await prisma.client.create({ data: parsed.data });
    clientId = client.id;
  } catch (error) {
    return {
      error: prismaMessage(
        error,
        "A client with this email address already exists.",
      ),
    };
  }

  revalidatePath("/clients");
  revalidatePath("/");
  redirect(`/clients/${clientId}`);
}

export async function updateClient(
  id: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = clientSchema.safeParse(clientInput(formData));
  if (!parsed.success) {
    return {
      error: "Check the highlighted information and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.client.update({ where: { id }, data: parsed.data });
  } catch (error) {
    return {
      error: prismaMessage(
        error,
        "A client with this email address already exists.",
      ),
    };
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  revalidatePath("/");
  redirect(`/clients/${id}`);
}

export async function deleteClient(id: string) {
  await prisma.client.delete({ where: { id } });
  revalidatePath("/clients");
  revalidatePath("/invoices");
  revalidatePath("/expenses");
  revalidatePath("/");
  redirect("/clients");
}

function expenseInput(formData: FormData) {
  return {
    description: formData.get("description"),
    category: formData.get("category"),
    amount: formData.get("amount"),
    expenseDate: formData.get("expenseDate"),
    clientId: emptyToUndefined(formData.get("clientId")),
    notes: emptyToUndefined(formData.get("notes")),
  };
}

export async function createExpense(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = expenseSchema.safeParse(expenseInput(formData));
  if (!parsed.success) {
    return {
      error: "Check the highlighted information and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.expense.create({
      data: {
        ...parsed.data,
        amount: parsed.data.amount.toFixed(2),
        clientId: parsed.data.clientId || null,
      },
    });
  } catch {
    return { error: "The expense could not be saved. Please try again." };
  }

  revalidatePath("/expenses");
  revalidatePath("/");
  redirect("/expenses");
}

export async function updateExpense(
  id: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = expenseSchema.safeParse(expenseInput(formData));
  if (!parsed.success) {
    return {
      error: "Check the highlighted information and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.expense.update({
      where: { id },
      data: {
        ...parsed.data,
        amount: parsed.data.amount.toFixed(2),
        clientId: parsed.data.clientId || null,
      },
    });
  } catch {
    return { error: "The expense could not be updated. Please try again." };
  }

  revalidatePath("/expenses");
  revalidatePath("/");
  redirect("/expenses");
}

export async function deleteExpense(id: string) {
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/expenses");
  revalidatePath("/");
}

type ParsedInvoice = z.infer<typeof invoiceSchema> & {
  items: {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
  subtotal: number;
  taxAmount: number;
  total: number;
};

function parseInvoice(formData: FormData):
  | { success: true; data: ParsedInvoice }
  | { success: false; state: ActionState } {
  const parsed = invoiceSchema.safeParse({
    invoiceNumber: formData.get("invoiceNumber"),
    clientId: formData.get("clientId"),
    issueDate: formData.get("issueDate"),
    dueDate: formData.get("dueDate"),
    status: formData.get("status"),
    taxRate: formData.get("taxRate"),
    notes: emptyToUndefined(formData.get("notes")),
  });

  if (!parsed.success) {
    return {
      success: false,
      state: {
        error: "Check the highlighted information and try again.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  if (parsed.data.dueDate < parsed.data.issueDate) {
    return {
      success: false,
      state: {
        error: "The due date cannot be earlier than the issue date.",
        fieldErrors: { dueDate: ["Choose a date on or after the issue date."] },
      },
    };
  }

  const descriptions = formData.getAll("itemDescription").map(String);
  const quantities = formData.getAll("itemQuantity").map(Number);
  const rates = formData.getAll("itemRate").map(Number);

  if (
    descriptions.length === 0 ||
    descriptions.length !== quantities.length ||
    descriptions.length !== rates.length
  ) {
    return {
      success: false,
      state: { error: "Add at least one complete invoice item." },
    };
  }

  const items = descriptions.map((description, index) => {
    const quantity = quantities[index];
    const rate = rates[index];
    const rateCents = Math.round(rate * 100);
    const amountCents = Math.round(quantity * rateCents);
    return {
      description: description.trim(),
      quantity,
      rate,
      amount: amountCents / 100,
    };
  });

  if (
    items.some(
      (item) =>
        item.description.length < 2 ||
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0 ||
        !Number.isFinite(item.rate) ||
        item.rate < 0,
    )
  ) {
    return {
      success: false,
      state: {
        error:
          "Each item needs a description, a quantity above zero, and a valid rate.",
      },
    };
  }

  const subtotalCents = items.reduce(
    (sum, item) => sum + Math.round(item.amount * 100),
    0,
  );
  const taxCents = Math.round((subtotalCents * parsed.data.taxRate) / 100);

  return {
    success: true,
    data: {
      ...parsed.data,
      items,
      subtotal: subtotalCents / 100,
      taxAmount: taxCents / 100,
      total: (subtotalCents + taxCents) / 100,
    },
  };
}

export async function createInvoice(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseInvoice(formData);
  if (!parsed.success) return parsed.state;

  let invoiceId: string;
  try {
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: parsed.data.invoiceNumber,
        clientId: parsed.data.clientId,
        issueDate: parsed.data.issueDate,
        dueDate: parsed.data.dueDate,
        status: parsed.data.status,
        notes: parsed.data.notes,
        taxRate: parsed.data.taxRate.toFixed(2),
        subtotal: parsed.data.subtotal.toFixed(2),
        taxAmount: parsed.data.taxAmount.toFixed(2),
        total: parsed.data.total.toFixed(2),
        items: {
          create: parsed.data.items.map((item) => ({
            description: item.description,
            quantity: item.quantity.toFixed(2),
            rate: item.rate.toFixed(2),
            amount: item.amount.toFixed(2),
          })),
        },
      },
    });
    invoiceId = invoice.id;
  } catch (error) {
    return {
      error: prismaMessage(
        error,
        "That invoice number is already in use. Choose another one.",
      ),
    };
  }

  revalidatePath("/invoices");
  revalidatePath("/");
  revalidatePath(`/clients/${parsed.data.clientId}`);
  redirect(`/invoices/${invoiceId}`);
}

export async function updateInvoice(
  id: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseInvoice(formData);
  if (!parsed.success) return parsed.state;

  try {
    await prisma.$transaction([
      prisma.invoiceItem.deleteMany({ where: { invoiceId: id } }),
      prisma.invoice.update({
        where: { id },
        data: {
          invoiceNumber: parsed.data.invoiceNumber,
          clientId: parsed.data.clientId,
          issueDate: parsed.data.issueDate,
          dueDate: parsed.data.dueDate,
          status: parsed.data.status,
          notes: parsed.data.notes,
          taxRate: parsed.data.taxRate.toFixed(2),
          subtotal: parsed.data.subtotal.toFixed(2),
          taxAmount: parsed.data.taxAmount.toFixed(2),
          total: parsed.data.total.toFixed(2),
          items: {
            create: parsed.data.items.map((item) => ({
              description: item.description,
              quantity: item.quantity.toFixed(2),
              rate: item.rate.toFixed(2),
              amount: item.amount.toFixed(2),
            })),
          },
        },
      }),
    ]);
  } catch (error) {
    return {
      error: prismaMessage(
        error,
        "That invoice number is already in use. Choose another one.",
      ),
    };
  }

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  revalidatePath("/");
  redirect(`/invoices/${id}`);
}

export async function deleteInvoice(id: string) {
  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/invoices");
  revalidatePath("/");
  redirect("/invoices");
}

export async function setInvoiceStatus(
  id: string,
  status: "PAID" | "UNPAID",
) {
  await prisma.invoice.update({ where: { id }, data: { status } });
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  revalidatePath("/");
}
