# BSAVA MACH Migration Architecture

This document provides a comprehensive overview of the headless, composable architecture being adopted for the BSAVA platform. It is split into two sections: the **Abstract Target Architecture** (the full ecosystem) and the **Current Implementation Status** (what is currently hooked up in this repository).

---

## 1. Abstract Target Architecture
This diagram outlines the complete ecosystem of headless services that form the BSAVA MACH platform. It highlights the decoupled nature of the services and the central role of **CIAM** and **CRM** in managing user identities and entitlements.

```mermaid
flowchart TB
    %% Nodes
    User((User / Browser))
    
    subgraph Presentation ["Presentation Layer (Headless Frontend)"]
        direction TB
        NextJS["Next.js (App Router)"]
        Edge["Vercel Edge Runtime"]
        NextJS --- Edge
    end

    subgraph Identity ["Identity & CRM (The Core)"]
        direction TB
        Salesforce["Salesforce"]
        CIAM["Okta (CIAM)"]
        Salesforce -->|Syncs Member Data| CIAM
    end

    subgraph Content ["Content & Asset Management"]
        Contentful["Contentful (CMS)"]
        PIMcore["PIMcore (PIM/DAM)"]
    end

    subgraph Commerce ["Commerce & Transactions"]
        CommerceLayer["Commerce Layer (OMS)"]
        Stripe["Stripe (Payments)"]
        Swoogo["Swoogo (Events)"]
        Brightspace["Brightspace (LMS)"]
    end

    subgraph Discovery ["Search & Insight"]
        Algolia["Algolia (Search)"]
    end

    subgraph Integration ["Integration & Orchestration"]
        Workato["Workato (Orchestration Hub)"]
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

    Workato -- "Sync Content/Products/Courses" --> Algolia
    Workato -- "Sync Events/Courses" --> PIMcore
    Workato -- "Provision Orders/CPD" --> Salesforce
    Workato -- "Confirm Registration" --> Swoogo
    Workato -- "Enrol Members" --> Brightspace
    Workato -- "Price/Stock Sync" --> CommerceLayer

    %% Styling
    classDef presentation fill:#000,stroke:#333,stroke-width:2px,color:#fff
    classDef identity fill:#00A1E0,stroke:#333,stroke-width:2px,color:#fff
    classDef content fill:#1798c1,stroke:#333,stroke-width:2px,color:#fff
    classDef commerce fill:#635BFF,stroke:#333,stroke-width:2px,color:#fff
    classDef search fill:#5468FF,stroke:#333,stroke-width:2px,color:#fff
    classDef integration fill:#F58220,stroke:#333,stroke-width:2px,color:#fff
    
    class NextJS,Edge presentation
    class Salesforce,CIAM identity
    class Contentful,PIMcore content
    class CommerceLayer,Stripe,Swoogo,Brightspace commerce
    class Algolia search
    class Workato integration
```

### Key Components:
- **Presentation**: Decoupled React-based frontend hosted on Vercel.
- **Identity & CRM**: **Okta** serves as the central CIAM platform, handling secure user authentication, session management, and issuing JWT tokens at the edge. **Salesforce** remains the core CRM and single source of truth for member records and master data, syncing status to the CIAM platform.
- **Integration**: **Workato** acts as the central integration hub, managing all backend synchronization, event indexing, and back-office automated workflows.
- **PIM & DAM**: **PIMcore** manages structured product data, including books, memberships, and digital assets.
- **CMS**: **Contentful** manages marketing pages, news, and editorial content.
- **Commerce & Transactions**: **Commerce Layer** handles the shopping cart, order management (OMS), and fulfilment logic. 
- **Stripe** handles secure payments. It can also handle charitable donations.
- **Search**: **Algolia** provides sub-millisecond search across both content and products.
- **Learning Management System**: **Brightspace** serves as the Learning Management System (LMS), delivering educational content and tracking user progress.
- **Events Management**: **Swoogo** serves as the Events Management system, handling event registration and attendee management.

---

## 2. Current Implementation Status
This diagram highlights what has been implemented and connected in the current codebase. Active integrations are highlighted in color, while future/planned integrations are shown in grayscale.

```mermaid
flowchart TB
    %% Nodes
    User((User))
    
    subgraph Frontend ["Implemented Frontend"]
        direction TB
        NextJS["Next.js App"]
        Vercel["Vercel Hosting"]
    end

    subgraph Implemented ["Active Integrations"]
        direction TB
        Contentful["Contentful (Articles/Pages)"]
        PIMcore["PIMcore (Products/Assets)"]
        Algolia["Algolia (Live Search)"]
        Stripe["Stripe (Checkout Integration)"]
    end

    subgraph Future ["Future Integrations"]
        direction TB
        CommerceLayer["Commerce Layer (OMS)"]
        Salesforce["CRM (Salesforce)"]
        CIAM["CIAM (Okta)"]
        Swoogo["Swoogo (Events API)"]
        Brightspace["Brightspace (LMS API)"]
        Workato["Workato (Orchestration)"]
    end

    %% Interactions
    User --> NextJS
    NextJS -- "Hooks" --> Contentful
    NextJS -- "GraphQL" --> PIMcore
    NextJS -- "Client SDK" --> Algolia
    NextJS -- "Server API" --> Stripe

    %% Future Links
    NextJS -.-> CommerceLayer
    NextJS -.-> CIAM
    NextJS -.-> Swoogo
    NextJS -.-> Brightspace
    Workato -.-> Salesforce
    Workato -.-> Swoogo
    Workato -.-> Brightspace
    Workato -.-> CommerceLayer

    %% Styling
    classDef active fill:#00A859,stroke:#333,stroke-width:2px,color:#fff
    classDef core fill:#6B3D99,stroke:#333,stroke-width:2px,color:#fff
    classDef future stroke-dasharray: 5 5, fill:#f9f9f9,stroke:#999,color:#999
    
    class NextJS,Vercel active
    class Contentful,PIMcore,Algolia,Stripe core
    class CommerceLayer,Salesforce,CIAM,Swoogo,Brightspace,Workato future
```

### Summary of Implementation:
1.  **Next.js Frontend**: Fully configured with App Router, Tailwind CSS, and global state management.
2.  **Contentful**: Integrated with a robust fetching library ([contentful.ts](file:///home/timbowden/dev/bsava-com/src/lib/contentful.ts)) for news and page content.
3.  **PIMcore**: Successfully connected via GraphQL/REST ([pimcore.ts](file:///home/timbowden/dev/bsava-com/src/lib/pimcore.ts)) to serve the product catalogue.
4.  **Algolia**: Search UI and client-side indexing hooks are in place.
5.  **Stripe**: Checkout session creation and basic bundling logic are implemented in the API routes.
6.  **Workato**: Selected as the central integration engine; recipes are designed and prioritized (Swoogo, Salesforce, Brightspace integrations) to avoid custom integrations in Next.js.

---

## 3. User Journeys & Interaction Flows

These diagrams show how the various components of the MACH architecture interact during specific user scenarios.

### A. Non-Member Searches for Information
A visitor searches the site for clinical resources or news.
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
