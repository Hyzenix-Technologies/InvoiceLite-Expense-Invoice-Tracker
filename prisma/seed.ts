import { InvoiceStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type ItemInput = {
  description: string;
  quantity: number;
  rate: number;
};

function invoiceTotals(items: ItemInput[], taxRate: number) {
  const computedItems = items.map((item) => {
    const rateCents = Math.round(item.rate * 100);
    const amountCents = Math.round(item.quantity * rateCents);
    return { ...item, amount: amountCents / 100 };
  });
  const subtotalCents = computedItems.reduce(
    (sum, item) => sum + Math.round(item.amount * 100),
    0,
  );
  const taxCents = Math.round((subtotalCents * taxRate) / 100);
  return {
    items: computedItems,
    subtotal: subtotalCents / 100,
    taxAmount: taxCents / 100,
    total: (subtotalCents + taxCents) / 100,
  };
}

async function main() {
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.client.deleteMany();

  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: "Maya Chen",
        email: "maya@northstarstudio.co",
        phone: "+1 (415) 555-0142",
        company: "Northstar Studio",
        address: "248 Market Street\nSan Francisco, CA 94105",
      },
    }),
    prisma.client.create({
      data: {
        name: "Daniel Brooks",
        email: "daniel@fieldnote.co",
        phone: "+1 (503) 555-0187",
        company: "Fieldnote",
        address: "1120 SE Morrison Street\nPortland, OR 97214",
      },
    }),
    prisma.client.create({
      data: {
        name: "Sofia Reyes",
        email: "sofia@kindredcoffee.com",
        phone: "+1 (512) 555-0130",
        company: "Kindred Coffee",
        address: "803 Congress Avenue\nAustin, TX 78701",
      },
    }),
    prisma.client.create({
      data: {
        name: "Ethan Miller",
        email: "ethan@ridgewaylabs.io",
        phone: "+1 (720) 555-0164",
        company: "Ridgeway Labs",
        address: "1550 Wewatta Street\nDenver, CO 80202",
      },
    }),
    prisma.client.create({
      data: {
        name: "Priya Shah",
        email: "priya@commonthread.org",
        company: "Common Thread Foundation",
        address: "55 Washington Square\nNew York, NY 10012",
      },
    }),
    prisma.client.create({
      data: {
        name: "Jon Bell",
        email: "jon@bellandfinch.com",
        phone: "+1 (206) 555-0196",
        company: "Bell & Finch",
        address: "601 Pine Street\nSeattle, WA 98101",
      },
    }),
  ]);

  const invoiceData = [
    {
      invoiceNumber: "INV-2026-001",
      clientId: clients[0].id,
      issueDate: new Date("2026-05-08T12:00:00.000Z"),
      dueDate: new Date("2026-05-22T12:00:00.000Z"),
      status: InvoiceStatus.PAID,
      taxRate: 8.25,
      notes: "Thank you for trusting me with the Northstar brand refresh.",
      items: [
        { description: "Brand strategy workshop", quantity: 1, rate: 1200 },
        { description: "Visual identity system", quantity: 1, rate: 3600 },
        { description: "Brand guidelines", quantity: 1, rate: 1450 },
      ],
    },
    {
      invoiceNumber: "INV-2026-002",
      clientId: clients[1].id,
      issueDate: new Date("2026-05-27T12:00:00.000Z"),
      dueDate: new Date("2026-06-10T12:00:00.000Z"),
      status: InvoiceStatus.PAID,
      taxRate: 0,
      notes: "Payment received. It was a pleasure working with the Fieldnote team.",
      items: [
        { description: "Product design sprint", quantity: 5, rate: 780 },
        { description: "Prototype handoff", quantity: 1, rate: 650 },
      ],
    },
    {
      invoiceNumber: "INV-2026-003",
      clientId: clients[2].id,
      issueDate: new Date("2026-06-12T12:00:00.000Z"),
      dueDate: new Date("2026-06-26T12:00:00.000Z"),
      status: InvoiceStatus.PAID,
      taxRate: 8.25,
      notes: "Includes final files for the summer packaging series.",
      items: [
        { description: "Packaging concept design", quantity: 3, rate: 850 },
        { description: "Print-ready artwork", quantity: 6, rate: 220 },
      ],
    },
    {
      invoiceNumber: "INV-2026-004",
      clientId: clients[3].id,
      issueDate: new Date("2026-07-02T12:00:00.000Z"),
      dueDate: new Date("2026-07-16T12:00:00.000Z"),
      status: InvoiceStatus.UNPAID,
      taxRate: 0,
      notes: "Net 14. Please reference the invoice number with payment.",
      items: [
        { description: "SaaS dashboard UX audit", quantity: 1, rate: 2400 },
        { description: "Component library recommendations", quantity: 1, rate: 950 },
      ],
    },
    {
      invoiceNumber: "INV-2026-005",
      clientId: clients[4].id,
      issueDate: new Date("2026-07-11T12:00:00.000Z"),
      dueDate: new Date("2026-07-25T12:00:00.000Z"),
      status: InvoiceStatus.UNPAID,
      taxRate: 0,
      notes: "Thank you for the opportunity to support the annual report.",
      items: [
        { description: "Annual report art direction", quantity: 1, rate: 2800 },
        { description: "Editorial layout", quantity: 32, rate: 95 },
      ],
    },
    {
      invoiceNumber: "INV-2026-006",
      clientId: clients[5].id,
      issueDate: new Date("2026-07-18T12:00:00.000Z"),
      dueDate: new Date("2026-08-01T12:00:00.000Z"),
      status: InvoiceStatus.UNPAID,
      taxRate: 8.25,
      notes: "A 50% project deposit has been applied to this balance.",
      items: [
        { description: "E-commerce art direction", quantity: 1, rate: 1900 },
        { description: "Product page templates", quantity: 4, rate: 525 },
        { description: "Project deposit credit", quantity: 1, rate: 0 },
      ],
    },
  ];

  for (const invoice of invoiceData) {
    const totals = invoiceTotals(invoice.items, invoice.taxRate);
    await prisma.invoice.create({
      data: {
        invoiceNumber: invoice.invoiceNumber,
        clientId: invoice.clientId,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        status: invoice.status,
        taxRate: invoice.taxRate.toFixed(2),
        notes: invoice.notes,
        subtotal: totals.subtotal.toFixed(2),
        taxAmount: totals.taxAmount.toFixed(2),
        total: totals.total.toFixed(2),
        items: {
          create: totals.items.map((item) => ({
            description: item.description,
            quantity: item.quantity.toFixed(2),
            rate: item.rate.toFixed(2),
            amount: item.amount.toFixed(2),
          })),
        },
      },
    });
  }

  await prisma.expense.createMany({
    data: [
      {
        description: "Adobe Creative Cloud",
        category: "Software",
        amount: "59.99",
        expenseDate: new Date("2026-07-03T12:00:00.000Z"),
        notes: "Monthly design software subscription",
      },
      {
        description: "Figma Professional",
        category: "Software",
        amount: "15.00",
        expenseDate: new Date("2026-07-05T12:00:00.000Z"),
        clientId: clients[3].id,
        notes: "Workspace seat for Ridgeway project",
      },
      {
        description: "Color proof prints",
        category: "Professional services",
        amount: "186.40",
        expenseDate: new Date("2026-07-08T12:00:00.000Z"),
        clientId: clients[2].id,
      },
      {
        description: "Client workshop travel",
        category: "Travel",
        amount: "428.75",
        expenseDate: new Date("2026-07-10T12:00:00.000Z"),
        clientId: clients[0].id,
        notes: "Train and two nights near the Northstar office",
      },
      {
        description: "External SSD",
        category: "Equipment",
        amount: "149.00",
        expenseDate: new Date("2026-07-14T12:00:00.000Z"),
        notes: "Project archive and backup drive",
      },
      {
        description: "Portfolio domain renewal",
        category: "Marketing",
        amount: "32.00",
        expenseDate: new Date("2026-07-18T12:00:00.000Z"),
      },
      {
        description: "Design systems course",
        category: "Education",
        amount: "279.00",
        expenseDate: new Date("2026-07-21T12:00:00.000Z"),
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
