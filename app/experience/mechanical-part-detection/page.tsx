import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'AI‑Based Mechanical Part Detection — Lessons Learned | Ayush Halpati',
  description: 'Detailed engineering walkthrough of the mechanical part detection internship project, covering problem, investigation, root cause, solution, verification, and learnings.',
};

export default function MechanicalPartDetectionPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-[#111111]/15 bg-[#F9F8F6]" id="mechanical-part-detection">
          <div className="mx-auto max-w-4xl px-6 py-20">
          <a href="/#experience" className="inline-block mb-4 text-sm font-medium text-[#0047FF] underline">← Back to Experience</a>
            <h1 className="font-display text-4xl font-extrabold text-[#111111] sm:text-5xl">AI‑Based Mechanical Part Detection</h1>
            <p className="mt-4 text-base text-[#333333]"><strong>Problem:</strong> Need to reliably detect and segment thousands of mechanical part images for downstream AR tooling, with limited annotation resources.</p>
            <p className="mt-4 text-base text-[#333333]"><strong>Investigation:</strong> Benchmarked YOLOv8 Nano vs. larger models, evaluated data augmentation pipelines, and profiled inference latency on Android devices.</p>
            <p className="mt-4 text-base text-[#333333]"><strong>Root Cause:</strong> Initial training on raw images suffered from class imbalance and poor lighting variance, causing low mAP and unstable segmentation.</p>
            <p className="mt-4 text-base text-[#333333]"><strong>Solution:</strong> Implemented a balanced sampling strategy, synthetic lighting augmentation, and fine‑tuned YOLOv8 Nano.</p>
            <p className="mt-4 text-base text-[#333333]"><strong>Verification:</strong> Demonstrated functional segmentation and real‑time inference within the Unity AR prototype, confirming stability in on‑device testing.</p>
            <p className="mt-4 text-base text-[#333333]"><strong>What I Learned:</strong> Careful dataset curation is vital for small‑object detection; lightweight models can meet strict latency budgets when paired with targeted augmentations; integration testing on the target platform surfaces hidden performance bottlenecks early.</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
