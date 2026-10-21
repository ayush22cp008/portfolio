import { deflateSync } from "node:zlib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ResumeLink = { x1: number; y1: number; x2: number; y2: number; url: string };
type Segment = { text: string; url?: string; bold?: boolean; size?: number; color?: number[] };

function buildResumePdf(): Buffer {
  const PAGE_W = 595.276;
  const PAGE_H = 841.89;
  const DARK = [0.114, 0.161, 0.208];
  const MUTED = [0.28, 0.33, 0.40];
  const BLUE = [0.08, 0.36, 0.54];
  const RULE = [0.84, 0.88, 0.91];
  const cmds: string[] = [];
  const annotations: ResumeLink[] = [];
  const margin = 38;
  const maxWidth = PAGE_W - 2 * margin;
  let y = 800;

  function pdfEscape(value: string): string {
    return String(value)
      .replace(/[–—]/g, "-")
      .replace(/[’‘]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[^\x20-\x7E]/g, "-")
      .replace(/([\\()])/g, "\\$1");
  }
  function widthEstimate(value: string, size: number, bold = false): number {
    let units = 0;
    for (const ch of String(value)) {
      if (ch === " ") units += 0.25;
      else if ("ilI.,:;!|'".includes(ch)) units += 0.23;
      else if ("mwMW@%&".includes(ch)) units += 0.78;
      else if (/[A-Z]/.test(ch)) units += bold ? 0.64 : 0.62;
      else if (/[0-9]/.test(ch)) units += 0.52;
      else units += 0.5;
    }
    return units * size;
  }
  function drawText(x: number, y0: number, value: string, size = 8, bold = false, color = DARK): void {
    const font = bold ? "F2" : "F1";
    cmds.push(color[0] + " " + color[1] + " " + color[2] + " rg BT /" + font + " " + size + " Tf 1 0 0 1 " + x.toFixed(2) + " " + y0.toFixed(2) + " Tm (" + pdfEscape(value) + ") Tj ET");
  }
  function centered(value: string, y0: number, size: number, bold: boolean, color: number[]): void {
    drawText((PAGE_W - widthEstimate(value, size, bold)) / 2, y0, value, size, bold, color);
  }
  function link(x: number, y0: number, label: string, url: string, size = 8.1, bold = false): number {
    const width = widthEstimate(label, size, bold);
    drawText(x, y0, label, size, bold, BLUE);
    cmds.push("0.08 0.36 0.54 RG 0.35 w " + x.toFixed(2) + " " + (y0 - 1.1).toFixed(2) + " m " + (x + width).toFixed(2) + " " + (y0 - 1.1).toFixed(2) + " l S");
    annotations.push({ x1: x - 1, y1: y0 - 3, x2: x + width + 1, y2: y0 + size + 2, url });
    return x + width;
  }
  function inline(segments: Segment[], y0: number, startX = margin, size = 8.05): void {
    let x = startX;
    for (const segment of segments) {
      const segmentSize = segment.size || size;
      if (segment.url) x = link(x, y0, segment.text, segment.url, segmentSize, !!segment.bold);
      else {
        drawText(x, y0, segment.text, segmentSize, !!segment.bold, segment.color || DARK);
        x += widthEstimate(segment.text, segmentSize, !!segment.bold);
      }
    }
  }
  function wrap(value: string, size = 8.05, indent = 0): string[] {
    const capacity = Math.max(35, Math.floor((maxWidth - indent) / (size * 0.5)));
    const words = String(value).split(/\s+/);
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const candidate = line ? line + " " + word : word;
      if (candidate.length > capacity && line) {
        lines.push(line);
        line = word;
      } else line = candidate;
    }
    if (line) lines.push(line);
    return lines;
  }
  function paragraph(value: string, size = 8.05, leading = 9.7, indent = 0, color = DARK): void {
    for (const line of wrap(value, size, indent)) {
      drawText(margin + indent, y, line, size, false, color);
      y -= leading;
    }
    y -= 1;
  }
  function bullet(value: string): void {
    const size = 7.95;
    const leading = 9.45;
    const indent = 11;
    const lines = wrap(value, size, indent);
    for (let i = 0; i < lines.length; i++) {
      if (i === 0) cmds.push(BLUE[0] + " " + BLUE[1] + " " + BLUE[2] + " rg " + (margin + 2) + " " + (y + 2.5).toFixed(2) + " 2.1 2.1 re f");
      drawText(margin + indent, y, lines[i], size, false, DARK);
      y -= leading;
    }
    y -= 0.35;
  }
  function section(value: string): void {
    y -= 2.2;
    drawText(margin, y, value, 10, true, BLUE);
    y -= 3.7;
    cmds.push(RULE[0] + " " + RULE[1] + " " + RULE[2] + " RG 0.45 w " + margin + " " + y.toFixed(2) + " m " + (PAGE_W - margin) + " " + y.toFixed(2) + " l S");
    y -= 10.5;
  }

  centered("AYUSH JAYESHBHAI HALPATI", 799, 18.2, true, DARK);
  y = 780;
  centered("FULL-STACK DEVELOPER  |  GENAI & RAG INTEGRATION", y, 9.7, true, BLUE);
  y -= 16;
  const contact = "Navsari, Gujarat, India  |  +91 8320193553  |  ayushhalpati09@gmail.com";
  centered(contact, y, 8.3, false, MUTED);
  const contactStart = (PAGE_W - widthEstimate(contact, 8.3, false)) / 2;
  const phoneStart = contactStart + widthEstimate("Navsari, Gujarat, India  |  ", 8.3, false);
  const phoneWidth = widthEstimate("+91 8320193553", 8.3, false);
  annotations.push({ x1: phoneStart - 1, y1: y - 3, x2: phoneStart + phoneWidth + 1, y2: y + 10, url: "tel:+918320193553" });
  const emailStart = phoneStart + phoneWidth + widthEstimate("  |  ", 8.3, false);
  const emailWidth = widthEstimate("ayushhalpati09@gmail.com", 8.3, false);
  annotations.push({ x1: emailStart - 1, y1: y - 3, x2: emailStart + emailWidth + 1, y2: y + 10, url: "mailto:ayushhalpati09@gmail.com" });
  y -= 12;
  const topLinks: [string, string][] = [
    ["LinkedIn", "https://www.linkedin.com/in/ayush-halpati-886527260/"],
    ["GitHub", "https://github.com/ayush22cp008"],
    ["Portfolio", "https://portfolio-nu-five-5a7rlm4q24.vercel.app/"],
  ];
  const totalLinksWidth = topLinks.reduce((sum, item) => sum + widthEstimate(item[0], 8.2, false), 0) + widthEstimate("  |  ", 8.2, false) * 2;
  let topX = (PAGE_W - totalLinksWidth) / 2;
  topLinks.forEach((item, index) => {
    topX = link(topX, y, item[0], item[1], 8.2, false);
    if (index < 2) {
      drawText(topX + 3, y, "|", 8.2, false, MUTED);
      topX += widthEstimate("  |  ", 8.2, false);
    }
  });
  y -= 13;

  section("PROFESSIONAL SUMMARY");
  paragraph("Computer Engineering graduate (2026) focused on building full-stack web applications with React/Next.js, TypeScript, APIs and PostgreSQL/Supabase. Extends web products with GenAI capabilities including LLM API integration, RAG pipelines, embeddings and retrieval. Built role-based operational workflows, database-enforced order claiming, realtime notifications and LLM-powered applications; also brings hands-on computer-vision model training and deployment experience.", 8.05, 9.7);
  section("TECHNICAL SKILLS");
  paragraph("Frontend & Web: JavaScript, TypeScript, React.js, Next.js, HTML, CSS, responsive web UI", 8, 9.55);
  paragraph("Backend & Data: Node.js, Express.js, REST APIs, SQL, PostgreSQL, MySQL, MongoDB, Supabase Auth/Realtime/RLS/RPCs, Git/GitHub, Vercel", 8, 9.55);
  paragraph("GenAI & RAG: Groq API, Gemini API, Ollama, RAG, prompt engineering, embeddings, semantic retrieval, LangChain, ChromaDB, Sentence Transformers", 8, 9.55);
  paragraph("Python & ML: Python, PyTorch, YOLOv8, OpenCV, SAM, DINOv2, K-Means, scikit-learn, NumPy, Roboflow, dataset curation/augmentation", 8, 9.55);
  section("SELECTED PROJECTS");
  inline([{ text: "TableFlow", bold: true }, { text: "  |  Next.js, TypeScript, Supabase, PostgreSQL, Gemini  |  " }, { text: "GitHub", url: "https://github.com/ayush22cp008/TableFlow" }, { text: " / " }, { text: "Live", url: "https://table-flow-nu.vercel.app/" }], y); y -= 10.2;
  bullet("Solo-built for VibeAthon 6.0 and extended over the following month: staff roles, Row-Level Security, realtime notifications, Web Push and Gemini-powered demand forecasting.");
  bullet("Implemented database-enforced exclusive order claiming with row-locking PostgreSQL RPCs and verified behaviour against simultaneous claim attempts.");
  inline([{ text: "DeliveryProof", bold: true }, { text: "  |  Next.js, Supabase, PostgreSQL, Groq API  |  " }, { text: "GitHub", url: "https://github.com/ayush22cp008/DeliveryProof_hackathon" }, { text: " / " }, { text: "Live demo", url: "https://deliveryproofhackathon.vercel.app/" }, { text: " / " }, { text: "Video", url: "https://youtu.be/z_IU7KhAKrE" }, { text: " / " }, { text: "Devpost", url: "https://devpost.com/software/freight" }], y); y -= 10.2;
  bullet("Solo-built for the AI Builders Hackathon 2026: implemented Company, Driver and Reviewer workflows around a chronological delivery-evidence timeline; AI summaries use structured events while timestamps and state transitions remain deterministic.");
  inline([{ text: "ZENI - Private AI Thinking Partner", bold: true }, { text: "  |  React, Vite, Ollama, Groq  |  " }, { text: "GitHub", url: "https://github.com/ayush22cp008/ZENI-thinking-partner" }, { text: " / " }, { text: "Live", url: "https://zeni-thinking-partner.vercel.app/"}], y); y -= 10.2;
  bullet("Built an LLM workspace with project-context-aware prompts, streaming responses, structured-output parsing and prompt compilation from multi-turn sessions; supports local Ollama and cloud Groq modes.");
  inline([{ text: "NCERT AI Tutor", bold: true }, { text: "  |  Python, LangChain, ChromaDB, Groq, Streamlit  |  " }, { text: "GitHub", url: "https://github.com/ayush22cp008/NCERT-AI-Tutor" }, { text: " / " }, { text: "Live", url: "https://ncert-ai-tutor-appdhcgh4agx3ppbvxt4y7j.streamlit.app/"}], y); y -= 10.2;
  bullet("Built a RAG pipeline over Class 10 NCERT Maths and Science PDFs using chunking, local Sentence-Transformer embeddings, subject-filtered ChromaDB retrieval and Groq (Llama 3.1) generation in English and Hindi; added layered fallback handling for out-of-syllabus questions.");
  section("EXPERIENCE");
  inline([{ text: "AI/ML Intern (Full-Semester External Project) - Invisible Fiction", bold: true }, { text: "  |  15 Dec 2025 - 10 Apr 2026" }], y); y -= 10.2;
  inline([{ text: "V.V. Nagar, Anand, Gujarat  |  " }, { text: "Project repository", url: "https://github.com/ayush22cp008/AI-Based-Mechanical-Part-Detection" }, { text: " / " }, { text: "Demo video", url: "https://www.youtube.com/shorts/NPIHQJ7QCFs" }], y, margin, 8); y -= 10;
  bullet("Trained a YOLOv8 Nano segmentation model for 25 mechanical-part classes on a 6,000-image dataset (real images, Blender CAD renders and background-replacement composites).");
  bullet("Diagnosed background overfitting and applied background-replacement augmentation, reducing false positives by 30%+; built a data pipeline with Roboflow labels, SAM-assisted masks, manual review and DINOv2/K-Means near-duplicate filtering.");
  bullet("Integrated the lightweight model into an Android app using Unity/AR Foundation with stability-gated inference and General/Specific detection modes.");
  section("ACHIEVEMENT & EDUCATION");
  paragraph("VibeAthon 6.0 (NXTGENSEC, 25-27 Jul 2026): Certificate of Achievement; Top 60 of 800+ submissions for TableFlow.", 8.05, 9.6);
  paragraph("B.Tech, Computer Engineering - Birla Vishvakarma Mahavidyalaya (BVM) Engineering College, Anand, Gujarat  |  2022-2026", 8.05, 9.6);

  if (y < 28) throw new Error("Resume overflowed page");
  const contentBytes = deflateSync(Buffer.from(cmds.join("\n") + "\n", "latin1"));
  const objectCount = 6 + annotations.length;
  const objects: Buffer[] = [];
  objects[1] = Buffer.from("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n", "latin1");
  objects[2] = Buffer.from("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n", "latin1");
  const annotationRefs = annotations.map((_item, index) => (7 + index) + " 0 R").join(" ");
  objects[3] = Buffer.from("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + PAGE_W + " " + PAGE_H + "] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R /Annots [" + annotationRefs + "] >>\nendobj\n", "latin1");
  objects[4] = Buffer.from("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n", "latin1");
  objects[5] = Buffer.from("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n", "latin1");
  objects[6] = Buffer.concat([Buffer.from("6 0 obj\n<< /Length " + contentBytes.length + " /Filter /FlateDecode >>\nstream\n", "latin1"), contentBytes, Buffer.from("\nendstream\nendobj\n", "latin1")]);
  annotations.forEach((annotation, index) => {
    const id = 7 + index;
    const escapedUrl = annotation.url.replace(/([\\()])/g, "\\$1");
    objects[id] = Buffer.from(id + " 0 obj\n<< /Type /Annot /Subtype /Link /Rect [" + annotation.x1.toFixed(2) + " " + annotation.y1.toFixed(2) + " " + annotation.x2.toFixed(2) + " " + annotation.y2.toFixed(2) + "] /Border [0 0 0] /A << /S /URI /URI (" + escapedUrl + ") >> >>\nendobj\n", "latin1");
  });
  const parts: Buffer[] = [Buffer.from("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", "latin1")];
  const offsets: number[] = [0];
  let byteOffset = parts[0].length;
  for (let id = 1; id <= objectCount; id++) {
    offsets[id] = byteOffset;
    parts.push(objects[id]);
    byteOffset += objects[id].length;
  }
  const xrefOffset = byteOffset;
  let xref = "xref\n0 " + (objectCount + 1) + "\n0000000000 65535 f \n";
  for (let id = 1; id <= objectCount; id++) xref += String(offsets[id]).padStart(10, "0") + " 00000 n \n";
  xref += "trailer\n<< /Size " + (objectCount + 1) + " /Root 1 0 R >>\nstartxref\n" + xrefOffset + "\n%%EOF\n";
  parts.push(Buffer.from(xref, "latin1"));
  return Buffer.concat(parts);
}

export async function GET(): Promise<Response> {
  const pdf = buildResumePdf();
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Ayush_Halpati_Full_Stack_GenAI_Resume.pdf"',
      "Content-Length": String(pdf.length),
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
