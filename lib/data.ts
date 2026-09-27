export const profile = {
  name: "Ayush Halpati",
  tagline: "Full-Stack Developer with GenAI/RAG integration experience",
  grad: "B.Tech Computer Engineering, BVM Engineering College, Anand — 2026",
  location: "Gujarat, India",
  relocate: ["Bangalore", "Hyderabad", "Pune", "Delhi-NCR", "Mumbai"],
  github: "https://github.com/ayush22cp008",
};

export const proofStats = [
  { value: "5", label: "shipped products" },
  { value: "2", label: "hackathons built solo" },
  { value: "3", label: "RAG pipelines in production use" },
];

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  category: "Full-Stack" | "GenAI/RAG" | "Computer Vision";
  liveUrl?: string;
  repoUrl: string;
  featured: boolean;
  status: string;
};

export const projects: Project[] = [
  {
    slug: "tableflow",
    name: "TableFlow",
    tagline: "Smart restaurant management SaaS — live menu, queueing, seat-level tables, AI demand forecasting, billing.",
    description:
      "Full-stack SaaS for a single restaurant's internal operations: live menu, digital ordering, seat-level table allocation, Gemini-powered menu intelligence, reservations, and itemized billing.",
    stack: ["Next.js 14", "TypeScript", "Supabase", "Postgres RLS", "Gemini API", "Resend", "Vercel"],
    category: "Full-Stack",
    liveUrl: "https://table-flow-nu.vercel.app",
    repoUrl: "https://github.com/ayush22cp008/TableFlow",
    featured: true,
    status: "VibeAthon 6.0 — result pending",
  },
  {
    slug: "deliveryproof",
    name: "DeliveryProof",
    tagline: "AI-assisted evidence platform for logistics — chronological, verifiable proof of every facility interaction.",
    description:
      "An evidence-first accountability layer for freight: captures the chronological timeline of a trip and uses AI to summarize raw events into a defensible narrative for dispute resolution.",
    stack: ["Next.js", "React", "Supabase", "Postgres", "Groq", "Vercel"],
    category: "GenAI/RAG",
    liveUrl: "https://deliveryproofhackathon.vercel.app",
    repoUrl: "https://github.com/ayush22cp008/DeliveryProof_hackathon",
    featured: true,
    status: "AI Builders Hackathon — result pending",
  },
  {
    slug: "zeni",
    name: "ZENI",
    tagline: "A thinking-partner AI — RAG-backed conversational agent for working through ideas, not just answering questions.",
    description:
      "A RAG-backed conversational thinking partner built on LangChain and ChromaDB, designed to help reason through a problem rather than hand over a single answer.",
    stack: ["Python", "LangChain", "ChromaDB", "Groq API"],
    category: "GenAI/RAG",
    repoUrl: "https://github.com/ayush22cp008/ZENI-thinking-partner",
    featured: false,
    status: "Personal project",
  },
  {
    slug: "ncert-ai-tutor",
    name: "NCERT AI Tutor",
    tagline: "RAG-based tutor grounded in NCERT textbooks — answers stay scoped to the actual syllabus.",
    description:
      "A retrieval-augmented tutor that answers student questions strictly from NCERT textbook content, avoiding the hallucination risk of an ungrounded chatbot.",
    stack: ["Python", "RAG", "ChromaDB", "LangChain"],
    category: "GenAI/RAG",
    repoUrl: "https://github.com/ayush22cp008/NCERT-AI-Tutor",
    featured: false,
    status: "Personal project",
  },
  {
    slug: "mechanical-part-detection",
    name: "Mechanical Part Detection",
    tagline: "Computer vision pipeline for detecting and segmenting mechanical parts from images.",
    description:
      "A detection and segmentation pipeline for mechanical components, combining YOLOv8 for detection with SAM/DINOv2-backed refinement.",
    stack: ["Python", "PyTorch", "YOLOv8", "SAM", "DINOv2"],
    category: "Computer Vision",
    repoUrl: "https://github.com/ayush22cp008/AI-Based-Mechanical-Part-Detection",
    featured: false,
    status: "Personal project",
  },
];

export const skillGroups = [
  {
    label: "Frontend / Backend",
    items: ["Next.js", "TypeScript", "React", "Supabase", "Postgres", "Tailwind CSS", "Python"],
  },
  {
    label: "AI / ML",
    items: ["LangChain", "RAG pipelines", "ChromaDB", "Groq API", "Ollama", "PyTorch", "YOLOv8", "SAM", "DINOv2"],
  },
  {
    label: "Tools",
    items: ["Vercel", "Git/GitHub", "Claude", "ChatGPT", "Resend"],
  },
];
