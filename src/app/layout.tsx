import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageContext";

export const metadata: Metadata = {
  title: "Crystal VIP Lounge - Premium QR Menu",
  description: "Experience the ultimate luxury dining and cocktail selection at Crystal Lounge. View our premium bottle services, signature cocktails, and live events.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}

