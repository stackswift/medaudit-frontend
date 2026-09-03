# MedAudit Console

Build a production-ready, dark-mode, high-end WebGL/React UI component for "MedAudit", an autonomous medical billing auditor.

Design Language:

- Palette: Void black (#05070A), Glass borders (border-white/10), Cyan accents (#06B6D4), and Warning Red (#F43F5E).

- Style: Linear/Vercel-level aesthetic, ultra-clean typography (Geist Sans + Geist Mono), high use of backdrop-blur, subtle radial gradients, zero decorative clutter.

Requirements:

1. Header / HUD: Ambient navbar with system operational status ("Live Agent Connected", green ping indicator), user profile avatar, and active document count.

2. Ingestion Zone: A large, drag-and-drop glassmorphic card. Center an interactive SVG/CSS 3D perspective card that tilts slightly towards the mouse pointer. Display an animated scanner line sweeping top to bottom when a file is hovered over it.

3. Live Feed / Minimal Inbox: A scannable list of processed claims showing: Provider Name, Date, Discovered Savings ($), and Status Badge ('Auditing', 'Clean', 'Action Required').

4. The Action Modal (Dispute Desk):

   - Triggered when clicking an "Action Required" claim.

   - 2-column split layout:

     - Left: Mock PDF view with an illuminated red neon bounding box around a medical code: "CPT 99285 - Emergency Dept Visit - $2,450.00".

     - Right: Inspector pane detailing:

       - Detected Issue: Upcoding / Code Unbundling.

       - Recommended Code: CPT 99283 ($610.00).

       - Estimated Savings: $1,840.00 (large bold green counter).

       - Legal/Policy Citation: "CMS Interventional Coding Rules - Modifier 59 Invalid".

       - Tabs: [Agent Logic Summary] and [Generated Legal Letter Preview].

       - Action buttons: "Dismiss" (muted outline) and "Authorize Dispute & Dispatch" (solid emerald-to-cyan gradient with glow effect).

Include smooth Framer Motion transitions, spring entry animations, and responsive layout classes using Tailwind CSS and Lucide React icons.

## Development

You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
npm install
npm run dev
```

To build for production:

```sh
npm run build
```
