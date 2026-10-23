import type { Metadata } from "next";
import { Readex_Pro } from "next/font/google";
import { getTheme } from "@/lib/theme-server";
import "./globals.css";

// Geometric, kufi-leaning sans that covers both Latin and Arabic,
// so Arabic item and customer names render in the same voice as the UI.
const readex = Readex_Pro({
  variable: "--font-readex",
  subsets: ["latin", "arabic"],
});

export const metadata: Metadata = {
  title: "Point of Sale",
  description: "Point of sale system",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // The theme is stored in a cookie so the server renders the right one and
  // there is no flash on load. "system" leaves data-theme off and CSS follows the OS.
  const theme = await getTheme();

  return (
    <html
      lang="en"
      data-theme={theme === "system" ? undefined : theme}
      className={`${readex.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
