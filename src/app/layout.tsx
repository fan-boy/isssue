import type { Metadata } from "next";
import { Inter, Caveat, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hand",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: {
    default: "isssue — Create Together, Reveal Together",
    template: "%s | isssue",
  },
  description: "A monthly collaborative zine where friends each get a page. Create in secret, reveal together.",
  keywords: ["zine", "magazine", "friends", "collaborative", "monthly", "journal", "scrapbook"],
  authors: [{ name: "isssue" }],
  creator: "isssue",
  metadataBase: new URL("https://isssue.ink"),
  openGraph: {
    title: "isssue — Create Together, Reveal Together",
    description: "A monthly collaborative zine where friends each get a page.",
    url: "https://isssue.ink",
    siteName: "isssue",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "isssue — Create Together, Reveal Together",
    description: "A monthly collaborative zine where friends each get a page.",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${caveat.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
