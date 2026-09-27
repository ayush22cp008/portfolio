import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { ProofBar } from "@/components/ProofBar";
import { FeaturedProjects } from "@/components/FeaturedProjects";
import { Skills } from "@/components/Skills";
import { About } from "@/components/About";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <ProofBar />
        <FeaturedProjects />
        <Skills />
        <About />
      </main>
      <SiteFooter />
    </>
  );
}
