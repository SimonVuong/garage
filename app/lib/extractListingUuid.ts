const UUID_RE =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/**
 * Extracts a listing UUID from pasted ShopGarage text (full URL or slug containing the id).
 */
export function extractListingUuid(input: string): string | null {
  const trimmed = input.trim().replace(/^["']|["']$/g, "");
  if (!trimmed) return null;
  const match = trimmed.match(UUID_RE);
  return match ? match[0].toLowerCase() : null;
}
