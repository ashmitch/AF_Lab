import type { Metadata } from "next";
import { Barlow } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const siteFont = Barlow({
  variable: "--font-barlow",
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
      <body className="min-h-full flex flex-col">
        {children}
        <Script id="google-analytics-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-N444WP91RX');`}
        </Script>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-N444WP91RX"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
