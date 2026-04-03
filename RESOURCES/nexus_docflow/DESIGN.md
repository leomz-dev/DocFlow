# Design System Strategy: The Editorial Architect

## 1. Overview & Creative North Star
The creative North Star for this design system is **"The Editorial Architect."** 

In the world of automated document generation, the interface must not merely be a "tool"—it must be an authoritative environment that mirrors the precision of the legal and professional documents it produces. We are moving away from the "generic SaaS" aesthetic by utilizing intentional white space, high-contrast editorial typography, and a "No-Line" structural philosophy. 

This system breaks the traditional rigid grid through **tonal depth and asymmetrical breathing room**. By treating the UI as a series of premium, stacked surfaces rather than flat containers, we evoke the feeling of high-end stationery and modern architectural blueprints. It is built for clarity, designed for trust, and polished for executive-level efficiency.

---

## 2. Colors & Surface Philosophy

### The Tonal Palette
Our color system leverages a sophisticated hierarchy of blues and greys to guide the eye without visual noise.

*   **Primary Core:** `primary` (#00288e) and `primary_container` (#1E40AF). Use the container variant for large interactive surfaces and the core primary for high-impact actions.
*   **Semantic Accents:** `tertiary_fixed_dim` (#4edea3) for success states and `error` (#ba1a1a) for critical alerts. These are used sparingly to maintain the professional "Editorial" composure.

### The "No-Line" Rule
To achieve a premium, Linear-esque finish, **1px solid borders are prohibited for sectioning.** Structural boundaries must be defined through:
1.  **Background Color Shifts:** Use `surface_container_low` for the main canvas and `surface_container_lowest` for active cards.
2.  **Tonal Transitions:** Define the sidebar using `surface_container_highest` against a `surface` main area.

### Surface Hierarchy & Nesting
Treat the interface as physical layers.
*   **Level 0 (Base):** `surface` (#f7f9fb) – The desk.
*   **Level 1 (Sections):** `surface_container_low` (#f2f4f6) – The layout areas.
*   **Level 2 (Elements):** `surface_container_lowest` (#ffffff) – The "paper" cards containing the data.

### Signature Textures & Glassmorphism
*   **The Glass Rule:** Floating elements (modals, dropdowns, or tooltips) should utilize a semi-transparent `surface_container_lowest` with a `backdrop-blur` of 12px. This creates an "OS-level" sophistication.
*   **The Subtle Gradient:** For primary CTAs, apply a linear gradient from `primary_container` (#1E40AF) to `primary` (#00288e) at a 135-degree angle. This adds a "soul" to the component that flat color lacks.

---

## 3. Typography

The typography scale is built on **Inter**, focusing on rhythmic hierarchy to convey authority.

| Level | Token | Weight | Letter Spacing | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | 700 (Bold) | -0.02em | Hero statements/Metrics |
| **Headline** | `headline-md` | 600 (SemiBold) | -0.01em | Major section headers |
| **Title** | `title-md` | 500 (Medium) | 0 | Card titles/Sub-sections |
| **Body** | `body-md` | 400 (Regular) | +0.01em | General document content |
| **Label** | `label-md` | 600 (SemiBold) | +0.05em | Buttons/Small Caps Overlines |

**Editorial Note:** Use `label-sm` in all-caps for metadata categories to create a sophisticated, "organized" feel.

---

## 4. Elevation & Depth

### Tonal Layering
Avoid shadows for static elements. Instead, achieve depth by stacking. A `surface_container_lowest` card placed on a `surface_container_low` background creates a natural, soft lift that feels integrated, not "pasted."

### Ambient Shadows
When an element must float (e.g., a "Create Document" button or a Modal), use the **Ambient Shadow**:
*   **Shadow:** `0 12px 40px -10px rgba(25, 28, 30, 0.08)`
*   The shadow must use a tint of `on_surface` rather than pure black to mimic natural lighting.

### The "Ghost Border"
If accessibility requires a border, use the **Ghost Border**: `outline_variant` (#c4c5d5) at 15% opacity. It provides a "whisper" of a boundary without breaking the minimalist flow.

---

## 5. Components

### Buttons
*   **Primary:** `primary_container` background, `on_primary` text. Border radius: `md` (0.75rem). Use the subtle gradient.
*   **Secondary:** `surface_container_high` background, `on_surface` text. No border.
*   **Tertiary/Ghost:** Transparent background, `on_surface_variant` text. Highlights to `surface_container` on hover.

### Input Fields
*   **Default:** Background `surface_container_lowest`. Ghost border (15% opacity). 
*   **Focus State:** Border becomes `primary` at 100% opacity with a 3px "glow" (spread) using `primary_fixed` at 30% opacity.
*   **Logic:** Inputs should feel like "wells" carved into the page.

### Cards & Lists
*   **Rule:** **Forbid horizontal dividers.** 
*   To separate list items, use vertical padding from the spacing scale and alternating backgrounds or "hover-lift" effects where the item shifts to `surface_container_low`.
*   **Radius:** Cards must strictly use `xl` (1.5rem) for a modern, friendly but professional feel.

### Sidebar Navigation
*   **Background:** `surface_container_highest`.
*   **Active State:** Use a "pill" shape background of `primary_container` with `on_primary` icons. 
*   **Icons:** Use 2px linear weight icons only. Solid icons are too heavy for this "Editorial" look.

---

## 6. Do's and Don'ts

### Do
*   **DO** use whitespace as a luxury. If a section feels cramped, double the padding.
*   **DO** use "surface nesting" to group related document metadata.
*   **DO** use asymmetrical layouts (e.g., a wide main content area with a narrow, high-density right-side info panel).

### Don'ts
*   **DON'T** use 100% black (#000000) for text. Use `on_surface` (#191c1e) to maintain a soft, premium readability.
*   **DON'T** use standard drop shadows. If it doesn't look like ambient light, it's too heavy.
*   **DON'T** use high-contrast borders to separate the sidebar from the main content. Use the background color shift.
*   **DON'T** use "Alert Red" for everything. Reserve it for destructive actions; use `secondary` tones for neutral warnings.