import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Ayush Halpati — Full-Stack & GenAI Developer",
  description:
    "Ayush Halpati builds full-stack products with generative AI built in — TableFlow, DeliveryProof, and more.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#F9F8F6] text-[#111111] antialiased selection:bg-[#0047FF] selection:text-white">
        {children}
      </body>
    </html>
  );
}
