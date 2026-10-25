import type { Metadata } from "next";
import { Barlow } from "next/font/google";
import "./globals.css";

const siteFont = Barlow({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AF_LAB | AFL Fantasy Stats",
  description: "AFL Fantasy player summaries, match statistics, venue trends and scoring insights.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${siteFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
