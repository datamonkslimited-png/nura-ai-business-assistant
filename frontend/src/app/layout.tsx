import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "NURA – AI Business Assistant for Kenyan SMEs",
  description:
    "NURA helps Kenyan businesses automate WhatsApp sales, manage orders, and serve customers 24/7 with AI. Built by Datamonks.",
  keywords: "WhatsApp business Kenya, AI chatbot Kenya, M-Pesa integration, SME automation",
  authors: [{ name: "Datamonks", url: "https://datamonks.com" }],
  openGraph: {
    title: "NURA – AI Business Assistant",
    description: "Automate your business on WhatsApp with AI. Accept M-Pesa. Serve customers 24/7.",
    url: "https://nura.datamonks.com",
    siteName: "NURA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${bricolage.variable} ${jakarta.variable}`}>
      <body className="min-h-screen font-body antialiased">{children}</body>
    </html>
  );
}
