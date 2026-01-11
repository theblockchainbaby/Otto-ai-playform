# Otto AI Agency Landing Page

This folder contains the design and code for the new General AI Agency landing page.

## Files

- `page.tsx`: The main landing page component built with React, Next.js (App Router), and Tailwind CSS.

## How to Use

1.  **In a Next.js Project:**
    - Copy `page.tsx` to your `app/page.tsx` (or `app/otto/page.tsx` if you want it on a subpath).
    - Ensure you have Tailwind CSS configured in your `globals.css` and `tailwind.config.js`.
    - Ensure you have `lucide-react` installed if you want to replace the inline SVG icons with a library later (though the current code uses inline SVGs for zero dependencies).

2.  **Dependencies:**
    - React
    - Tailwind CSS

## Features Included

- **Responsive Navbar**: Sticky with mobile menu.
- **Hero Section**: High-converting copy with "Book a Demo" CTA.
- **Interactive Visual**: Mockup of an AI conversation.
- **Social Proof**: Industry logos strip.
- **Use Cases**: Grid showing what Otto handles.
- **Pain Points**: "Before Otto" comparison.
- **Industries**: Grid of supported verticals (Medical, Real Estate, etc.).
- **Pricing**: 3-tier pricing table.
- **Testimonials**: Customer reviews.
- **FAQ**: Accordion-style questions (simplified as list for now).
- **Footer**: Standard footer with links.
