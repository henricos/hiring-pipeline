# Hiring Pipeline — Design System

> "The Digital Curator aesthetic applied to the hiring pipeline."

## 1. Overview & Creative North Star
**Creative North Star: The Digital Curator**
This design system moves away from the "clutter" of traditional hiring tools to embrace a "Digital Curator" aesthetic. It treats hiring data as a high-value asset, utilizing expansive white space, intentional asymmetry, and a rigorous adherence to technical precision.

The goal is to move beyond a standard "flat" UI by using **Tonal Layering** and **Atmospheric Depth**. By rejecting traditional borders and heavy shadows, we create a layout that feels less like a software interface and more like a high-end architectural blueprint—efficient, forward-thinking, and hyper-clear.

---

## 2. Colors & Surface Philosophy
The palette is rooted in sophisticated neutrals, using a spectrum of greys to define priority, with a singular surgical strike of `tertiary` blue for focus.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define major sections. Structural boundaries must be achieved through background color shifts. Use `surface_container_low` against a `surface` background to denote a sidebar, or `surface_container_lowest` to highlight an active workspace.

### Surface Hierarchy & Nesting
Instead of a flat grid, treat the UI as stacked sheets of "Industrial Glass."
- **Base Layer:** `surface` (#f8f9fa)
- **Primary Workspaces:** `surface_container_lowest` (#ffffff) for maximum focus.
- **Supportive Panels:** `surface_container` (#eaeff1) or `surface_container_low` (#f1f4f6).
- **Overlays/Modals:** Use `surface_bright` with a **Glassmorphism effect**: 80% opacity with a `20px` backdrop-blur.

### Signature Textures
Main CTAs or primary focus states should use a subtle vertical gradient:
*From `tertiary` (#0055d7) to `tertiary_container` (#0266ff).*
This provides a "liquid" depth that feels premium and intentional compared to flat hex codes.

### Color Tokens
```css
--color-tertiary: #0055d7;
--color-tertiary-container: #0266ff;
--color-on-tertiary: #ffffff;
--color-surface: #f8f9fa;
--color-surface-container-lowest: #ffffff;
--color-surface-container-low: #f1f4f6;
--color-surface-container: #eaeff1;
--color-surface-container-high: #e2e8eb;
--color-on-surface: #2b3437;
--color-on-surface-variant: #4a5568;
--color-outline-variant: #c4cdd0;
--color-destructive: #c62828;
--color-inverse-surface: #0c0f10;
--color-inverse-on-surface: #f1f4f6;
```

---

## 3. Typography: The Inter-Grid Scale
We use **Inter** exclusively. It is a typeface designed for screens, providing the technical clarity required for hiring pipeline workflows.

| Level | Token | Size | Weight | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | 3.5rem | 600 | -0.02em | Hero stats, empty state headers. |
| **Headline** | `headline-sm` | 1.5rem | 500 | -0.01em | Page titles, job profile names. |
| **Title** | `title-md` | 1.125rem | 500 | 0 | Sub-section headers. |
| **Body** | `body-md` | 0.875rem | 400 | 0 | Primary reading/writing. |
| **Label** | `label-sm` | 0.6875rem | 600 | +0.05em | Metadata, tags (All Caps). |

**Editorial Note:** Use intentional asymmetry. Align titles to the far left while body text is centered in a narrower column to create a "Technical Journal" rhythm.

---

## 4. Elevation & Depth
In this system, elevation is a product of light and tone, not physical shadows.

*   **The Layering Principle:** Place a `surface_container_lowest` card on a `surface_container_low` background. The slight shift in lightness (from #f1f4f6 to #ffffff) creates a "soft lift" that is easier on the eyes than a drop shadow.
*   **Ambient Shadows:** If an element must float (e.g., a command palette), use an extra-diffused shadow:
    *   `box-shadow: 0 12px 40px rgba(43, 52, 55, 0.06);`
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use `outline_variant` at 15% opacity. Never use 100% opaque lines.
*   **Glassmorphism:** Navigation bars should use `surface` at 70% opacity with a `blur(12px)` to allow content to scroll underneath "through the mist."

---

## 5. Components

### Buttons
*   **Primary:** `tertiary` background, `on_tertiary` text. Sharp corners (`sm`: 0.125rem). Subtle gradient recommended.
*   **Secondary:** `primary_container` background with `on_primary_container` text.
*   **Tertiary (Ghost):** No background. Text uses `primary`. Focus state uses a `surface_variant` ghost-fill.

### Chips (Tags)
*   **Style:** `surface_container_high` background. No border.
*   **Typography:** `label-md`.
*   **Shape:** `md` (0.375rem) for a slightly softer feel than buttons to denote "organic" metadata.

### Input Fields
*   **Style:** Minimalist underline or "ghost box." Use `surface_container_low` as the field background.
*   **States:** On focus, transition the background to `surface_container_lowest` and add a `2px` bottom-bar of `tertiary`.

### Cards & Profile Panels
*   **Rule:** Forbid divider lines. Use `1.5rem` to `2rem` of vertical whitespace to separate entries.
*   **Nesting:** A "Profile Card" sits on `surface_container_lowest`. A "Requirement Link" inside that card sits on `surface_container`.

### Contextual Tooltips
*   Use `inverse_surface` (#0c0f10) with `inverse_on_surface` text for high-contrast utility. Sharp corners (`none` or `sm`).

---

## 6. Do's and Don'ts

### Do
*   **DO** use whitespace as a functional tool. If a screen feels crowded, increase padding rather than adding a divider.
*   **DO** use `tertiary` blue sparingly. It is a laser-pointer, not a paint bucket.
*   **DO** align elements to a strict 8px grid to maintain "Technical" integrity.

### Don't
*   **DON'T** use serif fonts or any "paper" textures. This is a digital tool, not a typewriter.
*   **DON'T** use pure black (#000000) for text. Use `on_surface` (#2b3437) for a sophisticated, ink-grey look.
*   **DON'T** use large border radii. Keep it to `sm` (0.125rem) or `md` (0.375rem) to maintain a crisp, professional edge.
*   **DON'T** use traditional "Drop Shadows" on cards. Use tonal shifts.
