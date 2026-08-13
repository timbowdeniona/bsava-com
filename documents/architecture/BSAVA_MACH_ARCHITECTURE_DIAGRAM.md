# BSAVA MACH Migration Architecture

This document provides a comprehensive overview of the headless, composable architecture being adopted for the BSAVA platform. It is split into two sections: the **Abstract Target Architecture** (the full ecosystem) and the **Current Implementation Status** (what is currently hooked up in this repository).

---

## 1. Abstract Target Architecture
This diagram outlines the complete ecosystem of headless services that form the BSAVA MACH platform. It highlights the decoupled nature of the services and the central role of **CIAM** and **CRM** in managing user identities and entitlements.

![Executive Architecture Overview](./documents/architecture/images/02-sor-executive-architecture.png)

```mermaid
flowchart TB
    %% Nodes
    User((User / Browser))
    
    subgraph Presentation ["1. Presentation Layer (Headless Frontend)"]
        direction TB
        NextJS["Next.js (App Router)"]
        Edge["Vercel Edge Runtime"]
        NextJS --- Edge
    end

    subgraph Identity ["2. Identity & CRM (The Core)"]
        direction TB
        Salesforce["Salesforce CRM (NPC)"]
        CIAM["Okta / Auth0 (CIAM)"]
        Salesforce -->|Syncs Member Data| CIAM
    end

    subgraph Content ["3. Content & Asset Management"]
        Contentful["Contentful (CMS)"]
        PIMcore["PIMcore (PIM/DAM)"]
    end

    subgraph Commerce ["4. Commerce, Events & Finance"]
        CommerceLayer["Commerce Layer (OMS)"]
        Stripe["Stripe (Payments)"]
        Swoogo["Swoogo (Events)"]
        Brightspace["Brightspace (LMS)"]
        SageIntacct["Sage Intacct (Financial ERP)"]
    end

    subgraph Discovery ["5. Search & Operational Cache"]
        Algolia["Algolia (Search)"]
    end

    subgraph Integration ["6. Integration & Orchestration"]
        Workato["Workato (Orchestration Hub)"]
    end

    subgraph Analytics ["7. Enterprise Analytics & Lakehouse"]
        Fabric["Microsoft Fabric (OneLake Lakehouse)"]
        PowerBI["Power BI (Reporting & Member 360)"]
        Fabric --> PowerBI
    end

    %% Interactions
    User -- "Browses / Searches" --> NextJS
    User -- "Authenticates" --> CIAM
    
    NextJS -- "Cart & Order API" --> CommerceLayer
    NextJS -- "GraphQL / REST" --> Contentful
    NextJS -- "GraphQL / REST" --> PIMcore
    NextJS -- "Validates JWT Token" --> CIAM
    NextJS -- "Instant Search" --> Algolia
    NextJS -- "Registration API" --> Swoogo
    CommerceLayer -- "Triggers Payment" --> Stripe
    NextJS -- "Learn / Progress" --> Brightspace

    %% Sync Flows (via Workato)
    Contentful -- "Webhooks" --> Workato
    PIMcore -- "Webhooks" --> Workato
    Swoogo -- "Webhooks" --> Workato
    CommerceLayer -- "Webhooks" --> Workato
    Brightspace -- "Events/Webhooks" --> Workato
    Stripe -- "Payment Events" --> Workato
    Salesforce -- "CDC / Micro-batch" --> Workato

    Workato -- "Sync Content/Products/Courses" --> Algolia
    Workato -- "Sync Events/Courses" --> PIMcore
    Workato -- "Provision Orders/CPD" --> Salesforce
    Workato -- "Confirm Registration" --> Swoogo
    Workato -- "Enrol Members" --> Brightspace
    Workato -- "Price/Stock Sync" --> CommerceLayer
    Workato -- "Post Invoices & GL" --> SageIntacct
    Workato -- "Micro-batch / Staging" --> Fabric

    %% Styling
    classDef presentation fill:#000,stroke:#333,stroke-width:2px,color:#fff
    classDef identity fill:#00A1E0,stroke:#333,stroke-width:2px,color:#fff
    classDef content fill:#1798c1,stroke:#333,stroke-width:2px,color:#fff
    classDef commerce fill:#635BFF,stroke:#333,stroke-width:2px,color:#fff
    classDef search fill:#5468FF,stroke:#333,stroke-width:2px,color:#fff
    classDef integration fill:#F58220,stroke:#333,stroke-width:2px,color:#fff
    classDef analytics fill:#107C41,stroke:#333,stroke-width:2px,color:#fff
    
    class NextJS,Edge presentation
    class Salesforce,CIAM identity
    class Contentful,PIMcore content
    class CommerceLayer,Stripe,Swoogo,Brightspace,SageIntacct commerce
    class Algolia search
    class Workato integration
    class Fabric,PowerBI analytics
```

