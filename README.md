# DVA Contracting

Marketing site for DVA Contracting — a commercial & residential construction company. Built with React + Vite + Tailwind CSS v4.

The hero features an interactive **3D sphere gallery**: drag to spin the ring of project photos, and click any photo to open it in a full-screen lightbox (with arrow-key / button navigation).

## Stack

- **React 18** + **TypeScript**
- **Vite 6** (dev server + build)
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **lucide-react** for icons
- Fonts: Barlow Condensed + DM Sans (Google Fonts)

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## Structure

```
src/
  main.tsx              # entry point
  app/App.tsx           # the entire single-page site (nav, hero sphere, stats,
                        # services, projects grid, about, contact, footer, lightbox)
  app/components/ui/    # shadcn/ui primitives (available, not all used)
  styles/               # Tailwind + global styles + font imports
```

The sphere physics (positions, drag inertia, perspective projection) live in the
`Sphere3D` component near the top of `src/app/App.tsx`.

---

Originally designed in Figma Make and rebuilt as a standalone Vite project.
