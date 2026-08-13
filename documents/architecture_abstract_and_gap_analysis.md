# BSAVA Composable MACH Architecture
## Document Abstract, Bibliography, Gauntlet Stress-Test & Pre-Development Gap Analysis

| Document Details | Value |
| :--- | :--- |
| **Programme** | BSAVA Digital Transformation Programme (PR2742) |
| **Scope** | Audit of Core Architecture & Strategy Documents in `documents/architecture` |
| **Author** | Timberyard Architecture & Advisory Team |
| **Date** | August 2026 |
| **Status** | Final Baseline Audit & Readiness Assessment |

---

## 1. Document Bibliography & Executive Abstract

This section catalogues every primary architectural specification, strategy paper, vendor assessment, Workato standard, and diagram pack residing in [documents/architecture](file:///home/timbowden/dev/bsava-com/documents/architecture). (Note: External discovery handoff files written by Cirrico beginning with `"BSAVA - "` have been excluded per governance direction).

---

### Category A: Primary MACH Architecture Specifications & Interfaces

#### 1. API Architecture & Interface Specification
* **Files**: [api_architecture.md](file:///home/timbowden/dev/bsava-com/documents/architecture/api_architecture.md) | [api_architecture.pdf](file:///home/timbowden/dev/bsava-com/documents/architecture/api_architecture.pdf)
* **Metadata**: Timberyard Architecture & Engineering Team | v1.0.0 | August 2026 | Technical Baseline
* **Purpose Summary**: Defines the complete API topology, interface contracts, authentication patterns, and data exchange specifications across all 10 Systems of Record (SoRs) in the composable stack.
* **Executive Description**: Serves as the definitive technical contract for frontend developers, backend microservice engineers, and Workato recipe builders. Establishes the 3 primary data sync patterns (Pattern 1: Real-time Webhooks, Pattern 2: Micro-batch Change Data Capture, Pattern 3: Direct Storage Copy). Details edge security using Next.js Edge Middleware for JWT validation, enforcement of UK GDPR compliance, and Workato task-quota optimization (limiting executions to 1,000,000 tasks/year through micro-batching and direct staging).

#### 2. Headless Composable MACH Architecture Specification
* **Files**: [BSAVA_MACH_ARCHITECTURE_DIAGRAM.md](file:///home/timbowden/dev/bsava-com/documents/architecture/BSAVA_MACH_ARCHITECTURE_DIAGRAM.md) | [MACH_ARCHITECTURE_DIAGRAM_ABSTRACT.md](file:///home/timbowden/dev/bsava-com/documents/architecture/MACH_ARCHITECTURE_DIAGRAM_ABSTRACT.md)
* **Metadata**: Timberyard Architecture Team | v1.2.0 | July 2026 | Under Review / Technical Blueprint
* **Purpose Summary**: Maps the macro system topology, presentation layer decoupling, edge compute routing, and microservice boundaries using standard Mermaid diagrams.
* **Executive Description**: Contrasts the target composable architecture (Next.js CDN Edge, Contentful CMS, PIMcore PIM/DAM, Commerce Layer OMS, Workato Integration Hub, Okta/Auth0 CIAM, Salesforce NPC) against current implementation gaps. Illustrates the strict separation between user-facing presentation services and asynchronous back-office data pipelines, establishing that the frontend never serves as an integration proxy.

#### 3. Workato Integration Recipes Specification
* **Files**: [WORKATO_INTEGRATIONS.md](file:///home/timbowden/dev/bsava-com/documents/architecture/WORKATO_INTEGRATIONS.md) | [WORKATO_INTEGRATIONS.pdf](file:///home/timbowden/dev/bsava-com/documents/architecture/WORKATO_INTEGRATIONS.pdf)
* **Metadata**: Timberyard Engineering Team | v1.0.0 | August 2026 | Production Specification
* **Purpose Summary**: Formulates the recipe designs, triggers, data mapping tables, retry logic, and Slack error-alerting channels for system-to-system integrations.
* **Executive Description**: Details 10 critical integration flows:
  1. Swoogo → PIMcore (Event Sync)
  2. Swoogo → Salesforce (Delegate Registrations Sync)
  3. Commerce Layer → Salesforce (Order Ingestion)
  4. Commerce Layer → Accounting ERP (Financial Posting)
  5. Salesforce → CIAM (Member Provisioning)
  6. PIMcore → Algolia (Catalog Indexing)
  7. Contentful → Algolia (Editorial Search Sync)
  8. Stripe → Accounting ERP (Payout Reconciliation)
  9. Brightspace → PIMcore (CPD Course Catalog Sync)
  10. Brightspace → Salesforce (CPD Progress & Completion Sync)
  Mandates exponential backoff retries (3×) and dead-letter handling via Slack `#platform-ops`.

---

### Category B: Data Governance, Systems of Record & Migration Strategy

#### 4. Systems of Record Architecture Whitepaper
* **Files**: [BSAVA_Systems_of_Record_Architecture_Whitepaper.md](file:///home/timbowden/dev/bsava-com/documents/architecture/BSAVA_Systems_of_Record_Architecture_Whitepaper.md)
* **Metadata**: Timberyard Architecture & Engineering Team | v1.0.0 | August 2026 | Approved Reference
* **Purpose Summary**: Establishes data sovereignty governance, single-source-of-truth rules, and operational system boundaries across the BSAVA business domain.
* **Executive Description**: Enforces **The Single Source of Truth Rule**: *Every business entity type must have exactly one authoritative operational platform. Downstream systems may consume or cache, but never act as dual masters.* Defines the 10 data domains and their SoR owners:
  - Person/Contact Master: Salesforce NPC
  - User Credentials & Sessions: Okta Auth0 / Entra ID
  - Products, Assets & Entitlements: PIMcore
  - Editorial Content: Contentful
  - Cart, Orders & Subscriptions: Commerce Layer
  - Payments: Stripe
  - Events & Conferences: Swoogo
  - CPD & Learning: Brightspace
  - Financial Ledger: Accounting ERP
  - Search Operational Cache: Algolia

#### 5. Systems of Record Selection & Justifications (Enhanced)
* **Files**: [BSAVA_Systems_of_Record_Justifications_Enhanced.md](file:///home/timbowden/dev/bsava-com/documents/architecture/BSAVA_Systems_of_Record_Justifications_Enhanced.md) | [BSAVA_Systems_of_Record_Justifications_Enhanced.pdf](file:///home/timbowden/dev/bsava-com/documents/architecture/BSAVA_Systems_of_Record_Justifications_Enhanced.pdf) | [systems_of_record_and_justifications.md](file:///home/timbowden/dev/bsava-com/documents/architecture/systems_of_record_and_justifications.md)
* **Metadata**: Timberyard Architecture & Advisory Team | v1.1.0 / v1.0.0 | August 2026 | Approved Reference
* **Purpose Summary**: Provides deep architectural, operational, and financial justification for selecting specialized best-of-breed SoRs while rejecting legacy monolithic alternatives.
* **Executive Description**: Analyzes vendor trade-offs, security controls, licensing costs, and operational maintainability. Rejects monolithic legacy patterns in favor of specialized cloud-native platforms. Explains how decoupling reduces technical debt, locks in low-latency edge rendering, and protects UK GDPR compliance.

#### 6. Information Architecture, Integration Orchestration & Migration Strategy
* **Files**: [BSAVA_Information_Architecture_Orchestration_Migration_Strategy.md](file:///home/timbowden/dev/bsava-com/documents/architecture/BSAVA_Information_Architecture_Orchestration_Migration_Strategy.md) | [BSAVA_Information_Architecture_Orchestration_Migration_Strategy.pdf](file:///home/timbowden/dev/bsava-com/documents/architecture/BSAVA_Information_Architecture_Orchestration_Migration_Strategy.pdf)
* **Metadata**: Timberyard Advisory & Engineering Team | v1.0.0 | August 2026 | Strategic Roadmap
* **Purpose Summary**: Defines the master legacy data migration roadmap, ETL cleansing procedures, cross-system identity mapping scheme, and Workato-driven execution phases.
* **Executive Description**: Establishes the identity cross-reference schema mapping `bsava_user_id`, `salesforce_contact_id`, and `ciam_uid`. Outlines a 4-phase migration sequence: (1) Data Audit & Deduplication, (2) Historical Data Extraction into Lakehouse, (3) Target SoR Bulk Seeding, (4) Delta Sync & Cutover. Defines fallback strategies and rate-limit buffering to prevent API throttling during cutover.

---

### Category C: Partner Alignment & Architectural Boundary Briefings

#### 7. Cirrico Scope Shift & Architectural Landgrab Briefing
* **Files**: [Cirrico_Landgrab_Analysis_and_Briefing.md](file:///home/timbowden/dev/bsava-com/documents/architecture/Cirrico_Landgrab_Analysis_and_Briefing.md) | [Cirrico_Landgrab_Analysis_and_Briefing.pdf](file:///home/timbowden/dev/bsava-com/documents/architecture/Cirrico_Landgrab_Analysis_and_Briefing.pdf)
* **Metadata**: Timberyard Architecture & Executive Advisory | v1.0.0 | August 2026 | Steering Committee Briefing
* **Purpose Summary**: Identifies, documents, and provides strategic countermeasures against scope creep, architectural violations, and risk-shifting in Salesforce partner Cirrico's proposed configurations.
* **Executive Description**: Exposes 4 major architectural conflicts:
  1. **PCI & Payment Boundary Dumping**: Cirrico removed FinDock from scope and attempted to pass payment UI, MOTO orders, and PCI compliance onto Timberyard's frontend.
  2. **Finance Question Offloading**: Cirrico dumped 13 open banking/reconciliation questions (CAMT processing, Barclays auto-matching) onto Timberyard.
  3. **Entitlement Landgrab**: Cirrico created custom entitlement objects inside Salesforce `bsava-develop` sandbox, violating PIMcore's position as Entitlement Master.
  4. **Integration Layer Erasure**: Cirrico's legacy automation inventory ignored Workato and headless microservices, evaluating all 59 automations through a rigid "Salesforce vs Frontend" binary lens.

---

### Category D: Domain Strategy & Vendor Evaluation Documents

#### 8. Product Data Strategy & PIMcore Architecture Blueprint
* **Files**: [BSAVA PIM.pdf](file:///home/timbowden/dev/bsava-com/documents/architecture/BSAVA%20PIM.pdf)
* **Metadata**: Timberyard Solutions Architecture Team | v1.0 | July 2026 | Architectural Recommendation
* **Purpose Summary**: Formulates the architectural business case and technical domain model for establishing PIMcore as the master product and asset repository.
* **Executive Description**: Demonstrates why spreadsheet-based product management and CMS-embedded products lead to data corruption and catalog drift. Details PIMcore's multi-entity model (books, journals, digital resources, course passes, membership tiers) and DAM capability. Specifies GraphQL/REST API integration into Algolia, Commerce Layer, and Next.js frontend.

#### 9. Customer Identity & Access Management (CIAM) Selection
* **Files**: [CIAM Recommendations.pdf](file:///home/timbowden/dev/bsava-com/documents/architecture/CIAM%20Recommendations.pdf)
* **Metadata**: Timberyard Executive & Technical Team | v1.0 | July 7, 2026 | Recommendation Paper
* **Purpose Summary**: Evaluates Okta Auth0 vs. Microsoft Entra External ID for BSAVA's decoupled identity and Single Sign-On (SSO) infrastructure.
* **Executive Description**: Weighs Okta Auth0 (unrivaled developer velocity, turnkey Next.js Edge Middleware integration, lower integration risk) against Microsoft Entra External ID (disruptive cost efficiency with 50,000 free MAUs). Recommends Auth0 for velocity or Entra ID for aggressive TCO reduction, while emphasizing that identity must be fully decoupled from Salesforce CRM.

#### 10. AI & Search Strategy: "Will Your Website Survive the AI Shift?"
* **Files**: [Will your website survive the AI shift V1 23.7.26.docx.pdf](file:///home/timbowden/dev/bsava-com/documents/architecture/Will%20your%20website%20survive%20the%20AI%20shift%20V1%2023.7.26.docx.pdf)
* **Metadata**: Jason Coppin (CEO, Timberyard) | July 17, 2026 | Executive Thought Leadership
* **Purpose Summary**: Defines the strategic direction for AI search readiness, Generative Engine Optimization (GEO), and machine-parseable digital platform design.
* **Executive Description**: Explains why modern e-commerce must optimize for AI decision agents and semantic clarity over traditional keyword-stuffed SEO. Mandates structured JSON-LD schemas, semantically rich PIMcore taxonomies, and low-latency API surfaces to ensure BSAVA veterinary resources are easily indexed and recommended by modern AI engines.

---

### Category E: Integration Standards & Operational Checklists

#### 11. Workato Enterprise Standards & Recipe Development Suite
* **Files**:
  - [Workato Academy_ Naming Conventions.pdf](file:///home/timbowden/dev/bsava-com/documents/architecture/Workato%20Academy_%20Naming%20Conventions.pdf)
  - [Workato Academy_ Solution Design Checklist.pdf](file:///home/timbowden/dev/bsava-com/documents/architecture/Workato%20Academy_%20Solution%20Design%20Checklist.pdf)
  - [Workato Common Formulas (2024) v4.pdf](file:///home/timbowden/dev/bsava-com/documents/architecture/Workato%20Common%20Formulas%20(2024)%20v4.pdf)
  - [Workato Recipe Design Worksheet.pdf](file:///home/timbowden/dev/bsava-com/documents/architecture/Workato%20Recipe%20Design%20Worksheet.pdf)
* **Metadata**: Workato Academy / Incorporated by Timberyard | 2024–2026 Reference Standards
* **Purpose Summary**: Operational guidelines, formula references, naming conventions, and quality control checklists for building production-grade Workato recipes.
* **Executive Description**: Enforces standard naming conventions (`[Env] [Source] -> [Target] | [Entity] [Action]`), structured recipe design checklists (error policies, environment property separation), Ruby formula references (safe parsing, `.presence` checks, data transformation), and recipe design templates.

---

### Category F: Visual Architecture Diagram Packs & Assets

#### 12. BSAVA API & System Topology Diagram Suite
* **Files**:
  - [BSAVA-API-and-SoR-Replica-Diagram-Pack.zip](file:///home/timbowden/dev/bsava-com/documents/architecture/BSAVA-API-and-SoR-Replica-Diagram-Pack.zip) (11 High-Res PNG Diagrams + README)
  - Standalone Diagrams: [systems_of_record.png](file:///home/timbowden/dev/bsava-com/documents/architecture/systems_of_record.png), [workato_orchestration.png](file:///home/timbowden/dev/bsava-com/documents/architecture/workato_orchestration.png), [workato_patterns.png](file:///home/timbowden/dev/bsava-com/documents/architecture/workato_patterns.png), [data_domain.png](file:///home/timbowden/dev/bsava-com/documents/architecture/data_domain.png), [data_lakehouse.png](file:///home/timbowden/dev/bsava-com/documents/architecture/data_lakehouse.png), [deployments_and_resilience.png](file:///home/timbowden/dev/bsava-com/documents/architecture/deployments_and_resilience.png), [identity_cross_reference.png](file:///home/timbowden/dev/bsava-com/documents/architecture/identity_cross_reference.png), [member_purchase.png](file:///home/timbowden/dev/bsava-com/documents/architecture/member_purchase.png)
  - Asset Directory: [images/](file:///home/timbowden/dev/bsava-com/documents/architecture/images)
* **Metadata**: Timberyard Architecture Team | August 2026 | Visual Reference Artifacts
* **Purpose Summary**: Comprehensive collection of architecture diagrams visualizing data flows, ERDs, sequence diagrams, and deployment resilience models.
* **Executive Description**: Renders high-resolution topology diagrams covering real-time webhook flows, micro-batch CDC sync, direct S3 lakehouse storage staging, identity cross-referencing ERDs, and end-to-end member purchase/entitlement verification sequences.

---

## 2. The Gauntlet Approach: 5-Vector Architectural Stress Test

The **Gauntlet Approach** subjects the target architecture baseline to adversarial stress-testing across 5 critical engineering vectors to identify hidden operational risks and ambiguities before code is written.

```
       +-------------------------------------------------------+
       |             THE GAUNTLET STRESS-TEST                  |
       +-------------------------------------------------------+
                                   |
   +------------------+------------+------------+------------------+
   |                  |                         |                  |
[Vector 1]        [Vector 2]                [Vector 3]        [Vector 4]        [Vector 5]
 Data SoR         API Schema                State Sync        CIAM & Auth       Quotas & Dev
Sovereignty       Completeness             & Failures         Enforcement        Readiness
```

---

### Vector 1: System Boundaries & Data Sovereignty (The Landgrab Challenge)
* **Stress Test**: *Can the system maintain clean SoR boundaries when external partners build custom objects in CRM or attempt to shift payment liabilities?*
* **Evaluation**:
  - **FAIL / HIGH RISK**: Cirrico’s `bsava-develop` sandbox contains custom entitlement and order objects that replicate PIMcore and Commerce Layer functionality. If left unchecked, data will drift between Salesforce and PIMcore.
  - **FAIL / HIGH RISK**: Cirrico’s removal of FinDock leaves payment UI, MOTO phone orders, and PCI-DSS compliance in limbo without a formally signed-off boundary specification.
* **Verdict**: **REJECT Custom CRM Entitlement Objects**. Ensure Salesforce NPC sandbox configurations are aligned strictly with Timberyard's SoR Matrix.

---

### Vector 2: Interface Contracts & Schema Completeness (The API Challenge)
* **Stress Test**: *Are API endpoints, webhook payloads, data types, field validation rules, and error response schemas fully defined down to the wire level?*
* **Evaluation**:
  - **PASS**: `api_architecture.md` provides clear HTTP endpoints and high-level JSON payloads for Salesforce, PIMcore, Contentful, and Commerce Layer.
  - **FAIL / GAP**: Swoogo, Brightspace, and Commerce Layer webhooks lack concrete OpenAPI 3.0 / JSON Schema specifications. Field name variations (e.g. `user_id` vs `contact_id` vs `email`) are not fully reconciled across external systems.
  - **FAIL / GAP**: MOTO order creation and offline BACS processing payloads have no API schema contract.
* **Verdict**: **PARTIAL PASS**. Production development cannot start until machine-readable OpenAPI schemas are generated for all 10 Workato recipe triggers.

---

### Vector 3: Distributed State, Idempotency & Failure Modes (The Resilience Challenge)
* **Stress Test**: *How does the architecture handle network partitions, out-of-order webhooks, duplicate requests, and failed cross-system transactions?*
* **Evaluation**:
  - **PASS**: Workato recipe specs (`WORKATO_INTEGRATIONS.md`) mandate 3× exponential retries and Slack alerts for failed executions.
  - **FAIL / GAP**: No automated Dead-Letter Queue (DLQ) or replay mechanism is specified for webhooks dropped during vendor downtime (e.g., Swoogo outage during conference registration surge).
  - **FAIL / GAP**: Idempotency keys (`X-Idempotency-Key`) are not explicitly mandated for Commerce Layer → Salesforce order ingestion, creating duplicate order risk during network retries.
* **Verdict**: **CONDITIONAL PASS**. Require explicit idempotency key headers and automated S3/Lakehouse DLQ logging in all Workato recipes.

---

### Vector 4: Identity, CIAM & Authorization (The Security Challenge)
* **Stress Test**: *Can user sessions, entitlement checks, and RBAC permissions be verified at edge speed (< 50ms) without creating a performance bottleneck in Salesforce?*
* **Evaluation**:
  - **PASS**: Decoupling CIAM from Salesforce and validating JWT tokens in Next.js Edge Middleware guarantees sub-50ms session verification.
  - **FAIL / GAP**: The CIAM recommendation paper ([CIAM Recommendations.pdf](file:///home/timbowden/dev/bsava-com/documents/architecture/CIAM%20Recommendations.pdf)) leaves the final choice open between Okta Auth0 and Microsoft Entra External ID. The frontend SDK and middleware code cannot be standardized until this vendor decision is signed off.
  - **FAIL / GAP**: Token exchange specs for passing Auth0 JWT claims to PIMcore GraphQL entitlement queries are absent.
* **Verdict**: **BLOCKING GATE**. BSAVA Executive Leadership must sign off Auth0 vs Entra ID immediately to unblock authentication module development.

---

### Vector 5: Non-Functional Limits, Quotas & Environment Readiness (The Execution Challenge)
* **Stress Test**: *Are API rate limits, task quotas, environment credentials, and CI/CD pipelines validated for sprint execution?*
* **Evaluation**:
  - **PASS**: Architecture whitepaper explicitly addresses Workato’s 1,000,000 task/year quota by enforcing micro-batching and direct storage copy patterns.
  - **FAIL / GAP**: Environment credentials and API tokens for `bsava-develop` (Salesforce NPC sandbox), PIMcore staging, and Commerce Layer sandbox have not been validated in a unified local developer `.env` manifest.
  - **FAIL / GAP**: No automated performance test harness exists to verify that Workato micro-batches stay under daily API rate limits during migration.
* **Verdict**: **HIGH RISK**. Environment provisioning and API key distribution must be completed prior to Sprint 1 kickoff.

---

## 3. Pre-Development Gap Analysis & Action Plan

To transition smoothly into sprint development, all identified architectural gaps are classified below into **Category 1: Blocking Pre-Development Gaps (Must resolve before Sprint 1)** and **Category 2: High-Risk Technical Gaps (Resolve during Sprint 1 Prep)**.

---

### Category 1: Blocking Pre-Development Gaps (Must Resolve Before Sprint 1)

| Gap # | Domain / Component | Description of Gap & Risk | Required Remediation | Responsible Owner | Target Gate |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GAP-01** | **CIAM Selection** | Auth0 vs Entra ID remains undecided. Prevents building Next.js Edge auth middleware and token validation. | BSAVA Exec sign-off on CIAM provider based on TCO vs Velocity briefing. | BSAVA Exec / Timberyard | Immediate (Pre-Sprint 1) |
| **GAP-02** | **Payment & PCI Boundary** | FinDock was removed without signing off payment UI & MOTO responsibilities. | Execute formal Payment & PCI Boundary Agreement confirming Commerce Layer + Stripe handles all checkout UI & MOTO tokenization. | Timberyard / Cirrico / BSAVA | Pre-Sprint 1 |
| **GAP-03** | **Salesforce NPC Schema Alignment** | Custom entitlement/order objects exist in `bsava-develop` sandbox, violating PIMcore SoR. | Purge custom entitlement objects from NPC sandbox; re-align Salesforce schema to consume PIMcore entitlement webhooks. | Cirrico / Timberyard | Pre-Sprint 1 |
| **GAP-04** | **Environment Provisioning** | Missing unified local `.env` integration keys for Salesforce NPC sandbox, PIMcore preview, and Commerce Layer test org. | Provision and distribute sandbox credentials and API tokens to delivery teams. | BSAVA IT / All Vendors | Pre-Sprint 1 |

---

### Category 2: High-Risk Technical Gaps (Resolve During Sprint 1 Prep)

| Gap # | Domain / Component | Description of Gap & Risk | Required Remediation | Responsible Owner | Target Gate |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GAP-05** | **OpenAPI & JSON Schemas** | Swoogo, Brightspace, and Workato webhook contracts exist only as prose table descriptions, not machine-readable schemas. | Author OpenAPI 3.0 / JSON Schema specs for all 10 Workato integration endpoints. | Timberyard Engineering | Sprint 1 Week 1 |
| **GAP-06** | **Dead-Letter & Idempotency Spec** | Lack of automated DLQ replay logic and explicit `X-Idempotency-Key` headers on order ingestion recipes. | Add DLQ storage staging and idempotency headers to all Workato recipe templates. | Timberyard / Workato Lead | Sprint 1 Week 1 |
| **GAP-07** | **Finance Reconciliation (13 Qs)** | 13 open finance questions (CAMT processing, Barclays auto-match) lack formal ownership assignment. | Hold focused Finance & ERP Workshop with BSAVA finance team to assign ERP vs Workato ownership. | Timberyard / BSAVA Finance | Sprint 1 Week 2 |
| **GAP-08** | **Workato Task Quota Monitor** | 1,000,000 task/year quota risk if micro-batching is bypassed by unexpected event velocity. | Implement Workato task usage monitoring dashboard and automated alert at 75% threshold. | Timberyard Ops | Sprint 1 Week 2 |

---

## 4. Summary & Next Steps

1. **Baseline Document Established**: This document is placed at [documents/architecture_abstract_and_gap_analysis.md](file:///home/timbowden/dev/bsava-com/documents/architecture_abstract_and_gap_analysis.md) as the formal architecture audit baseline for the BSAVA Digital Transformation Programme (PR2742).
2. **Convene Steering Committee**: Present **GAP-01** (CIAM Selection), **GAP-02** (Payment Boundary), and **GAP-03** (NPC Schema Alignment) to BSAVA Executive Leadership for immediate sign-off.
3. **Unblock Sprint 1**: Upon resolution of Blocking Gaps GAP-01 through GAP-04, release engineering teams to begin presentation layer and integration recipe development.
