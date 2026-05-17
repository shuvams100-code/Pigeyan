# Pigeyan — Design System & UI Guidelines

This document serves as the official reference for the Pigeyan user interface, based on the provided design concepts. 

---

## 1. Global Theme
Pigeyan uses a **modern, high-contrast Dark Mode** aesthetic. The design relies on a deep, off-black background accented by vibrant, neon, and pastel colors to draw attention to key metrics, active states, and primary actions.

## 2. Typography
- **Primary Font:** `LT Superior` (or a similar modern sans-serif fallback like `Inter` if `LT Superior` is unavailable for web).
- **Usage:** Used across all headings, body text, and UI elements.

## 3. Core Color Palette
The UI strictly adheres to this 4-color core palette:

| Role | Color Hex | Description |
|---|---|---|
| **Primary Accent** | `#F6FF80` | Neon Yellow. Used for primary buttons (e.g., "Create"), active sidebar items, primary chart data, and key highlights. |
| **Secondary Accent** | `#BFF4F4` | Pastel Cyan/Mint. Used for secondary chart data and visual balance. |
| **Tertiary Accent** | `#BFC6F4` | Pastel Purple/Lavender. Used for tertiary chart data and decorative widgets. |
| **Surface / Dark** | `#1E1E1E` | Deep Dark Gray/Off-Black. Used for the main background, sidebar, and widget cards. |

*(Note: There are also gradient accents used in specific charts, such as the KPI Statistic chart, which smoothly blend the cyan, purple, and yellow.)*

## 4. UI Components & Layout

### Backgrounds & Surfaces
- The entire application background is `#1E1E1E` (or a slightly darker/lighter variant to create depth).
- Widget cards sit on the background with subtle border radii (approx. `12px` to `16px`) and no harsh borders—relying on slight color contrast or subtle shadows to separate from the background.

### Sidebar Navigation
- **Background:** `#1E1E1E`
- **Logo:** Uses the Primary Accent (`#F6FF80`).
- **Inactive Items:** Gray text (`#888888` or similar muted text).
- **Active Item:** Highlighted with a background pill/border radius and text in the Primary Accent (`#F6FF80`).

### Top Bar
- Features a dark background seamlessly blending with the main content area.
- Includes action buttons (Notifications, Dark/Light toggle, Date Picker) with dark pill backgrounds and light icons.
- **Primary Action Button:** The "Create" button stands out with a solid `#F6FF80` background and black text.

### Dashboard Widgets
- **Text:** Primary data points and titles are crisp white; secondary labels are muted gray.
- **Data Visualization:** Charts (like the bar charts and flow charts) utilize the three accent colors (`#F6FF80`, `#BFF4F4`, `#BFC6F4`) to distinguish data categories clearly against the dark background.
- **Profile/ID Cards:** Mixed surfaces, such as a white top half for the photo and a solid `#F6FF80` bottom half for role details, creating a striking visual contrast.

---
*End of Design Reference. This supersedes the previous light-mode design system outlined in the original architecture.*
