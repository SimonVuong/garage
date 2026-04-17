import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { extractListingUuid } from "@/app/lib/extractListingUuid";
import { InvoicePdfDocument } from "@/app/lib/invoice/backend/InvoicePdfDocument";
import type { GarageListing } from "@/app/types/garageListing";

const DEFAULT_API_BASE = "https://garage-backend.onrender.com";

/** Characters unsafe or disallowed in file names across common OS APIs. */
const FILENAME_UNSAFE = /[<>:"/\\|?*;\u0000-\u001f]/g;

/**
 * `garage-invoice-{listingTitle}.pdf`, using the listing id if the title is missing or empty after cleanup.
 */
function invoiceDownloadFilename(
  listingTitle: string | null | undefined,
  listingId: string,
): string {
  const cleaned = listingTitle?.trim().replace(FILENAME_UNSAFE, "").replace(/\s+/g, " ").trim();
  const segment =
    cleaned && cleaned.length > 0 ? cleaned.slice(0, 120) : listingId;
  return `garage-invoice-${segment}.pdf`;
}

export type FetchListingFailure =
  | "not_found"
  | "upstream"
  | "network"
  | "invalid_json"
  | "invalid_listing";

export type CreateListingInvoicePdfForUrlResult =
  | { ok: true; buffer: Buffer; filename: string; listing: GarageListing }
  | { ok: false; error: string; status: number };

export async function fetchGarageListingById(
  id: string,
): Promise<{ ok: true; listing: GarageListing } | { ok: false; reason: FetchListingFailure }> {
  let upstream: Response;
  try {
    upstream = await fetch(`${DEFAULT_API_BASE}/listings/${id}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });
  } catch {
    return { ok: false, reason: "network" };
  }

  if (upstream.status === 404) return { ok: false, reason: "not_found" };
  if (!upstream.ok) return { ok: false, reason: "upstream" };

  let listing: GarageListing;
  try {
    listing = (await upstream.json()) as GarageListing;
  } catch {
    return { ok: false, reason: "invalid_json" };
  }

  if (!listing?.id) return { ok: false, reason: "invalid_listing" };
  return { ok: true, listing };
}

async function buildListingInvoicePdf(
  listing: GarageListing,
): Promise<{ ok: true; buffer: Buffer; filename: string } | { ok: false }> {
  const generatedAt = new Date();
  let buffer: Buffer;
  try {
    buffer = await renderToBuffer(
      createElement(InvoicePdfDocument, { listing, generatedAt }) as Parameters<
        typeof renderToBuffer
      >[0],
    );
  } catch {
    return { ok: false };
  }
  const filename = invoiceDownloadFilename(listing.listingTitle, listing.id);
  return { ok: true, buffer, filename };
}

/**
 * Resolves a pasted listing URL or UUID, loads the listing, and renders the invoice PDF.
 */
export async function createListingInvoicePdfForListingUrl(
  listingUrlRaw: string,
): Promise<CreateListingInvoicePdfForUrlResult> {
  const id = extractListingUuid(listingUrlRaw.trim());
  if (!id) {
    return {
      ok: false,
      error: "Could not find a listing id in that URL. Paste a full ShopGarage listing link.",
      status: 400,
    };
  }

  const fetched = await fetchGarageListingById(id);
  if (!fetched.ok) {
    if (fetched.reason === "not_found") {
      return { ok: false, error: "Listing not found.", status: 404 };
    }
    if (fetched.reason === "network") {
      return { ok: false, error: "Could not reach listing service.", status: 502 };
    }
    return { ok: false, error: "Listing service returned an error.", status: 502 };
  }

  const pdf = await buildListingInvoicePdf(fetched.listing);
  if (!pdf.ok) {
    return { ok: false, error: "Could not generate PDF.", status: 500 };
  }

  return {
    ok: true,
    buffer: pdf.buffer,
    filename: pdf.filename,
    listing: fetched.listing,
  };
}
