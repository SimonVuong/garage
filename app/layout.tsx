import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Garage — Fire truck invoice",
  description: "Get a PDF invoice for a fire truck listing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-dvh overflow-hidden">
      <body className="h-dvh min-h-0 overflow-hidden bg-white font-sans text-[#202124] antialiased">
        {children}
      </body>
    </html>
  );
}
