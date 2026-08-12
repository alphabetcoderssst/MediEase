---
name: Clinical Clarity
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45474c'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#545f73'
  primary: '#091426'
  on-primary: '#ffffff'
  primary-container: '#1e293b'
  on-primary-container: '#8590a6'
  inverse-primary: '#bcc7de'
  secondary: '#006b5f'
  on-secondary: '#ffffff'
  secondary-container: '#62fae3'
  on-secondary-container: '#007165'
  tertiary: '#000453'
  on-tertiary: '#ffffff'
  tertiary-container: '#061286'
  on-tertiary-container: '#7b86f2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e3fb'
  primary-fixed-dim: '#bcc7de'
  on-primary-fixed: '#111c2d'
  on-primary-fixed-variant: '#3c475a'
  secondary-fixed: '#62fae3'
  secondary-fixed-dim: '#3cddc7'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005047'
  tertiary-fixed: '#e0e0ff'
  tertiary-fixed-dim: '#bdc2ff'
  on-tertiary-fixed: '#000767'
  on-tertiary-fixed-variant: '#2f3aa3'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 64px
---

## Brand & Style
The design system is engineered for a healthcare environment where trust, efficiency, and accessibility are paramount. The aesthetic follows a **Modern Corporate** direction with a focus on clinical precision and empathetic utility. It prioritizes legibility and a calm emotional response through a "white-space first" philosophy. 

The visual narrative is defined by:
- **Trustworthiness:** Using a grounded navy base to convey institutional stability.
- **Modernity:** Utilizing soft teal and muted blue to move away from "hospital green" toward a contemporary tech-enabled healthcare feel.
- **Accessibility:** Ensuring every interaction is clear, with large touch targets and high-contrast ratios that meet WCAG AA standards.

## Colors
The palette is rooted in a "Deep Slate" primary for text and structural elements, ensuring maximum readability. 
- **Primary actions** use the Soft Teal (#2DD4BF) to provide a refreshing, health-focused call to action.
- **Supporting elements** utilize the Muted Blue (#60A5FA) for informational icons or secondary buttons.
- **Status & Highlights** sparingly use the Subtle Purple (#818CF8) for non-critical notifications or unique categories.
- **Surface colors** rely on #F8FAFC (off-white) to reduce eye strain while maintaining a clean, sterile feel.

## Typography
Inter is used across the entire design system for its exceptional legibility and neutral, professional tone. 
- **Headlines:** Use a bold weight and slightly tighter letter spacing to create a strong visual hierarchy.
- **Body Text:** Never drops below 16px to ensure accessibility for users in high-stress or mobile environments.
- **Scale:** On mobile devices, the `headline-lg` should reflow to the `headline-lg-mobile` token to prevent excessive wrapping.

## Layout & Spacing
The layout follows a **Fluid Grid** model. 
- **Mobile:** 4-column layout with 20px side margins.
- **Tablet/Desktop:** 12-column layout with a maximum container width of 1200px to keep line lengths readable.
- **Rhythm:** Use an 8px spacing scale (derived from the 4px unit) for consistent vertical rhythm. Card internal padding should default to `lg` (24px) to emphasize the "generous whitespace" brand pillar.

## Elevation & Depth
Depth is conveyed through **Ambient Shadows** and tonal layering. 
- **Surface:** The main background is #F8FAFC. 
- **Cards:** Pure white (#FFFFFF) containers sit atop the background with a soft, diffused shadow: `0px 4px 12px rgba(30, 41, 59, 0.05)`.
- **Interactive States:** On hover or active tap, shadows should expand slightly and soften further to simulate a physical lift (`0px 8px 24px rgba(30, 41, 59, 0.08)`).
- **Overlays:** Modals and bottom sheets use a subtle backdrop dimming (20% opacity of Primary Color) to maintain focus.

## Shapes
This design system utilizes a **Rounded** shape language to appear approachable and modern. 
- **Standard Radius:** 0.5rem (8px) for small components like buttons and inputs.
- **Card Radius:** Uses `rounded-xl` (1.5rem / 24px) for main content containers and `rounded-lg` (1rem / 16px) for smaller informational modules.
- **QR Codes:** Should be framed within a `rounded-lg` container to soften the technical nature of the scan target.

## Components
- **Buttons:** Primary buttons use Soft Teal with white text. High-emphasis actions should be 56px in height for mobile tap targets. Secondary buttons use a Muted Blue outline or a light tinted background.
- **Cards:** White background, 24px corner radius, and 24px internal padding. Use for medical records, appointment summaries, or QR code displays.
- **Input Fields:** 16px font size minimum. Use #F8FAFC as the fill color with a subtle 1px border in a muted slate. Focus states should use a 2px Teal border.
- **Chips:** Used for medical tags or status (e.g., "Confirmed," "Pending"). Rounded-pill shape with low-saturation backgrounds and high-saturation text.
- **Lists:** Clean rows with 16px vertical padding and subtle dividers (`1px solid #E2E8F0`).
- **QR Target:** A specialized component featuring a high-contrast Teal border-frame to guide the user's camera scan, emphasizing the "Ease" in the product's identity.