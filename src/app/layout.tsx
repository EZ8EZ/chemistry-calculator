import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zhang Lab \u2014 Metalloradical Catalysis Research",
  description:
    "Interactive visualization of Prof. X. Peter Zhang's research in metalloradical catalysis, cobalt porphyrin chemistry, and radical C\u2013H functionalization at Boston College.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
