import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getLang } from "@/lib/lang";
import { Providers } from "@/components/ui/Providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Wedding.lk — Sri Lankan wedding invitation websites", template: "%s · Wedding.lk" },
  description: "Create a beautiful Sinhala & English wedding invitation website in minutes. No coding. Share by link, collect RSVPs.",
};
export const viewport: Viewport = { themeColor: "#7a1f2b", width: "device-width", initialScale: 1 };

const UI_FONTS = "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Noto+Sans+Sinhala:wght@400;500;600;700&family=Abhaya+Libre:wght@600;700&display=swap";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={UI_FONTS} />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
        <Providers lang={lang}>{children}</Providers>
      </body>
    </html>
  );
}
