import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SettleIn — find a flat that works for everyone",
  description:
    "A shared decision tool for flatmates. Paste listings you find and instantly see whether a flat works for everyone, or who is being asked to compromise.",
};

export const viewport: Viewport = {
  themeColor: "#fbf8f6",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}
