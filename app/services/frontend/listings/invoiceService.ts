"use client";

import { extractListingUuid } from "@/app/lib/extractListingUuid";

export type ListingInvoiceDownloadResult = { ok: true } | { ok: false; message: string };

export type ListingInvoiceEmailResult = { ok: true } | { ok: false; message: string };

const defaultError = "Could not download invoice. Please try again later.";
const defaultEmailError = "Could not send invoice email. Please try again later.";

function filenameFromContentDisposition(header: string | null): string {
  if (!header?.trim()) return "garage-invoice.pdf";
  const quoted = /filename="((?:\\.|[^"\\])*)"/i.exec(header);
  if (quoted?.[1]) return quoted[1].replace(/\\(.)/g, "$1");
  const star = /filename\*=(?:UTF-8''|utf-8'')([^;\s]+)/i.exec(header);
  if (star?.[1]) {
    try {
      return decodeURIComponent(star[1]);
    } catch {
      /* fall through */
    }
  }
  const plain = /filename=([^;\s]+)/i.exec(header);
  if (plain?.[1]) return plain[1].replace(/^["']|["']$/g, "");
  return "garage-invoice.pdf";
}

/**
 * Fetches the listing invoice PDF from the app API and triggers a browser download.
 * `listingId` must be the listing UUID (e.g. from {@link extractListingUuid}); the API body
 * still uses the `listingUrl` field name, which accepts a bare UUID.
 */
export async function downloadListingInvoice(listingId: string): Promise<ListingInvoiceDownloadResult> {
  const uuid = extractListingUuid(listingId);
  if (!uuid) {
    return {
      ok: false,
      message: "Could not find a listing id in that URL. Paste a full ShopGarage listing link.",
    };
  }

  let res: Response;
  try {
    res = await fetch("/api/invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingUrl: listingId.trim() }),
    });
  } catch {
    return { ok: false, message: "Network error. Check your connection and try again." };
  }

  const ct = res.headers.get("Content-Type") ?? "";
  if (!res.ok && ct.includes("application/json")) {
    let message = defaultError;
    try {
      const data = (await res.json()) as { error?: string };
      if (typeof data.error === "string" && data.error) message = data.error;
    } catch {
      /* keep default */
    }
    return { ok: false, message };
  }

  if (!res.ok) {
    return { ok: false, message: defaultError };
  }

  try {
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filenameFromContentDisposition(res.headers.get("Content-Disposition"));
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch {
    return { ok: false, message: defaultError };
  }

  return { ok: true };
}

/**
 * Emails the listing invoice PDF via the app API. Requires a resolved listing UUID.
 */
export async function emailListingInvoice(params: {
  listingId: string;
  to: string;
}): Promise<ListingInvoiceEmailResult> {
  const uuid = extractListingUuid(params.listingId);
  if (!uuid) {
    return {
      ok: false,
      message: "Could not find a listing id in that URL. Paste a full ShopGarage listing link.",
    };
  }

  let res: Response;
  try {
    res = await fetch("/api/invoice/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingUrl: params.listingId.trim(),
        to: params.to.trim(),
      }),
    });
  } catch {
    return { ok: false, message: "Network error. Check your connection and try again." };
  }

  const ct = res.headers.get("Content-Type") ?? "";
  if (!res.ok) {
    let message = defaultEmailError;
    if (ct.includes("application/json")) {
      try {
        const data = (await res.json()) as { error?: string };
        if (typeof data.error === "string" && data.error) message = data.error;
      } catch {
        /* keep default */
      }
    }
    return { ok: false, message };
  }

  return { ok: true };
}
