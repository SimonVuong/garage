import { createListingInvoicePdfForListingUrl } from "@/app/services/backend/listingService";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || !("listingUrl" in body)) {
    return Response.json({ error: "Missing listingUrl." }, { status: 400 });
  }

  const listingUrlRaw = (body as { listingUrl: unknown }).listingUrl;
  if (typeof listingUrlRaw !== "string") {
    return Response.json({ error: "listingUrl must be a string." }, { status: 400 });
  }

  const result = await createListingInvoicePdfForListingUrl(listingUrlRaw);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return new Response(result.buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${result.filename.replace(/"/g, "")}"`,
      "Cache-Control": "no-store",
    },
  });
}
