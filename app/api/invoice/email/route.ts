import { isValidEmail } from "@/app/lib/isValidEmail";
import { sendEmail } from "@/app/services/backend/emailService";
import { createListingInvoicePdfForListingUrl } from "@/app/services/backend/listingService";
import type { GarageListing } from "@/app/types/garageListing";

function listingSubject(listing: GarageListing): string {
  const t = listing.listingTitle?.replace(/\s+/g, " ").trim().slice(0, 80);
  return t ? `Garage invoice — ${t}` : "Garage listing invoice";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid body." }, { status: 400 });
  }

  const { listingUrl: listingUrlRaw, to: toRaw } = body as {
    listingUrl?: unknown;
    to?: unknown;
  };

  if (typeof listingUrlRaw !== "string") {
    return Response.json({ error: "Missing listingUrl." }, { status: 400 });
  }
  if (typeof toRaw !== "string") {
    return Response.json({ error: "Missing recipient email." }, { status: 400 });
  }

  const to = toRaw.trim();
  if (!isValidEmail(to)) {
    return Response.json({ error: "Invalid recipient email." }, { status: 400 });
  }

  const result = await createListingInvoicePdfForListingUrl(listingUrlRaw);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  const sent = await sendEmail({
    to,
    subject: listingSubject(result.listing),
    body: "<p>Your Garage listing invoice is attached as a PDF.</p>",
    attachments: [{ filename: result.filename, content: result.buffer }],
  });

  if (!sent.ok) {
    return Response.json({ error: sent.message }, { status: 502 });
  }

  return Response.json({ ok: true });
}
