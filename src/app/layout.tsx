import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "FENIX | Premium Custom Jersey Store",
  description:
    "Fenix custom jersey store — premium football-inspired jerseys, tees, and essentials with a complete modern e-commerce experience.",
  icons: { icon: "/assets/hero-product.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a2337",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
