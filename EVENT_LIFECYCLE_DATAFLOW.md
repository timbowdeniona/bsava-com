# BSAVA Event Lifecycle & Booking Data Flow

This document details the end-to-end journey of an event at BSAVA, from initial creation in Swoogo to customer registration and downstream data synchronization.

---

## 1. Event Creation & Enhancement Journey

The journey begins with the logistics of the event and ends with a rich, marketing-enhanced product on the BSAVA website.

### Data Flow Overview

```mermaid
flowchart TD
    %% Nodes
    Swoogo[("Swoogo (Logistics Source)")]
    PIMcore[("PIMcore (Product Source of Truth)")]
    ProductTeam{{"Product Team (Enhancement)"}}
    WebTeam{{"Web Team (Curation)"}}
    NextJS["Next.js Frontend"]
    Algolia["Algolia Search Index"]
    Contentful["Contentful (CMS)"]

    %% Flow
    Swoogo -- "1. Initial Event Sync (API/Webhook)" --> PIMcore
    PIMcore -- "2. Becomes MVE" --> PIMcore
    
    subgraph MVE ["Minimal Viable Event (MVE)"]
        direction TB
        MVE_Data["Title, Dates, Location, Basic Pricing"]
    end
    
    ProductTeam -- "3. Enhances Product Data" --> PIMcore
    
    subgraph RichData ["Enhanced Product Data"]
        direction TB
        Rich_Data["Main Images, Videos, SEO Copy, Contact Info"]
    end

    PIMcore -- "4a. Automated Sync" --> Algolia
    PIMcore -- "4b. GraphQL API" --> NextJS
    
    WebTeam -- "5. Picks Event for Campaign" --> Contentful
    Contentful -- "6. Links PIMcore Event ID" --> NextJS

    %% Styling
    classDef source fill:#635BFF,stroke:#333,stroke-width:2px,color:#fff
    classDef storage fill:#1798c1,stroke:#333,stroke-width:2px,color:#fff
    classDef human fill:#f9f,stroke:#333,stroke-width:2px
    classDef presentation fill:#000,stroke:#333,stroke-width:2px,color:#fff

    class Swoogo source
    class PIMcore,Algolia,Contentful storage
    class ProductTeam,WebTeam human
    class NextJS presentation
```

### Detailed Stages

1.  **Swoogo Creation**: A BSAVA employee creates a new event in Swoogo. This environment handles the "logistics" (capacity, tickets, sessions).
2.  **MVE Sync**: Once the event reaches a "Minimal Viable Event" (MVE) state (defined by having a title, start/end date, and at least one ticket type), a sync is triggered to **PIMcore**.
3.  **PIMcore Enhancement**: The Product Team uses PIMcore to transform the MVE into a premium marketing product. They add high-quality assets (hero images, promotional videos) and SEO-optimized descriptions.
4.  **Web Team Distribution**:
    *   **Automated Listing**: The event automatically appears in the "Events" directory on the website via a GraphQL query to PIMcore.
    *   **Campaign Usage**: The Web Team creates a specific campaign page (e.g., for "BSAVA Congress") in Contentful. They use the PIMcore integration to "reach in" and select the event, ensuring price and availability remain in sync.

---

## 2. Customer Booking Journey

This journey details the data interactions when a customer discovers and registers for an event.

### Registration Flow

```mermaid
sequenceDiagram
    participant U as Customer (Browser)
    participant N as Next.js Website
    participant P as PIMcore
    participant CL as Commerce Layer (OMS)
    participant SW as Swoogo
    participant S as Stripe
    participant SF as Salesforce (CRM)

    U->>N: Browses Event Listing / Campaign Page
    N->>P: Fetches Event Details (SKU, Title, Member Price)
    P-->>N: Returns Enhanced Event Data
    N-->>U: Displays Rich Event Page
    
    U->>N: Clicks "Register"
    N->>CL: Creates Order & Adds Event SKU
    N->>SW: Initializes Registration with Member Context
    
    U->>SW: Completes Registration Form
    SW-->>N: Form Details Captured
    
    N->>CL: Transitions to Checkout
    CL->>S: Initializes Payment Intent
    U->>S: Provides Payment Details
    S-->>CL: Payment Success Webhook
    
    CL->>SF: Updates Order History & Provisioning
    CL->>SW: Confirms Registration (Finalize Status)
    
    Note over SW,SF: Post-Registration Sync
    
    SW->>SF: Updates Contact History & Entitlements
    SW->>P: Sends Webhook (Update Capacity / Status)
    
    CL-->>N: Order Confirmation
    N-->>U: Show Success & "My Events" Update
```

### Data Synchronization Points

-   **Transactional Core (Commerce Layer)**: Commerce Layer acts as the central engine for the booking. While Swoogo captures the delegate details, the checkout, tax calculation, and payment orchestration (via Stripe) are handled by Commerce Layer. This ensures a consistent order history across all BSAVA products (books, memberships, and events).
-   **Entitlements**: Upon successful registration, Swoogo or Commerce Layer notifies **Salesforce**. This ensures that the customer's member record reflects their attendance, which may trigger other entitlements (e.g., access to event-specific resources in Brightspace).
-   **Availability**: If an event sells out in Swoogo, a webhook updates the `status` field in **PIMcore**, which immediately updates the website (Algolia search and detail pages) to show "Sold Out".
