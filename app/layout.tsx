import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chem Digest",
  description: "Daily chemistry research digest — backend service, no dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
