import type { Metadata } from "next";
import { Anton, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { SITE_NAME } from "@/lib/constants";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: `${SITE_NAME} — Tapis personnalisés voiture, sol, mur, bureau`,
  description:
    "Configure ton tapis sur mesure — voiture, sol, mur ou bureau — et reçois un devis gratuit.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${anton.variable} ${barlow.variable}`}>
      <body className="font-body">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
