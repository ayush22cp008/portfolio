export const profile = {
  name: "Ayush Halpati",
  tagline: "Entry-Level Software Developer focused on full-stack web development",
  grad: "B.Tech Computer Engineering, BVM Engineering College, Anand — 2026",
  location: "Gujarat, India",
  relocate: ["Bangalore", "Hyderabad", "Pune", "Delhi-NCR", "Mumbai"],
  github: "https://github.com/ayush22cp008",
  linkedin: "https://www.linkedin.com/in/ayush-halpati-886527260/",
  email: "ayushhalpati09@gmail.com",
  phone: "+91 8320193553",
  phoneHref: "tel:+918320193553",
  resumePath: "/resume.pdf",
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  category: "Full-Stack" | "GenAI" | "Computer Vision";
  liveUrl?: string;
  repoUrl: string;
  featured: boolean;
  status: string;
};

export const projects: Project[] = [
  {
    slug: "tableflow",
    name: "TableFlow",
    tagline: "Full-stack restaurant operations application with role-based workflows, live updates and demand forecasting.",
    description:
      "A restaurant operations application covering staff roles, digital ordering, seat-level table allocation, reservations, billing and Gemini-powered demand forecasting.",
    stack: ["Next.js 14", "TypeScript", "Supabase", "Postgres RLS", "Gemini API", "Resend", "Vercel"],
    category: "Full-Stack",
    liveUrl: "https://table-flow-nu.vercel.app",
    repoUrl: "https://github.com/ayush22cp008/TableFlow",
    featured: true,
    status: "VibeAthon 6.0 — Top 60 of 800+ submissions",
  },
  {
    slug: "deliveryproof",
    name: "DeliveryProof",
    tagline: "Full-stack logistics workflow for chronological delivery evidence and review.",
    description:
      "An evidence-first logistics workflow with Company, Driver and Reviewer roles. It captures trip events in a chronological timeline and uses Groq API to generate evidence summaries.",
    stack: ["Next.js", "React", "Supabase", "Postgres", "Groq API", "Vercel"],
    category: "Full-Stack",
    liveUrl: "https://deliveryproofhackathon.vercel.app",
    repoUrl: "https://github.com/ayush22cp008/DeliveryProof_hackathon",
    featured: true,
    status: "AI Builders Hackathon — Results announced",
  },
  {
    slug: "zeni",
    name: "ZENI",
    tagline: "A thinking-partner AI for working through ideas, not just answering questions.",
    description:
      "A conversational thinking partner designed to help reason through a problem rather than hand over a single answer.",
    stack: ["Python", "LangChain", "ChromaDB", "Groq API"],
    category: "GenAI",
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
    category: "GenAI",
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
    status: "Internship project",
  },
];

export const skillGroups = [
  {
    label: "Frontend",
    items: ["JavaScript", "TypeScript", "React.js", "Next.js", "HTML", "CSS", "Tailwind CSS"],
  },
  {
    label: "Backend & Data",
    items: ["Node.js", "Express.js", "REST APIs", "PostgreSQL", "MySQL", "MongoDB", "Supabase"],
  },
  {
    label: "AI / ML & Tools",
    items: ["Python", "LangChain", "RAG", "ChromaDB", "Groq API", "Ollama", "PyTorch", "YOLOv8", "Git/GitHub", "Vercel"],
  },
];
