import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VersaTemple - Smart Housing Search in Dublin",
  description: "Find your ideal home based on commute times and proximity to amenities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
