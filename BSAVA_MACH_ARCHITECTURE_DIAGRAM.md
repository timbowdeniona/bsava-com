# BSAVA MACH Migration Architecture

This document provides a comprehensive overview of the headless, composable architecture being adopted for the BSAVA platform. It is split into two sections: the **Abstract Target Architecture** (the full ecosystem) and the **Current Implementation Status** (what is currently hooked up in this repository).

---

## 1. Abstract Target Architecture
This diagram outlines the complete ecosystem of headless services that form the BSAVA MACH platform. It highlights the decoupled nature of the services and the central role of **SSO** and **CRM** in managing user identities and entitlements.

```mermaid
flowchart TB
    %% Nodes
    User((User / Browser))
    
    subgraph Presentation ["Presentation Layer (Headless Frontend)"]
        direction TB
        NextJS["Next.js (App Router)"]
        Edge["Netlify Edge Runtime"]
        NextJS --- Edge
    end

    subgraph Identity ["Identity & CRM (The Core)"]
        direction TB
        Salesforce["Salesforce / Fonteva"]
        SSO["SSO (SAML / OAuth 2.0)"]
        Salesforce --- SSO
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

    %% Interactions
    User -- "Browses / Searches" --> NextJS
    User -- "Single Sign-On" --> SSO
    
    NextJS -- "Cart & Order API" --> CommerceLayer
    NextJS -- "GraphQL / REST" --> Contentful
    NextJS -- "GraphQL / REST" --> PIMcore
    NextJS -- "Verified Session" --> SSO
    NextJS -- "Check Entitlements" --> Salesforce
    NextJS -- "Instant Search" --> Algolia
    NextJS -- "Registration API" --> Swoogo
    CommerceLayer -- "Triggers Payment" --> Stripe
    NextJS -- "Learn / Progress" --> Brightspace

    %% Sync Flows
    Contentful -- "Webhooks" --> Algolia
    PIMcore -- "Webhooks" --> Algolia
    PIMcore -- "Price/Stock Sync" --> CommerceLayer
    Swoogo -- "Sync Events" --> PIMcore
    Brightspace -- "Sync Courses" --> PIMcore

    %% Styling
    classDef presentation fill:#000,stroke:#333,stroke-width:2px,color:#fff
    classDef identity fill:#00A1E0,stroke:#333,stroke-width:2px,color:#fff
    classDef content fill:#1798c1,stroke:#333,stroke-width:2px,color:#fff
    classDef commerce fill:#635BFF,stroke:#333,stroke-width:2px,color:#fff
    classDef search fill:#5468FF,stroke:#333,stroke-width:2px,color:#fff
    
    class NextJS,Edge presentation
    class Salesforce,SSO identity
    class Contentful,PIMcore content
    class CommerceLayer,Stripe,Swoogo,Brightspace commerce
    class Algolia search
```

### Key Components:
- **Presentation**: Decoupled React-based frontend hosted on Netlify.
- **Identity & CRM**: **Salesforce** acts as the single source of truth for members. **SSO** provides a seamless login experience across the ecosystem.
- **PIM & DAM**: **PIMcore** manages structured product data, including books, memberships, and digital assets.
- **CMS**: **Contentful** manages marketing pages, news, and editorial content.
- **Commerce & Transactions**: **Commerce Layer** handles the shopping cart, order management (OMS), and fulfilment logic. **Stripe** handles secure payments.
- **Search**: **Algolia** provides sub-millisecond search across both content and products.

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
        Netlify["Netlify Hosting"]
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
        SSO["SSO Implementation"]
        Swoogo["Swoogo (Events API)"]
        Brightspace["Brightspace (LMS API)"]
    end

    %% Interactions
    User --> NextJS
    NextJS -- "Hooks" --> Contentful
    NextJS -- "GraphQL" --> PIMcore
    NextJS -- "Client SDK" --> Algolia
    NextJS -- "Server API" --> Stripe

    %% Future Links
    NextJS -.-> CommerceLayer
    NextJS -.-> Salesforce
    NextJS -.-> SSO
    NextJS -.-> Swoogo
    NextJS -.-> Brightspace

    %% Styling
    classDef active fill:#00A859,stroke:#333,stroke-width:2px,color:#fff
    classDef core fill:#6B3D99,stroke:#333,stroke-width:2px,color:#fff
    classDef future stroke-dasharray: 5 5, fill:#f9f9f9,stroke:#999,color:#999
    
    class NextJS,Netlify active
    class Contentful,PIMcore,Algolia,Stripe core
    class CommerceLayer,Salesforce,SSO,Swoogo,Brightspace future
```

### Summary of Implementation:
1.  **Next.js Frontend**: Fully configured with App Router, Tailwind CSS, and global state management.
2.  **Contentful**: Integrated with a robust fetching library ([contentful.ts](file:///home/timbowden/dev/bsava-com/src/lib/contentful.ts)) for news and page content.
3.  **PIMcore**: Successfully connected via GraphQL/REST ([pimcore.ts](file:///home/timbowden/dev/bsava-com/src/lib/pimcore.ts)) to serve the product catalogue.
4.  **Algolia**: Search UI and client-side indexing hooks are in place.
5.  **Stripe**: Checkout session creation and basic bundling logic are implemented in the API routes.

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
    participant SF as Salesforce (CRM)

    U->>N: Selects Membership Level
    N->>CL: Adds Membership SKU to Cart
    U->>N: Enters Guest Info & Proceeds to Checkout
    N->>CL: Creates Order & Fetches Payment Intent
    CL->>S: Initializes Payment
    U->>S: Provides Payment Details (Stripe Elements)
    S-->>CL: Payment Success Webhook
    CL-->>N: Order Confirmed
    CL->>SF: Trigger Provisioning (Create Member Record)
    N-->>U: Show Success & Welcome Message
```

### C. Member Buys a Book
An authenticated member purchases a physical publication using member pricing.
```mermaid
sequenceDiagram
    participant U as User
    participant SSO as Auth (SSO)
    participant N as Next.js
    participant P as PIMcore (PIM)
    participant CL as Commerce Layer (OMS)

    U->>SSO: Authenticates
    SSO-->>N: Returns Session + MemberID
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
    participant SF as Salesforce

    U->>N: Filters Events
    N->>A: Search via "events" index
    A-->>N: Returns filtered events
    U->>N: Clicks "Register"
    N->>SW: Sync Member Data & Open Registration API
    SW-->>N: Returns Registration Flow
    U->>SW: Completes Registration Logic
    SW->>SF: Updates Contact History (fonteva)
    SW-->>N: Event Registration Success
    N-->>U: Show "My Events" Update
```

### E. Member Studies a Course
A member accesses their learning dashboard to continue an online course.
```mermaid
sequenceDiagram
    participant U as User
    participant N as Next.js
    participant SF as Salesforce (Entitlements)
    participant BS as Brightspace (LMS)

    U->>N: Opens "My Learning" Portal
    N->>SF: Verifies Membership Status & Course Access
    SF-->>N: Access Granted
    N->>BS: Fetches Enrolled Courses & Progress
    BS-->>N: Returns Course List + Progress %
    U->>N: Clicks "Resume Course"
    N->>BS: Requests Secure Course Launcher
    BS-->>N: Returns Signed SSO URL
    N-->>U: Redirects/Embeds Course Player
```
