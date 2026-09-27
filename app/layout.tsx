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
  title: "Ayush Halpati — Full-Stack Developer, GenAI/RAG",
  description:
    "Ayush Halpati builds full-stack products with generative AI and RAG pipelines woven in — TableFlow, DeliveryProof, and more.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#0B0F14] text-[#E6E8EB] antialiased selection:bg-[#5EEAD4] selection:text-[#0B0F14]">
        {children}
      </body>
    </html>
  );
}