### Key Systems of Record & Components:
- **Presentation**: Decoupled React-based Next.js frontend running on Edge Middleware.
- **Identity & Sessions (CIAM)**: **Okta / Auth0** serves as the central CIAM platform, handling secure user authentication, credential lifecycles, and issuing signed JWT tokens verified at the edge.
- **Person / Contact Master (CRM)**: **Salesforce (Nonprofit Cloud)** remains the core constituent CRM and master source of truth for member records, committee roles, and interaction history.
- **Product Catalog & Entitlements (PIM/DAM)**: **PIMcore** manages structured product objects (books, memberships, digital assets) and entitlement rules.
- **Editorial Copy & CMS**: **Contentful** manages marketing pages, clinical guidelines, and editorial content.
- **Carts, Orders & Subscriptions (OMS)**: **Commerce Layer** handles active cart states, order calculations, and subscription tier lifecycles.
- **Payment Processing**: **Stripe** handles card tokenisation, hosted checkout sessions, and payment gateways (reducing PCI DSS compliance scope to SAQ A).
- **Events & Conferences**: **Swoogo** handles event registration rosters, delegate check-ins, and conference schedules.
- **Learning & CPD (LMS)**: **Brightspace (D2L)** manages e-learning courses, assessment scores, and Continuing Professional Development (CPD) credit hours.
- **Financial Ledger & Invoices (ERP)**: **Sage Intacct** serves as the cloud financial system of record, maintaining the multi-dimensional general ledger, fund accounting, statutory VAT invoices, and audit controls.
- **Search Operational Cache**: **Algolia** provides sub-50ms instant search across products, articles, and courses (read-only cache, updated via Workato).
- **Enterprise Historical Analytics & BI**: **Microsoft Fabric (OneLake)** acts as the unified enterprise lakehouse implementing a Medallion Architecture (Bronze raw, Silver cleansed/masked, Gold datamarts) connected to **Power BI** for Member 360 and executive reporting.
- **Integration & Orchestration**: **Workato** acts as the central IPaaS orchestration hub, executing token-governed sync flows (real-time webhooks, micro-batching, direct storage staging).

---

## 2. User Journeys & Interaction Flows

These diagrams show how the various components of the MACH architecture interact during specific user scenarios.

### A. Non-Member Searches for Information
A visitor searches the site for clinical resources or news.

![Journey A: Non-Member Searches for Information](./documents/architecture/images/21-journey-a-search-information.jpg)

```mermaid
sequenceDiagram
    participant U as User
    participant N as Next.js (Frontend)
    participant A as Algolia (Search)
    participant C as Contentful (CMS)

    U->>N: Enters search query
    N->>A: Queries search index
    A-->>N: Returns results (Metadata + Snippets)
    N-->>U: Displays search results
    U->>N: Clicks on an Article
    N->>C: Fetches full article content (GraphQL)
    C-->>N: Returns Content Model
    N-->>U: Renders Page
```

### B. Non-Member Purchases Membership
A visitor signs up for a BSAVA membership to access gated benefits.

![Journey B: Non-Member Purchases Membership](./documents/architecture/images/22-journey-b-membership-purchase.jpg)

```mermaid
sequenceDiagram
    participant U as User
    participant N as Next.js
    participant CL as Commerce Layer (OMS)
    participant S as Stripe (Payments)
    participant W as Workato (Orchestrator)
    participant SF as Salesforce (CRM)

    U->>N: Selects Membership Level
    N->>CL: Adds Membership SKU to Cart
    U->>N: Enters Guest Info & Proceeds to Checkout
    N->>CL: Creates Order & Fetches Payment Intent
    CL->>S: Initializes Payment
    U->>S: Provides Payment Details (Stripe Elements)
    S-->>CL: Payment Success Webhook
    CL-->>N: Order Confirmed
    CL-->>W: order.placed Webhook
    W->>SF: Lookup / Create Contact & Order
    W->>SF: Provision Entitlements
    N-->>U: Show Success & Welcome Message
```

### C. Member Buys a Book
An authenticated member purchases a physical publication using member pricing.

![Journey C: Member Buys a Book](./documents/architecture/images/23-journey-c-member-buys-book.jpg)

```mermaid
sequenceDiagram
    participant U as User
    participant CIAM as CIAM (Okta)
    participant N as Next.js
    participant P as PIMcore (PIM)
    participant CL as Commerce Layer (OMS)

    U->>CIAM: Authenticates
    CIAM-->>N: Returns Session + JWT (with Member Claims)
    U->>N: Navigates to Book Catalog
    N->>P: Fetches Book Detail + Member Price
    N-->>U: Shows Discounted Price
    U->>N: Adds to Cart
    N->>CL: Updates Cart with MemberID context
    N->>CL: Completes Checkout
    CL-->>N: Confirmation
    N-->>U: Order Success
```

### D. Member Books an Event
An existing member registers for a CPD event or conference.

![Journey D: Member Books an Event](./documents/architecture/images/24-journey-d-member-books-event.jpg)

```mermaid
sequenceDiagram
    participant U as User
    participant N as Next.js
    participant A as Algolia
    participant SW as Swoogo (Events)
    participant W as Workato (Orchestrator)
    participant SF as Salesforce

    U->>N: Filters Events
    N->>A: Search via "events" index
    A-->>N: Returns filtered events
    U->>N: Clicks "Register"
    N->>SW: Sync Member Data & Open Registration API
    SW-->>N: Returns Registration Flow
    U->>SW: Completes Registration Logic
    SW-->>W: registration.completed Webhook
    W->>SF: Find/Create Contact & Log Attendance
    W->>SF: Assign Entitlements
    SW-->>N: Event Registration Success
    N-->>U: Show "My Events" Update
```

### E. Member Studies a Course
A member accesses their learning dashboard to continue an online course.

![Journey E: Member Studies a Course](./documents/architecture/images/25-journey-e-member-studies-course.jpg)

```mermaid
sequenceDiagram
    participant U as User
    participant N as Next.js
    participant BS as Brightspace (LMS)

    U->>N: Opens "My Learning" Portal
    N->>N: Reads membership entitlements from verified CIAM JWT Token Claims
    N->>BS: Fetches Enrolled Courses & Progress
    BS-->>N: Returns Course List + Progress %
    U->>N: Clicks "Resume Course"
    N->>BS: Requests Secure Course Launcher
    BS-->>N: Returns Signed SSO URL
    N-->>U: Redirects/Embeds Course Player
```
