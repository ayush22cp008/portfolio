# Portfolio RAG Corpus

This directory contains the **curated approved RAG source corpus** for the Node 1 "Ask Ayush" RAG agent.

> **Important:** This corpus is intentionally **NOT** a mirror of the full records repositories.  
> Files here are **ingestion inputs only** — they are not runtime application code.  
> Resume ingestion is currently **deferred** and not included.

---

## Corpus Structure

```
corpus/
├── tableflow/         — 5 curated records for the TableFlow project
├── deliveryproof/     — 5 curated records for the DeliveryProof project
├── mechanical/        — README + approved technical report sections for Mechanical Part Detection
├── zeni/              — README for ZENI (thinking partner project)
├── ncert-ai-tutor/    — README for NCERT AI Tutor project
└── profile/           — lib/data.ts (canonical portfolio profile data)
```

---

## Sources

### TableFlow (5 curated records)

| File | Source Type | Original Path |
|---|---|---|
| `TableFlow_Final_Project_Handoff.md` | curated-record | local-download |
| `TableFlow_Final_Verification.md` | curated-record | local-download |
| `TableFlow_Major_Verified_Challenges_and_Fixes.md` | curated-record | local-download |
| `TableFlow_Important_Technical_Decisions.md` | curated-record | local-download |
| `TableFlow_Approved_Final_Architecture.md` | curated-record | local-download |

These five files are the **official validated portfolio record set** for TableFlow — a curated layer over the `TableFlow_Records` repository. They are not a blind ingest of the entire repository.

---

### DeliveryProof (5 curated records)

| File | Source Type | Original Path |
|---|---|---|
| `DeliveryProof_Final_Project_Handoff.md` | curated-record | local-download |
| `DeliveryProof_Final_Verification.md` | curated-record | local-download |
| `DeliveryProof_Major_Verified_Challenges_and_Fixes.md` | curated-record | local-download |
| `DeliveryProof_Important_Technical_Decisions.md` | curated-record | local-download |
| `DeliveryProof_Approved_Final_Architecture.md` | curated-record | local-download |

These five files are the **official validated portfolio record set** for DeliveryProof — a curated layer over the `Freight_Records` repository.

---

### Mechanical Part Detection (README + approved technical report)

| File | Source Type | Original Source |
|---|---|---|
| `README.md` | canonical-readme | `github.com/ayush22cp008/AI-Based-Mechanical-Part-Detection` |
| `Technical_Report_Approved.md` | technical-report-derived | `4CP33_PROJECT_22CP008_REPORT.pdf` (approved technical sections only) |

The technical report PDF has been filtered to **technical portions only** (Abstract, Introduction, Methodology, Architecture, Implementation, Conclusion). Non-technical sections (certificates, acknowledgements, table of contents, list of figures, references) have been excluded.

---

### ZENI (README only)

| File | Source Type | Original Source |
|---|---|---|
| `README.md` | canonical-readme | `github.com/ayush22cp008/ZENI-thinking-partner` |

README is the canonical Node 1 source. Additional files may be added only after explicit approval.

---

### NCERT AI Tutor (README only)

| File | Source Type | Original Source |
|---|---|---|
| `README.md` | canonical-readme | `github.com/ayush22cp008/NCERT-AI-Tutor` |

README is the canonical Node 1 source. This is the portfolio's explicitly documented RAG-related project.

---

### Profile

| File | Source Type | Original Source |
|---|---|---|
| `data.ts` | canonical-typescript | `lib/data.ts` in this repository |

Used for profile information, project metadata, and current portfolio-facing structured data.

---

## Deferred Sources

| Source | Status |
|---|---|
| Resume | **DEFERRED** — Not a Node 1 prerequisite. Will be added as a separate canonical source when an approved resume source is available. |

---

## Content Safety

The following are explicitly **NOT** in this corpus:
- `.env`, `.env.local`, API keys, credentials, tokens, secrets
- `node_modules`, build artifacts, binaries
- Unrelated personal information or private documents
- Raw records repositories (only curated files are included)
- Unapproved project documentation
