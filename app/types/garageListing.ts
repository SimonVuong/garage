/** Subset of Garage listing API JSON used for invoices. */
export type GarageListing = {
  id: string;
  listingTitle?: string | null;
  sellingPrice?: number | null;
  appraisedPrice?: number | null;
  itemBrand?: string | null;
  itemAge?: number | null;
  listingDescription?: string | null;
  secondaryId?: number | null;
  status?: string | null;
  address?: { state?: string | null } | null;
  category?: { name?: string | null } | null;
};
