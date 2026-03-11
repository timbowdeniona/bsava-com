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
    
    NextJS -- "GraphQL / REST" --> Contentful
    NextJS -- "GraphQL / REST" --> PIMcore
    NextJS -- "Verified Session" --> SSO
    NextJS -- "Check Entitlements" --> Salesforce
    NextJS -- "Instant Search" --> Algolia
    NextJS -- "Registration API" --> Swoogo
    NextJS -- "Checkout / Portal" --> Stripe
    NextJS -- "Learn / Progress" --> Brightspace

    %% Sync Flows
    Contentful -- "Webhooks" --> Algolia
    PIMcore -- "Webhooks" --> Algolia
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
    class Stripe,Swoogo,Brightspace commerce
    class Algolia search
```

### Key Components:
- **Presentation**: Decoupled React-based frontend hosted on Netlify.
- **Identity & CRM**: **Salesforce** acts as the single source of truth for members. **SSO** provides a seamless login experience across the ecosystem.
- **PIM & DAM**: **PIMcore** manages structured product data, including books, memberships, and digital assets.
- **CMS**: **Contentful** manages marketing pages, news, and editorial content.
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
    class Salesforce,SSO,Swoogo,Brightspace future
```

### Summary of Implementation:
1.  **Next.js Frontend**: Fully configured with App Router, Tailwind CSS, and global state management.
2.  **Contentful**: Integrated with a robust fetching library ([contentful.ts](file:///home/timbowden/dev/bsava-com/src/lib/contentful.ts)) for news and page content.
3.  **PIMcore**: Successfully connected via GraphQL/REST ([pimcore.ts](file:///home/timbowden/dev/bsava-com/src/lib/pimcore.ts)) to serve the product catalogue.
4.  **Algolia**: Search UI and client-side indexing hooks are in place.
5.  **Stripe**: Checkout session creation and basic bundling logic are implemented in the API routes.
