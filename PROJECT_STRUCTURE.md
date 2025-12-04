# Aurora - Project Structure

## Folder Organization

```
aurora/
├── app/                    # Next.js 16 App Router
│   ├── api/               # API routes (future)
│   ├── services/          # Services page
│   │   └── page.tsx
│   ├── reviews/           # Reviews page
│   │   └── page.tsx
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout (includes Navbar)
│   └── page.tsx           # Home page
│
├── components/            # Reusable React components
│   ├── Navbar.tsx         # Persistent navigation bar
│   └── HeroSection.tsx    # Animated hero section
│
├── lib/                   # Utilities and management logic
│   └── (future utils)
│
└── public/               # Static assets

```

## Tech Stack

- **Framework**: Next.js 16.0.1 (App Router)
- **React**: 19.2.0
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **TypeScript**: v5

## Design System

### Colors
- **Primary Green**: `#39FF14` (neon green)
- **Background**: `zinc-950` (dark)
- **Text**: White on dark backgrounds

### Components
- **Navbar**: Persistent fixed-top navigation with logo, links, and CTA button (appears on all pages via layout.tsx)
- **HeroSection**: Animated hero section with floating 3D spheres and content

### Architecture
- **Root Layout**: Navbar is placed in `layout.tsx` to appear consistently across all pages
- **SEO Optimized**: Professional metadata with Open Graph tags, keywords, and descriptions

## Development

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
```
