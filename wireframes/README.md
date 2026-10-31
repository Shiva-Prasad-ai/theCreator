# CreatorOS AI — H5 Low-Fidelity Wireframes

> **Author:** Jeevan (UI/UX Designer)  
> **Milestone:** H5 — Low-Fidelity Onboarding & Confirmed Content Bucket Wireframes  
> **Event:** CodeMeet 2026  
> **Repository:** `Shiva-Prasad-ai/theCreator`  
> **Branch:** `jeevan`  
> **Product Workflow Partner:** Bhavya (Content Bucket Owner)  
> **Safety & UX Audit Status:** Verified Pass

This directory contains the independent, browser-viewable H5 wireframe prototype for **CreatorOS AI**. It visualizes the two foundational user journeys of the platform: the **Onboarding User Flow** and the **Confirmed Content Bucket Workflow**.

---

## 🧭 1. User Flows & Screen Architecture

### Flow 1: Onboarding User Flow (6 Screens)
The onboarding flow transitions a newly signed-up creator from initial intent to an autonomous workspace environment in under 2 minutes.

| Screen ID | Screen Title | Purpose & Core Components |
| :--- | :--- | :--- |
| **`ONB-1`** | **Welcome Screen** | Core value proposition, 4-step sequence overview, time commitment expectation (~2 mins), and entry CTA. |
| **`ONB-2`** | **Creator Persona Selection** | 4 selectable archetypes (*Solo Creator*, *Creator Studio / Agency*, *Educator / Coach*, *Brand / Influencer*) tailoring workspace defaults. |
| **`ONB-3`** | **Creator Profile Setup** | Creator handle (`@handle`), display name, primary distribution channel (YouTube, TikTok, Instagram, X, LinkedIn), and avatar upload dropzone. Form validation enforced. |
| **`ONB-4`** | **Niche & Target Audience** | Industry niche dropdown, interactive sub-topic keyword chips, and audience sophistication selector (*Beginner*, *Intermediate*, *Advanced*). |
| **`ONB-5`** | **Creator Goals** | Multi-select objective cards (*Monetization Velocity*, *AI Script Drafting*, *Cross-Platform Repurposing*, *Audience Analytics*). |
| **`ONB-6`** | **Setup Confirmation** | Unified configuration summary card, dynamic field verification, and direct handoff to the Content Bucket repository. |

---

### Flow 2: Confirmed Content Bucket Workflow (6 Screens)
Updated to reflect the confirmed product architecture from Bhavya (Content Bucket Owner) and safety/UX audit requirements.

| Screen ID | Screen Title | Confirmed Workflow Implementation |
| :--- | :--- | :--- |
| **`BKT-1`** | **12-Slot Overview & Progress Meter** | Visual 12-slot grid showing slots 1–12 with status pills (`Scheduled`, `Captions Ready`, `Needs Script`, `Script Done`, `Failed`, `Posted`, `Approved`, `Empty`). Capacity meter displaying **7/12 slots filled**. Partial bucket is valid and can be scheduled at any time. Features interactive slot selection and "Reset Prototype Data". |
| **`BKT-2`** | **Add Video / Reel / Idea** | Slot format selector (*Longform Video 16:9*, *Shortform Reel 9:16*, *Idea Note / Text Post*), slot working title input, and simulated dropzone with clear prototype disclaimers. Unconfirmed file sizes and formats marked pending team confirmation. |
| **`BKT-3`** | **Mandatory Script Input** | Enforced script requirement: Unified **Video / Content Script** primary editor. **A post cannot advance to captions, review, or scheduling without a valid script.** Programmatically prevents bypass via Next, progress bar segments, direct navigation, or scheduling actions. Backward navigation to earlier screens is always permitted. (Note: Specific internal section breakdowns e.g. Hook/Core/CTA are preserved as optional helpers and pending team confirmation). |
| **`BKT-4`** | **Caption Editing & AI Correction** | Captions generated from script + creator voice profile. Full manual editing enabled. Includes **"✨ AI Correction (Apply Creator Style)"** action. Labels "Served from memory" only when the mock data explicitly indicates a memory source (e.g. Slot 2). Displays suggested hashtags and audio ideas with unverified trend disclaimers. Never labeled "trending" without verified trend telemetry. |
| **`BKT-5`** | **Human Review, Store & Approval** | Single-pane review of stored slot data (script, media, captions, status, audio). Enforces **Mandatory Human Approval Gate** via checkbox. Prototype state preserved via `localStorage`. Cannot be approved or scheduled without a script. Never auto-publishes without creator sign-off. |
| **`BKT-6`** | **Scheduling & Truthful Publishing** | Date and time pickers with provisional timezone: **IST (UTC+05:30) [Pending Team Confirmation]**. Real scheduling delegated to separate agent. Confirmed platform scope: LinkedIn (P1), Instagram Reels (requires public video URL), YouTube (Private, pending audit), TikTok (Draft only); **X is explicitly excluded**. Never displays "Live". 4 Truthful status cards: *Scheduled*, *Publishing*, *Posted (Sample)*, and *Failed (Sample)*. Controlled retry simulation demonstrates both *Sample Success* and *Sample Failure* outcomes with an in-progress state and preserved demo attempt history. |

