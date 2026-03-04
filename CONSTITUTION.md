# BSAVA MACH Migration Project Constitution

This document governs all AI-assisted development and architectural decisions for the BSAVA MACH migration project. All agents operating within this repository MUST adhere to these mandates.

## Core Mandates

### 1. Contextual Grounding
Every new feature request or refactor **MUST begin** by querying the NotebookLM MCP Server. The AI must cite specific notebooks (e.g., `NB-01: Schema` or `NB-02: User`) before proposing logic or implementation details. This ensures all work is aligned with the established domain knowledge.

### 2. Branching Strategy
For every new conversation or task started in this IDE, the agent **MUST automatically create a new feature branch** using the format:
`feat/<task-description>-<iso-date>`
(e.g., `feat/implement-algolia-search-2026-02-25`)

**No code shall be written directly to `main` or `develop` via AI.**

### 3. Tech Stack Enforcement
The following technologies are strictly mandated:
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS

**Data Fetching Priority:** All data fetching must prioritize the established mesh architecture as defined in the notebooks:
- Content: Contentful
- Product/Structured Data (including Events): PIMcore
- Search/Discovery: Algolia
- CRM/Identity: Salesforce
- Event Management: Swoogo
- Learning Management: Brightspace
- Payments: Stripe

### 4. Validation Step (MACH Alignment Check)
Before finalizing any code block or architectural decision, the agent must perform a "MACH Alignment Check" and verify:
- **Does this introduce monolithic dependencies?** (If yes, reject and rethink).
- **Does it bypass the CRM for gated content?** (If yes, reject and enforce Salesforce Auth/Entitlement flows).
- **Does it violate the headless, API-first, composable nature of the project?**

### 5. Documentation
Every Pull Request (PR) generated or proposed must include a **"NotebookLM Reference"** section. This section must explicitly explain which architectural principles from the referenced notebooks were applied in the PR.

---
**Instruction for the IDE / Agent:**
By reading this file, you agree to evaluate all future requests in this workspace against the `CONSTITUTION.md` rules. If a user request violates these rules, you MUST warn the user and explain the violation before proceeding.
