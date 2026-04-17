import "server-only";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { GarageListing } from "@/app/types/garageListing";
import { formatUsd } from "@/app/lib/invoice/formatCurrency";

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    color: "#ea580c",
  },
  subtitle: {
    fontSize: 11,
    marginBottom: 24,
    color: "#6b7280",
  },
  section: { marginBottom: 14 },
  label: {
    fontSize: 9,
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  value: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  body: { fontSize: 10, lineHeight: 1.45, color: "#374151" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  rowLeft: { flex: 1, paddingRight: 12 },
  rowRight: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#111827" },
  meta: { fontSize: 9, color: "#9ca3af", marginTop: 28 },
});

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

export function InvoicePdfDocument({
  listing,
  generatedAt,
}: {
  listing: GarageListing;
  generatedAt: Date;
}) {
  const desc = listing.listingDescription?.trim() ?? "";
  const brandYear =
    [listing.itemBrand, listing.itemAge].filter(Boolean).join(" · ") || "—";

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>Garage</Text>
        <Text style={styles.subtitle}>Listing invoice</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Listing</Text>
          <Text style={styles.value}>{listing.listingTitle ?? "Untitled listing"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Details</Text>
          <Text style={styles.body}>
            Brand / year: {brandYear}
            {"\n"}
            Category: {listing.category?.name ?? "—"}
            {"\n"}
            Location (state): {listing.address?.state ?? "—"}
            {"\n"}
            {"\n"}
            Listing ID: {listing.id}
            {listing.secondaryId != null ? ` · #${listing.secondaryId}` : ""}
          </Text>
        </View>

        {desc ? (
          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.body}>{desc}</Text>
          </View>
        ) : null}

        <View style={[styles.row, { borderTopWidth: 0, paddingTop: 8 }]}>
          <View style={styles.rowLeft}>
            <Text style={styles.value}>Amount</Text>
            <Text style={[styles.body, { marginTop: 4 }]}>Listed selling price</Text>
          </View>
          <Text style={styles.rowRight}>{formatUsd(listing.sellingPrice)}</Text>
        </View>

        <Text style={styles.meta}>
          Generated {generatedAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
        </Text>
      </Page>
    </Document>
  );
}
