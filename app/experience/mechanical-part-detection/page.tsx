import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'AI-Based Mechanical Part Detection — Lessons Learned | Ayush Halpati',
  description: 'Internship project experience covering YOLOv8 Nano segmentation, dataset curation, DINOv2 clustering, augmentations, and Unity Android/AR integration.',
};

export default function MechanicalPartDetectionPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-[#F9F8F6]">
        <article className="border-b border-[#111111]/15">
          <div className="mx-auto max-w-4xl px-6 py-20">
            <Link
              href="/#experience"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0047FF] hover:underline"
            >
              ← Back to Experience
            </Link>

            <header className="mt-8 border-b border-[#111111]/15 pb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0047FF]">
                EXPERIENCE // PAGE 02
              </span>
              <h1 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight text-[#111111] sm:text-5xl">
                AI-Based Mechanical Part Detection
              </h1>
            </header>

            <div className="mt-10 space-y-12 text-[#222222]">
              {/* Project Overview */}
              <section>
                <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[#111111]">
                  Project Overview
                </h2>
                <p className="mt-3 text-base leading-relaxed text-[#444444]">
                  This internship project focused on identifying and segmenting mechanical components using computer vision and integrating the model into a Unity Android/AR workflow.
                </p>
                <p className="mt-3 text-base leading-relaxed text-[#444444]">
                  The project report describes a dataset of approximately 6,000 images across 25 mechanical component classes, containing both synthetic and real-world images.
                </p>
              </section>

              {/* Technical Workflow */}
              <section className="space-y-6">
                <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[#111111]">
                  Technical Workflow
                </h2>

                <div className="border-l-2 border-[#111111]/15 pl-5">
                  <h3 className="font-display text-lg font-bold text-[#111111]">
                    Dataset Creation and Annotation
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#444444]">
                    The documented workflow combined synthetic images generated from 3D mechanical models with real-world images collected from videos and online sources. Segmentation-based annotations were prepared using a pipeline involving Roboflow and semi-automatic mask generation.
                  </p>
                </div>

                <div className="border-l-2 border-[#111111]/15 pl-5">
                  <h3 className="font-display text-lg font-bold text-[#111111]">
                    Dataset Optimization
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#444444]">
                    The project report describes feature-based image clustering using DINOv2 to identify visually similar images and remove redundant samples. It also describes data augmentation, including background replacement, brightness variation, flipping, and scaling.
                  </p>
                </div>

                <div className="border-l-2 border-[#111111]/15 pl-5">
                  <h3 className="font-display text-lg font-bold text-[#111111]">
                    Model and Application Integration
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#444444]">
                    The project used YOLOv8 Nano with segmentation-based training and integrated the model into a Unity mobile application for Android. The documented workflow also considered camera processing and reducing unnecessary detection work while the camera was moving.
                  </p>
                </div>
              </section>

              {/* Evaluation and Limitations */}
              <section>
                <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[#111111]">
                  Evaluation and Limitations
                </h2>
                <p className="mt-3 text-base leading-relaxed text-[#444444]">
                  The technical report describes real-time identification under standard operating conditions. It also identifies limitations under low or variable lighting, partial occlusion, and motion blur.
                </p>
                <p className="mt-3 text-base leading-relaxed text-[#444444]">
                  I do not claim a specific mAP, inference-latency value, or independently reproduced improvement percentage here. Those results should only be published if the corresponding experiment records support them.
                </p>
              </section>

              {/* What I Learned */}
              <section>
                <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[#111111]">
                  What I Learned
                </h2>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-[#444444]">
                  <li>
                    Dataset construction, annotation quality, and diversity are important parts of a computer-vision workflow.
                  </li>
                  <li>
                    Combining synthetic and real-world data introduces practical dataset and generalization challenges.
                  </li>
                  <li>
                    A successful model workflow also requires integration with the intended application and device.
                  </li>
                  <li>
                    Lighting variation, occlusion, and motion blur remain important limitations to recognize during evaluation.
                  </li>
                </ul>
              </section>

              {/* Contribution */}
              <section>
                <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[#111111]">
                  Contribution
                </h2>
                <p className="mt-3 text-base leading-relaxed text-[#444444]">
                  I contributed to this project as part of an internship involving model training, dataset preparation, and Unity/Android integration. The project report acknowledges mentor and colleague contributions, so this description does not claim sole ownership of every technical decision or implementation.
                </p>
              </section>

              {/* Scope and Attribution Note */}
              <footer className="border-t border-[#111111]/15 pt-8 text-xs text-[#777777]">
                <p>
                  <strong>Scope and Attribution Note:</strong> This page summarizes project experience and learning. It is not intended to replace detailed case studies or imply that every implementation detail was independently authored, every hypothesis was conclusively proven, or every system has been independently certified for production use.
                </p>
              </footer>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
