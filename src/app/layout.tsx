import type { Metadata } from "next";
import { Readex_Pro } from "next/font/google";
import { getTheme } from "@/lib/theme-server";
import { getI18n } from "@/i18n/server";
import { I18nProvider } from "@/i18n/I18nProvider";
import "./globals.css";

// Geometric, kufi-leaning sans that covers both Latin and Arabic,
// so Arabic item and customer names render in the same voice as the UI.
const readex = Readex_Pro({
  variable: "--font-readex",
  subsets: ["latin", "arabic"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.title, description: t.meta.description };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Theme and language both live in cookies so the server renders the right
  // ones with no flash. "system" leaves data-theme off and CSS follows the OS.
  const [theme, { locale, dir }] = await Promise.all([getTheme(), getI18n()]);

  return (
    <html
      lang={locale}
      dir={dir}
      data-theme={theme === "system" ? undefined : theme}
      className={`${readex.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
