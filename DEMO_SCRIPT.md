# Slick Solutions Demo Script

## Scenario: Vehicle Inspection & Repair Workflow

**Goal:** Showcase the AI-powered vehicle inspection, dynamic pricing, and repair management capabilities.

---

### 1. Home Page & New Inspection (Client/Customer Flow)

**Action:** Start from the Home Page.
**Narrative:** "Welcome to Slick Solutions! This is our main portal where customers can initiate a new vehicle inspection or track existing ones, and shop owners can manage their operations."

**Action:** Click on "Media Upload" card.
**Narrative:** "Let's start a new inspection. Our system guides the customer through capturing high-quality photos of their vehicle."

**Action:** On "New Inspection" page (`/inspect/new`):
*   **Capture 4 photos:** Click the camera button multiple times.
*   **Scan VIN:** Click the "Scan VIN" button.
**Narrative:** "The customer uses their phone's camera to capture photos from various angles. Our AI provides real-time guidance for optimal photo quality. We also quickly scan the VIN for accurate vehicle identification."
*(Observe the photo count update and VIN appearing.)*

**Action:** Click "Proceed to Analysis".
**Narrative:** "Once the necessary photos and VIN are captured, the data is sent to our powerful AI for analysis."

---

### 2. Inspection Status & Assessment (Client/Customer Flow)

**Action:** On "Inspection Status" page (`/inspect/[id]`):
*   Observe the progress bar and status updates.
**Narrative:** "The system is now processing the images and running the AI damage detection. This usually takes a few moments, and the customer is kept informed of the progress."
*(Wait for the page to automatically redirect.)*

**Action:** On "Assessment Results" page (`/assessment`):
*   Click on a few damage hotspots on the vehicle silhouette.
*   Toggle the sidebar.
**Narrative:** "Here are the AI-detected damages! The customer can see an interactive map of their vehicle with hotspots indicating damage. Clicking a hotspot reveals detailed information, including type, severity, location, and an initial estimated cost. The sidebar provides a quick overview of all detected issues."

**Action:** Click "Edit Estimate".
**Narrative:** "The customer can then proceed to review and edit the estimate, or the shop can do this on their behalf."

---

### 3. Edit Estimate (Client/Customer or Admin Flow)

**Action:** On "Edit Estimate" page (`/estimate`):
*   **Add a new service:** Use the "Search services" input or "Quick Add" buttons.
*   **Change quantity/price:** Edit an existing item's quantity or unit price.
*   **Remove an item:** Click the trash icon.
**Narrative:** "This is where the estimate becomes fully customizable. We can add new services, adjust quantities, modify prices, or remove items as needed. The totals update in real-time."

**Action:** Click "Approve & Schedule".
**Narrative:** "Once the estimate is finalized, the customer can approve it and proceed to schedule their appointment."

---

### 4. Schedule Appointment & Invoice (Client/Customer Flow)

**Action:** On "Schedule Appointment" page (`/schedule`):
*   Select an AI-recommended time slot.
**Narrative:** "Our smart scheduling system suggests optimal appointment times based on shop availability and workload. AI-recommended slots are highlighted for convenience."

**Action:** Click "Confirm & Pay".
**Narrative:** "With the appointment selected, the customer is ready to confirm and proceed to payment."

**Action:** On "Invoice & Payment" page (`/invoice`):
*   Observe the invoice details.
*   Click "Pay Invoice" (optional, for demo purposes).
**Narrative:** "Finally, a professional invoice is generated, detailing all services and costs. Customers can easily pay online, and the appointment is confirmed."

---

### 5. Shop Dashboard (Admin/Shop Owner Flow)

**Action:** Navigate back to the Home Page and click "Dashboard".
**Narrative:** "Now, let's switch hats to the shop owner's perspective. The dashboard provides a comprehensive overview of daily operations."

**Action:** On "Shop Dashboard" page (`/dashboard`):
*   Browse through the tabs: "Inspections", "Schedule", "Payments", "Analytics".
**Narrative:** "From here, shop owners can track pending inspections, view upcoming jobs, monitor payment statuses, and gain insights from analytics. It's a centralized hub for managing the business."

---

### 6. Dynamic Pricing System (Admin/Shop Owner Flow)

**Action:** Navigate back to the Home Page and click "Pricing".
**Narrative:** "One of our most powerful features is the Dynamic Pricing System. This allows shop owners to configure how estimates are calculated, adapting to various factors."

**Action:** On "Dynamic Pricing System" page (`/pricing`):
*   Go to the "Pricing Dashboard" tab.
*   Adjust a setting (e.g., "Labor Rate" or "Skill Markup").
*   Observe the "Live Preview" on the right.
**Narrative:** "In the Pricing Dashboard, shop owners can fine-tune parameters like labor rates, skill markups, and even membership discounts. The 'Live Preview' instantly shows how these changes impact a sample estimate, allowing for real-time optimization."

**Action:** Click "Save Changes" (if any changes were made).
**Narrative:** "Changes can be saved to apply the new pricing rules across the system."

---

### 7. Knowledge Base, API Docs, Monitoring (Admin/Developer Flow)

**Action:** Navigate back to the Home Page and click "Knowledge".
**Narrative:** "For advanced users, we also provide a Knowledge Base, which leverages RAG to store and retrieve information relevant to vehicle repairs and past assessments."

**Action:** Navigate back to the Home Page and click "API Docs".
**Narrative:** "Developers can access comprehensive API documentation for integrating with our system."

**Action:** Navigate back to the Home Page and click "Monitoring".
**Narrative:** "And for system administrators, a monitoring dashboard provides insights into the health and performance of the AI and backend services."

---

**End of Demo.**
\`\`\`

```plaintext file=".env.example"
# Convex
NEXT_PUBLIC_CONVEX_URL=
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
# Svix
SVIX_API_KEY=
SVIX_ENV_ID=
# Slack
SLACK_WEBHOOK_URL=
# Ollama (for local AI models)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_VISION_MODEL=llava:7b
OLLAMA_EMBED_MODEL=nomic-embed-text
# Sentry
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
# Vercel
VERCEL_GIT_COMMIT_SHA=
NEXT_PUBLIC_APP_URL=
