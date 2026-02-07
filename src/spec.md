# Specification

## Summary
**Goal:** Add Google AdSense support via reusable React components and render ads globally within the app’s main content area across all pages/sections.

**Planned changes:**
- Create a reusable AdSense script loader component that injects the provided AdSense script and ensures it loads only once per browser page load.
- Create a reusable AdSlot component that renders an `<ins class="adsbygoogle">` element with configurable props (client, slot id, format, responsive) and safely triggers `adsbygoogle` rendering without crashing when used multiple times.
- Insert the AdSense components globally within the app layout’s `<main>` content flow for all sections (home/tasks/wallet/profile) and ensure the same content-area insertion applies on the referral redirect route (`currentSection` starting with `"r/"`) without interfering with redirect behavior.

**User-visible outcome:** Ads appear within the main scrollable content area on all pages/sections (including the referral redirect route), and navigating between sections does not duplicate the AdSense script or break ad rendering.
