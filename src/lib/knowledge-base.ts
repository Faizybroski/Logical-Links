export interface KnowledgeBaseArticle {
  slug:    string;
  title:   string;
  summary: string;
  body:    string[]; // paragraphs
}

export const KNOWLEDGE_BASE_ARTICLES: KnowledgeBaseArticle[] = [
  {
    slug:    "how-to-request-a-quote",
    title:   "How to Request a Quote",
    summary: "Get pricing for a delivery before booking a delivery.",
    body: [
      "From the Quotations page, click \"New Quotation\" and fill in the customer, origin/destination, and cargo details. If the quote is tied to an existing delivery, link it so both records stay in sync.",
      "Once submitted for review, your account manager will price the quotation and send it back to you. You'll see it move from \"Pending Review\" to a decision once it's ready.",
      "When a quotation is sent to you, open it from the Quotations table and review the line items, pricing, and terms. Accept it to confirm the work, or decline it if it no longer fits your needs.",
    ],
  },
  {
    slug:    "how-to-track-a-delivery",
    title:   "How to Track a Delivery",
    summary: "Follow a delivery from pickup to delivery in real time.",
    body: [
      "Open My Deliveries and click into any delivery to see its full details, including current status, estimated pickup/delivery dates, and the status timeline.",
      "The Tracking Timeline on the delivery's detail page shows every recorded event — pickup, in-transit checkpoints, and delivery — with timestamps and notes from the assigned team.",
      "Statuses update automatically as the delivery progresses (Confirmed → Assigned → Picked Up → In Transit → Out for Delivery → Delivered), so you always know exactly where things stand.",
    ],
  },
  {
    slug:    "understanding-invoices",
    title:   "Understanding Invoices",
    summary: "What each invoice status and figure means.",
    body: [
      "Invoices are issued once a delivery or quotation is ready to be billed. Each invoice shows the subtotal, any discount, tax, and the total amount due, along with a due date.",
      "The balance due reflects what's still outstanding after any payments received. If an invoice becomes overdue, it's flagged so you can settle it promptly and avoid disruption to future bookings.",
      "You can download a PDF copy of any invoice at any time from its detail view for your own records or to share with your accounts team.",
    ],
  },
  {
    slug:    "partner-tier-system",
    title:   "Partner Tier System",
    summary: "How your company's partnership level affects service.",
    body: [
      "Shipping companies are placed into a partner tier based on delivery volume, account history, and payment terms. Your tier can influence response times, priority handling, and available payment terms.",
      "As your delivery volume and account standing grow, your company becomes eligible for review at the next tier. There's nothing you need to request — your account manager will reach out when a tier change applies.",
      "If you have questions about your current tier or what it takes to move up, raise a support case and our team will walk you through the details specific to your account.",
    ],
  },
];