---

## 🔒 2. Safety & UX Audit Standards

1. **Controlled Retry Simulation:**
   - Never automatically implies real publishing success.
   - Shows a simulated retry-in-progress state during dispatch verification.
   - Demonstrates **both** simulated outcomes (*Test Sample Success* and *Test Sample Failure*).
   - Labels every outcome transparently as `Sample`.
   - Preserves previous failure information in the demo attempt history log.
2. **Navigation and Validation Gates:**
   - **Mandatory Script Gate:** Cannot be bypassed through Next buttons, progress segments, direct calls, or scheduling actions.
   - **Mandatory Human Approval Gate:** Content cannot advance to scheduling or trigger dispatch without explicit creator approval in Step 5 and confirmation in Step 6.
   - **No Invented Mandatory Subsections:** A script is confirmed as required, but granular internal subsections (Hook vs. Core Value vs. CTA) are preserved as optional guidance, pending team consensus.
   - **Unrestricted Backward Editing:** Creators can return to earlier screens (BKT-1, BKT-2, BKT-3, BKT-4, BKT-5) at any time to revise content without validation blockage.
3. **Publishing Transparency & Memory Attribution:**
   - Never displays `Live` for unverified publishing.
   - Clearly distinguishes `Scheduled`, `Publishing`, `Posted`, `Failed`, and YouTube `"Private, pending audit"`.
   - Displays `"Served from memory"` **only** when the mock data explicitly specifies `captionSource: 'memory'` (e.g., Slot 2: *Next.js 15 Agent Architecture*).
4. **Explicit Technical Assumptions (Pending Team Confirmation):**
   - **Upload Formats:** Container and codec specifications (MP4, MOV, WebM) are unconfirmed.
   - **File Size Limits:** Ingestion payload thresholds (e.g., 500 MB vs. 2 GB) are unconfirmed.
   - **Video Durations:** Duration constraints per format are unconfirmed.
   - **Caption Constraints:** Character constraints per platform are unconfirmed.
   - **Multi-Platform Posting:** Broadcast dispatch vs. sequential staggered scheduling is unconfirmed.
   - **Timezone Support:** Indian Standard Time (IST, UTC+05:30) is provisional and pending team confirmation.

---

## 🖥️ 3. How to Preview Locally

No external packages, Node.js servers, or build steps are required.

### Method 1: Terminal / PowerShell
```powershell
Start-Process "c:\Users\Acer\Desktop\creatoros-team\wireframes\index.html"
```

### Method 2: Direct File Explorer
Double-click `c:\Users\Acer\Desktop\creatoros-team\wireframes\index.html` to open it in Chrome, Edge, or Firefox.

### Method 3: Interactive Controls & Keyboard Shortcuts
- Use the **Flow Switcher** at the top to toggle between Onboarding and Content Bucket.
- Use the **Progress Bar Segments** to jump directly to any step (gates enforced for forward jumps; backward jumps always allowed).
- Press **`ArrowRight`** or **`PageDown`** to advance; press **`ArrowLeft`** or **`PageUp`** to return to earlier screens.
- Toggle **"Show Assumptions & Notes"** to view engineering annotations.
- Click **"↺ Reset Prototype Data"** on Screen BKT-1 to reset prototype state to the default 7/12 filled slot demonstration at any time.
