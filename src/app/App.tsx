import { useRef, useEffect, useState, useCallback } from "react";
import { X, Phone, Mail, MapPin, Menu, ArrowRight, ChevronDown } from "lucide-react";

// Public-folder assets, resolved against the Vite base so the build works
// both at the GitHub Pages subpath and at a custom domain root.
const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

// ─── Refined Navy theme ───────────────────────────────────────────────────────
const SERIF = "'Fraunces', Georgia, serif"; // display face
const SANS = "'DM Sans', sans-serif";
const STONE = "#F0F4FF";       // alternate section background (blue tint)
const INK = "#0C1A3F";         // headings on light sections
const INK2 = "#46536B";        // body text
const INK3 = "#8792A6";        // captions
const BLUE = "#2563EB";        // accent / CTA
const BLUE_DARK = "#1D4ED8";   // accent hover
const SKY = "#60A5FA";         // accent on dark
const SKY_SOFT = "#93C5FD";    // soft accent on dark
const DARK = "#0C1A3F";        // contact section
const DARKER = "#080F28";      // footer
const LINE = "rgba(37,99,235,0.14)";

// ─── Sphere physics constants ─────────────────────────────────────────────────
const SPHERE_R = 210;
const PERSPECTIVE = 650;
const BASE_SPEED = 0.007;
const FRICTION = 0.962;

// Each image's fixed lat/lon position on the sphere + base size
const SPHERE_CONFIG = [
  { az: 0,   el:  0,   size: 145 }, // front equator  — hero anchor
  { az: 48,  el:  24,  size: 102 }, // upper front-right
  { az: 95,  el:  -7,  size: 118 }, // right equator
  { az: 142, el:  22,  size: 88  }, // back-right upper
  { az: 185, el:  -4,  size: 104 }, // back equator
  { az: 228, el: -20,  size: 114 }, // back-left lower
  { az: 272, el:  10,  size: 110 }, // left equator
  { az: 318, el: -14,  size: 128 }, // front-left lower
  { az: 22,  el:  46,  size: 92  }, // top front-right
  { az: 200, el:  40,  size: 84  }, // top back-left
  { az: 305, el:  44,  size: 88  }, // top left gap
];

interface Project {
  id: number;
  thumb: string;
  full: string;
  label: string;
  category: string;
}

// All photos below are real DVA Contracting projects supplied by the owner.
const PROJECTS: Project[] = [
  { id: 1,  thumb: asset("projects/kitchen-coffered-sq.jpg"),    full: asset("projects/kitchen-coffered.jpg"),    label: "Full Kitchen Remodel",     category: "Kitchens" },
  { id: 2,  thumb: asset("projects/framing-aerial-sq.jpg"),      full: asset("projects/framing-aerial.jpg"),      label: "Roof Framing",             category: "New Construction" },
  { id: 3,  thumb: asset("projects/home-bar-sq.jpg"),            full: asset("projects/home-bar.jpg"),            label: "Custom Home Bar",          category: "Basements" },
  { id: 4,  thumb: asset("projects/bathroom-subway-sq.jpg"),     full: asset("projects/bathroom-subway.jpg"),     label: "Bathroom Remodel",         category: "Bathrooms" },
  { id: 5,  thumb: asset("projects/deck-railing-sq.jpg"),        full: asset("projects/deck-railing.jpg"),        label: "Deck & Aluminum Railings", category: "Decks & Outdoor" },
  { id: 6,  thumb: asset("projects/kitchen-marble-sq.jpg"),      full: asset("projects/kitchen-marble.jpg"),      label: "Marble Island Kitchen",    category: "Kitchens" },
  { id: 7,  thumb: asset("projects/basement-rec-sq.jpg"),        full: asset("projects/basement-rec.jpg"),        label: "Basement Rec Room",        category: "Basements" },
  { id: 8,  thumb: asset("projects/newbuild-sunset-sq.jpg"),     full: asset("projects/newbuild-sunset.jpg"),     label: "New Home Build",           category: "New Construction" },
  { id: 9,  thumb: asset("projects/kitchen-pantry-sq.jpg"),      full: asset("projects/kitchen-pantry.jpg"),      label: "Kitchen & Coffee Bar",     category: "Kitchens" },
  { id: 10, thumb: asset("projects/addition-tyvek-sq.jpg"),      full: asset("projects/addition-tyvek.jpg"),      label: "Second-Story Addition",    category: "Additions" },
  { id: 11, thumb: asset("projects/basement-gray-sq.jpg"),       full: asset("projects/basement-gray.jpg"),       label: "Finished Basement",        category: "Basements" },
  { id: 12, thumb: asset("projects/kitchen-dark-island-sq.jpg"), full: asset("projects/kitchen-dark-island.jpg"), label: "Kitchen Remodel",          category: "Kitchens" },
  { id: 13, thumb: asset("projects/living-accent-sq.jpg"),       full: asset("projects/living-accent.jpg"),       label: "Living Room Remodel",      category: "Interiors" },
  { id: 14, thumb: asset("projects/pool-deck-sq.jpg"),           full: asset("projects/pool-deck.jpg"),           label: "Pool Deck",                category: "Decks & Outdoor" },
  { id: 15, thumb: asset("projects/kitchen-marble-wide-sq.jpg"), full: asset("projects/kitchen-marble-wide.jpg"), label: "Kitchen Remodel",          category: "Kitchens" },
];

const SERVICES = [
  {
    num: "01",
    title: "Kitchens & Bathrooms",
    tagline: "The rooms that sell homes",
    desc: "Full gut renovations: cabinetry, tile, counters, plumbing, and lighting. Designed with you, built by crews Dave trusts, and finished to the punch list.",
    img: asset("projects/kitchen-coffered.jpg"),
  },
  {
    num: "02",
    title: "Basements & Interiors",
    tagline: "Found space, done right",
    desc: "Finished basements, home bars, rec rooms, and whole-room remodels that make the square footage you already own actually work for you.",
    img: asset("projects/home-bar.jpg"),
  },
  {
    num: "03",
    title: "Additions & New Builds",
    tagline: "Foundation to framing to finish",
    desc: "Second-story additions, ground-up construction, decks, and structural work. Residential and commercial, managed by the owner the whole way.",
    img: asset("projects/newbuild-sunset.jpg"),
  },
];

/* Honest numbers only. [VERIFY with Dave: free estimates offered? licensed/insured wording] */
const STATS = [
  { value: "15+",   label: "Years in Business" },
  { value: "1",     label: "Owner on Every Job" },
  { value: "2 hrs", label: "Service Radius · Bartlett, IL" },
  { value: "Free",  label: "Estimates & Consultations" },
];

const PHONE_DISPLAY = "630-886-8628";
const PHONE_TEL = "tel:+16308868628";
const EMAIL = "info@dvacontractinginc.com";

// ─── Scroll reveal ────────────────────────────────────────────────────────────

function useInView(threshold = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(26px)",
        transition: `opacity .8s cubic-bezier(.22,.61,.27,1) ${delay}s, transform .8s cubic-bezier(.22,.61,.27,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ─── 3D Sphere Carousel ───────────────────────────────────────────────────────

function Sphere3D({ onSelect }: { onSelect: (p: Project) => void }) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const sphereProjects = PROJECTS.slice(0, SPHERE_CONFIG.length);
  const imgRefs       = useRef<(HTMLDivElement | null)[]>(new Array(SPHERE_CONFIG.length).fill(null));
  const angleRef      = useRef(0);
  const velRef        = useRef(BASE_SPEED);
  const dragging      = useRef(false);
  const prevX         = useRef(0);
  const totalDragRef  = useRef(0);
  const rafId         = useRef(0);
  const visibleRef    = useRef(true);
  const [grabbing, setGrabbing] = useState(false);

  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const idleSpeed = reduce ? 0 : BASE_SPEED;

  // Pre-compute fixed sphere positions in radians
  const positions = SPHERE_CONFIG.map((c) => ({
    az: (c.az * Math.PI) / 180,
    el: (c.el * Math.PI) / 180,
    size: c.size,
  }));

  useEffect(() => {
    let last = performance.now();

    const tick = (now: number) => {
      // battery: skip all work while the gallery is offscreen
      if (!visibleRef.current) {
        last = now;
        rafId.current = requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min((now - last) / 16.67, 3);
      last = now;

      if (!dragging.current) {
        velRef.current *= Math.pow(FRICTION, dt);
        if (Math.abs(velRef.current) < idleSpeed) velRef.current = idleSpeed;
        angleRef.current += velRef.current * dt;
      }

      positions.forEach((pos, i) => {
        const el = imgRefs.current[i];
        if (!el) return;

        const effectiveAz = pos.az + angleRef.current;

        // Spherical → cartesian (y-up, z-toward viewer)
        const cosEl = Math.cos(pos.el);
        const x3d   =  SPHERE_R * cosEl * Math.sin(effectiveAz);
        const y3d   = -SPHERE_R * Math.sin(pos.el);
        const z3d   =  SPHERE_R * cosEl * Math.cos(effectiveAz);

        // Perspective projection
        const denom  = PERSPECTIVE - z3d;
        const scale  = PERSPECTIVE / denom;
        const x2d    = x3d * scale;
        const y2d    = y3d * scale;

        const sz     = pos.size * scale;
        const opacity= Math.min(1, Math.max(0.14, (z3d + SPHERE_R) / (2 * SPHERE_R)));
        const zIdx   = Math.round(scale * 1000);

        el.style.width         = `${sz}px`;
        el.style.height        = `${sz}px`;
        el.style.transform     = `translate(calc(-50% + ${x2d}px), calc(-50% + ${y2d}px))`;
        el.style.opacity       = opacity.toFixed(3);
        el.style.zIndex        = String(zIdx);
        el.style.pointerEvents = z3d < -30 ? "none" : "auto";
      });

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  // pause the loop entirely while scrolled past
  useEffect(() => {
    const wrap = containerRef.current;
    if (!wrap || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((en) => { visibleRef.current = en[0].isIntersecting; });
    io.observe(wrap);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - prevX.current;
      velRef.current = velRef.current * 0.45 + (dx * 0.0048) * 0.55;
      angleRef.current += dx * 0.0048;
      totalDragRef.current += Math.abs(dx);
      prevX.current = e.clientX;
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      setGrabbing(false);
      if (Math.abs(velRef.current) < 0.003) velRef.current = idleSpeed;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  useEffect(() => {
    const wrap = containerRef.current;
    if (!wrap) return;
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (e.type === "touchstart") {
        dragging.current = true;
        totalDragRef.current = 0;
        prevX.current = t?.clientX ?? 0;
        velRef.current = 0;
      } else if (e.type === "touchmove" && dragging.current && t) {
        const dx = t.clientX - prevX.current;
        velRef.current = velRef.current * 0.45 + (dx * 0.0048) * 0.55;
        angleRef.current += dx * 0.0048;
        totalDragRef.current += Math.abs(dx);
        prevX.current = t.clientX;
        e.preventDefault();
      } else if (e.type === "touchend") {
        dragging.current = false;
        if (Math.abs(velRef.current) < 0.003) velRef.current = idleSpeed;
      }
    };
    wrap.addEventListener("touchstart", onTouch, { passive: false });
    wrap.addEventListener("touchmove",  onTouch, { passive: false });
    wrap.addEventListener("touchend",   onTouch);
    return () => {
      wrap.removeEventListener("touchstart", onTouch);
      wrap.removeEventListener("touchmove",  onTouch);
      wrap.removeEventListener("touchend",   onTouch);
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    totalDragRef.current = 0;
    prevX.current = e.clientX;
    velRef.current = 0;
    setGrabbing(true);
    e.preventDefault();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative select-none"
      style={{
        width: 520,
        height: 480,
        cursor: grabbing ? "grabbing" : "grab",
        overflow: "visible",
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Faint sphere outline for context */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: SPHERE_R * 2,
          height: SPHERE_R * 2,
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
          border: "1px solid rgba(37,99,235,0.16)",
        }}
      />

      {/* Images */}
      {sphereProjects.map((proj, i) => (
        <div
          key={proj.id}
          ref={(el) => { imgRefs.current[i] = el; }}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: SPHERE_CONFIG[i].size,
            height: SPHERE_CONFIG[i].size,
          }}
          onClick={() => { if (totalDragRef.current < 9) onSelect(proj); }}
        >
          <div
            className="group relative w-full h-full rounded-xl overflow-hidden"
            style={{
              border: "2px solid #FFFFFF",
              boxShadow: "0 18px 44px rgba(12,26,63,0.22), 0 3px 10px rgba(12,26,63,0.12)",
              cursor: grabbing ? "grabbing" : "pointer",
            }}
          >
            <img
              src={proj.thumb}
              alt={proj.label}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              draggable={false}
            />
            {/* Blue hover wash */}
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"
              style={{
                background: "rgba(37,99,235,0.2)",
                border: "2px solid rgba(147,197,253,0.8)",
              }}
            />
            {/* Label on hover */}
            <div className="absolute inset-x-0 bottom-0 p-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "linear-gradient(to top, rgba(12,26,63,0.9), transparent)" }}>
              <p
                className="text-white leading-tight"
                style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: "0.02em" }}
              >
                {proj.label}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Drag hint */}
      <p
        className="absolute pointer-events-none text-center whitespace-nowrap"
        style={{
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: SANS,
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: INK3,
        }}
      >
        drag to spin · click any photo
      </p>
    </div>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
  project,
  onClose,
  onPrev,
  onNext,
}: {
  project: Project | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [project, onClose, onPrev, onNext]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(8,15,40,0.96)", backdropFilter: "blur(14px)" }}
      onClick={onClose}
    >
      <button
        aria-label="Close"
        className="absolute top-6 right-6 flex items-center justify-center w-10 h-10 rounded-full transition-all hover:bg-white/10"
        style={{ border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.65)" }}
        onClick={onClose}
      >
        <X size={18} />
      </button>

      <button
        aria-label="Previous project"
        className="absolute left-4 md:left-8 flex items-center justify-center w-10 h-10 rounded-full transition-all hover:bg-blue-500/20"
        style={{ border: "1px solid rgba(96,165,250,0.3)", color: "rgba(147,197,253,0.75)" }}
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
      >
        <ArrowRight size={18} className="rotate-180" />
      </button>

      <button
        aria-label="Next project"
        className="absolute right-4 md:right-8 flex items-center justify-center w-10 h-10 rounded-full transition-all hover:bg-blue-500/20"
        style={{ border: "1px solid rgba(96,165,250,0.3)", color: "rgba(147,197,253,0.75)" }}
        onClick={(e) => { e.stopPropagation(); onNext(); }}
      >
        <ArrowRight size={18} />
      </button>

      <div
        className="relative mx-16 md:mx-24 w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-sm" style={{ background: "#0A1330" }}>
          <img
            src={project.full}
            alt={project.label}
            className="w-full object-contain"
            style={{ maxHeight: "72vh", background: "#0A1330" }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 px-6 py-5 flex items-end justify-between"
            style={{ background: "linear-gradient(to top, rgba(8,15,40,0.92) 0%, transparent 100%)" }}
          >
            <div>
              <p className="mb-1" style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: SKY }}>
                {project.category}
              </p>
              <h2 className="text-white" style={{ fontFamily: SERIF, fontWeight: 500, fontSize: "clamp(1.6rem,3.4vw,2.6rem)", lineHeight: 1.05 }}>
                {project.label}
              </h2>
            </div>
            <span className="text-white/50" style={{ fontFamily: SANS, fontSize: 12, fontWeight: 400, letterSpacing: "0.06em" }}>DVA Contracting</span>
          </div>
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {PROJECTS.map((p) => (
            <div
              key={p.id}
              className="flex-shrink-0 w-14 h-10 rounded overflow-hidden transition-all"
              style={{
                border: p.id === project.id ? "1.5px solid #3B82F6" : "1.5px solid rgba(255,255,255,0.1)",
                opacity: p.id === project.id ? 1 : 0.45,
              }}
            >
              <img src={p.thumb} alt={p.label} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Service Card ─────────────────────────────────────────────────────────────

function ServiceCard({ s }: { s: (typeof SERVICES)[number] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative overflow-hidden cursor-pointer"
      style={{ aspectRatio: "3/4", borderRadius: 5, background: DARK }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Background image */}
      <img
        src={s.img}
        alt={s.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
        style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
        draggable={false}
      />

      {/* Gradient overlay — lightens on hover to reveal more image */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: "linear-gradient(to top, rgba(8,15,50,0.96) 0%, rgba(8,15,50,0.6) 45%, rgba(8,15,50,0.22) 100%)",
          opacity: hovered ? 0.9 : 1,
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-7">
        {/* Number */}
        <p
          className="leading-none mb-4 transition-colors duration-300"
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "3.4rem",
            color: hovered ? "rgba(147,197,253,0.75)" : "rgba(255,255,255,0.2)",
            lineHeight: 1,
          }}
        >
          {s.num}
        </p>

        <p
          className="mb-2 transition-colors duration-300"
          style={{
            fontFamily: SANS,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: hovered ? SKY_SOFT : "rgba(147,197,253,0.6)",
          }}
        >
          {s.tagline}
        </p>

        <h3
          className="text-white mb-4"
          style={{ fontFamily: SERIF, fontWeight: 500, fontSize: "clamp(1.4rem,2.3vw,1.8rem)", lineHeight: 1.08 }}
        >
          {s.title}
        </h3>

        {/* Description — slides in on hover */}
        <div
          className="overflow-hidden transition-all duration-500"
          style={{ maxHeight: hovered ? "150px" : "0px", opacity: hovered ? 1 : 0 }}
        >
          <p className="text-white/75 text-sm leading-relaxed mb-5" style={{ fontFamily: SANS, fontWeight: 300 }}>
            {s.desc}
          </p>
          <a
            href="#contact"
            className="flex items-center gap-2 transition-all duration-300"
            style={{ fontFamily: SANS, fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase", color: SKY }}
          >
            Get an estimate <ArrowRight size={14} />
          </a>
        </div>

        {/* Collapsed hint */}
        {!hovered && (
          <div
            className="flex items-center gap-1.5"
            style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.1em", color: "rgba(147,197,253,0.6)" }}
          >
            <span className="w-6 h-px" style={{ background: "rgba(96,165,250,0.5)" }} />
            <span className="uppercase font-medium">Explore</span>
          </div>
        )}
      </div>

      {/* Blue border on hover */}
      <div
        className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
        style={{
          border: "1.5px solid rgba(96,165,250,0.6)",
          opacity: hovered ? 1 : 0,
          borderRadius: 5,
        }}
      />
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [menuOpen, setMenuOpen]       = useState(false);

  const selectedProject = selectedIdx !== null ? PROJECTS[selectedIdx] : null;
  const openProject     = useCallback((p: Project) => setSelectedIdx(PROJECTS.findIndex((x) => x.id === p.id)), []);
  const goPrev          = useCallback(() => setSelectedIdx((i) => (i === null ? 0 : (i - 1 + PROJECTS.length) % PROJECTS.length)), []);
  const goNext          = useCallback(() => setSelectedIdx((i) => (i === null ? 0 : (i + 1) % PROJECTS.length)), []);

  // Contact form composes an email in the visitor's mail app — no backend needed.
  const submitForm = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") || "";
    const phone = fd.get("phone") || "";
    const from = fd.get("email") || "";
    const msg = fd.get("message") || "";
    const subject = encodeURIComponent(`Project inquiry from ${name || "the website"}`);
    const body = encodeURIComponent(`Name: ${name}\nPhone: ${phone}\nEmail: ${from}\n\nProject:\n${msg}`);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  }, []);

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(96,165,250,0.2)",
    fontFamily: SANS,
    fontWeight: 300,
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: SANS, background: "#FFFFFF", color: INK }}>

      {/* ── Nav ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-10 py-4"
        style={{ background: "rgba(8,15,40,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(96,165,250,0.12)" }}
      >
        <div className="flex items-baseline gap-2.5">
          <span className="leading-none text-white" style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 25 }}>DVA</span>
          <span className="hidden lg:block" style={{ fontFamily: SANS, fontWeight: 500, fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>Contracting</span>
        </div>
        <div className="hidden md:flex items-center gap-5 lg:gap-7">
          {["Gallery", "Services", "Projects", "About", "Contact"].map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`} className="text-white/65 hover:text-white transition-colors whitespace-nowrap" style={{ fontSize: 11, letterSpacing: "0.09em", textTransform: "uppercase", fontWeight: 500 }}>
              {link}
            </a>
          ))}
          <a href={PHONE_TEL} className="hidden lg:flex items-center gap-2 text-white/90 hover:text-white font-semibold transition-colors whitespace-nowrap" style={{ fontSize: 13, letterSpacing: "0.04em" }}>
            <Phone size={13} style={{ color: SKY }} /> {PHONE_DISPLAY}
          </a>
          <a href="#contact" className="text-white px-5 py-2.5 font-semibold transition-colors whitespace-nowrap" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", background: BLUE, borderRadius: 3 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = BLUE_DARK)}
            onMouseLeave={(e) => (e.currentTarget.style.background = BLUE)}>
            Free Estimate
          </a>
        </div>
        <div className="flex md:hidden items-center gap-4">
          <a href={PHONE_TEL} aria-label={`Call ${PHONE_DISPLAY}`} style={{ color: SKY }}><Phone size={19} /></a>
          <button aria-label="Menu" className="text-white/75 hover:text-white transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-8" style={{ background: "rgba(8,15,40,0.98)" }}>
          {["Gallery", "Services", "Projects", "About", "Contact"].map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`} className="text-white transition-colors"
              style={{ fontFamily: SERIF, fontWeight: 500, fontSize: "2.4rem" }}
              onClick={() => setMenuOpen(false)}
            >
              {link}
            </a>
          ))}
          <a href={PHONE_TEL} className="flex items-center gap-3 font-semibold" style={{ fontFamily: SANS, fontSize: "1.1rem", letterSpacing: "0.04em", color: SKY }}>
            <Phone size={18} /> {PHONE_DISPLAY}
          </a>
        </div>
      )}

      {/* ── Hero: full-bleed real project photo ── */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{
          backgroundImage: `url(${asset("projects/living-accent.jpg")})`,
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
        }}
      >
        {/* Scrim: readable text on the left, photo breathes on the right */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(100deg, rgba(8,15,40,0.86) 0%, rgba(8,15,40,0.62) 42%, rgba(8,15,40,0.18) 75%, rgba(8,15,40,0.3) 100%)" }}
        />
        {/* below lg the text sits over the middle of the photo — add an even wash */}
        <div
          className="absolute inset-0 lg:hidden pointer-events-none"
          style={{ background: "rgba(8,15,40,0.48)" }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(8,15,40,0.55), transparent)" }}
        />

        {/* Headline */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-8 lg:px-16 pt-20">
          <div className="max-w-xl text-center lg:text-left mx-auto lg:mx-0">
            <p
              className="mb-6"
              style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase", color: SKY_SOFT }}
            >
              Owner-Led · Bartlett, Illinois
            </p>

            <h1
              className="mb-7 text-white"
              style={{
                fontFamily: SERIF,
                fontWeight: 500,
                fontSize: "clamp(3.2rem, 6.5vw, 5.4rem)",
                letterSpacing: "-0.015em",
                lineHeight: 1.04,
              }}
            >
              Building
              <br />
              <em style={{ fontStyle: "italic", fontWeight: 400, color: SKY_SOFT }}>your vision.</em>
            </h1>

            <p className="mb-9 max-w-md mx-auto lg:mx-0" style={{ fontSize: "1rem", lineHeight: 1.75, fontWeight: 300, color: "rgba(255,255,255,0.78)" }}>
              Kitchens, bathrooms, basements, additions, and new builds. DVA Contracting is Dave Amaro's crew: over fifteen years of residential and commercial work, from the first walkthrough to the final punch list.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <a
                href="#contact"
                className="group flex items-center justify-center gap-2.5 text-white px-8 py-4 font-semibold uppercase transition-all duration-300"
                style={{ fontFamily: SANS, fontSize: "0.85rem", letterSpacing: "0.1em", background: BLUE, borderRadius: 3 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = BLUE_DARK)}
                onMouseLeave={(e) => (e.currentTarget.style.background = BLUE)}
              >
                Free Estimate
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#gallery"
                className="flex items-center justify-center gap-2.5 text-white/85 hover:text-white px-8 py-4 font-semibold uppercase transition-all duration-300"
                style={{ fontFamily: SANS, fontSize: "0.85rem", letterSpacing: "0.1em", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 3 }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.8)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)")}
              >
                View Work
              </a>
            </div>

            <p className="mt-8" style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.08em", color: "rgba(255,255,255,0.55)" }}>
              Pictured: a DVA living room remodel.
            </p>
          </div>
        </div>

        {/* Scroll cue */}
        <a href="#gallery" className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 transition-colors" style={{ color: "rgba(255,255,255,0.55)" }}>
          <span style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase" }}>Scroll</span>
          <ChevronDown size={14} className="animate-bounce" />
        </a>
      </section>

      {/* ── Gallery: stats rail on the left, the spinning sphere alone on the right ── */}
      <section
        id="gallery"
        className="lg:h-screen flex flex-col px-8 pt-24 pb-10"
        style={{ background: "#FFFFFF", borderBottom: `1px solid ${LINE}`, scrollMarginTop: 0 }}
      >
        <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-16 min-h-0">
          {/* Left rail: heading + honest numbers, horizontal hairlines only */}
          <div className="w-full lg:w-[320px] shrink-0">
            <Reveal>
              <p className="mb-3" style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: BLUE }}>
                The Portfolio, In Motion
              </p>
              <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: "clamp(1.9rem,2.6vw,2.5rem)", color: INK, lineHeight: 1.08 }}>
                Take a spin through <em style={{ fontStyle: "italic", fontWeight: 400, color: BLUE }}>the work.</em>
              </h2>
            </Reveal>
            <div className="mt-8 lg:mt-10 grid grid-cols-2 lg:grid-cols-1 gap-x-8">
              {STATS.map((s, i) => (
                <Reveal key={s.label} delay={i * 0.07}>
                  <div className="py-4 lg:py-5" style={{ borderTop: `1px solid ${LINE}` }}>
                    <div className="leading-none mb-1.5" style={{ fontFamily: SERIF, fontWeight: 500, fontSize: "clamp(1.7rem,2.4vw,2.2rem)", color: BLUE_DARK }}>
                      {s.value}
                    </div>
                    <div style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500, color: INK2, lineHeight: 1.5 }}>
                      {s.label}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Sphere: alone on the right, scales by remaining width AND height */}
          <div className="flex-1 flex items-center justify-center min-h-[420px] lg:min-h-0 overflow-hidden">
            <div
              className="[--fitw:calc((min(100vw,560px)-4rem)/580)] [--fith:1] lg:[--fitw:calc((100vw-480px)/520)] lg:[--fith:calc((100vh-200px)/480)]"
              style={{ transform: "scale(min(1, var(--fitw), var(--fith)))", transformOrigin: "center center" }}
            >
              <Sphere3D onSelect={openProject} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="py-24 px-8" style={{ background: "#FFFFFF", scrollMarginTop: 70 }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="mb-3" style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: BLUE }}>
                  What We Do
                </p>
                <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: "clamp(2.2rem,4.5vw,3.4rem)", color: INK, lineHeight: 1.05 }}>
                  Our services
                </h2>
              </div>
              <p className="max-w-xs text-sm leading-relaxed" style={{ fontWeight: 400, color: INK3 }}>
                Every photo on this page is a DVA job. Hover a card to see what's included.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5">
            {SERVICES.map((s, idx) => (
              <Reveal key={s.num} delay={idx * 0.08}>
                <ServiceCard s={s} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Projects grid ── */}
      <section id="projects" className="py-24" style={{ background: STONE, scrollMarginTop: 70 }}>
        <div className="max-w-6xl mx-auto px-8">
          <Reveal>
            <div className="flex items-end justify-between mb-14">
              <div>
                <p className="mb-3" style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: BLUE }}>
                  Portfolio
                </p>
                <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: "clamp(2.2rem,4.5vw,3.4rem)", color: INK, lineHeight: 1.05 }}>
                  Real projects
                </h2>
              </div>
              <p className="hidden md:block max-w-xs text-sm leading-relaxed text-right" style={{ fontWeight: 400, color: INK3 }}>
                Kitchens, baths, basements, decks, and builds. Click any photo to view it full size.
              </p>
            </div>
          </Reveal>
          {/* Interlocking mosaic: three 2x2 feature tiles + 1x1 squares tile a perfect 4x6 rectangle */}
          <div className="grid grid-cols-2 md:grid-cols-4 grid-flow-dense gap-2.5">
            {PROJECTS.map((p, i) => {
              const featured = i === 0 || i === 5 || i === 10;
              return (
              <div
                key={p.id}
                className={`group relative overflow-hidden cursor-pointer ${
                  featured ? "md:col-span-2 md:row-span-2" : ""
                } ${i === 5 ? "md:col-start-3" : ""} ${
                  i === 0 ? "col-span-2 aspect-[16/10] md:aspect-auto" : featured ? "aspect-square md:aspect-auto" : "aspect-square"
                }`}
                style={{ background: "#DCE4F5", borderRadius: 4 }}
                onClick={() => setSelectedIdx(i)}
              >
                <img src={featured ? p.full : p.thumb} alt={p.label} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4"
                  style={{ background: "linear-gradient(to top, rgba(8,15,50,0.88) 0%, rgba(8,15,50,0.1) 60%, transparent 100%)" }}
                >
                  <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: SKY_SOFT }}>{p.category}</p>
                  <p className="text-white" style={{ fontFamily: SERIF, fontWeight: 500, fontSize: "1.05rem" }}>{p.label}</p>
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ border: "1.5px solid rgba(96,165,250,0.55)", borderRadius: 4 }} />
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-24 px-8" style={{ background: "#FFFFFF", borderTop: `1px solid ${LINE}`, scrollMarginTop: 70 }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <Reveal>
            <div>
              <p className="mb-3" style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: BLUE }}>
                About DVA
              </p>
              <h2 className="mb-6" style={{ fontFamily: SERIF, fontWeight: 500, fontSize: "clamp(2.2rem,4.5vw,3.4rem)", color: INK, lineHeight: 1.08 }}>
                Building trust,<br />
                <em style={{ fontStyle: "italic", fontWeight: 400, color: BLUE }}>crafting excellence.</em>
              </h2>
              <p className="mb-4 leading-relaxed text-[15px]" style={{ fontWeight: 400, color: INK2 }}>
                DVA Contracting is run by Dave Amaro, and it has been for more than fifteen years. Kitchens, bathrooms, basements, additions, decks, and ground-up builds, residential and commercial. Based in Bartlett and serving anywhere within about two hours of it.
              </p>
              <p className="leading-relaxed text-[15px] mb-8" style={{ fontWeight: 400, color: INK2 }}>
                You deal with Dave from the first walkthrough to the final punch list. He gives you a straight price, keeps you in the loop while the work happens, and stands behind it after the last truck leaves.
              </p>
              {/* [VERIFY with Dave: exact licensed/bonded/insured wording + license number before adding a badge for it] */}
              <div className="flex flex-wrap gap-3">
                {["Residential & Commercial", "Free Estimates", "Based in Bartlett, IL", "15+ Years in Business"].map((badge) => (
                  <span key={badge} className="px-3 py-1.5 text-xs font-medium" style={{ background: "#EFF6FF", border: "1px solid rgba(37,99,235,0.2)", color: BLUE_DARK, letterSpacing: "0.05em", borderRadius: 3 }}>
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative overflow-hidden" style={{ aspectRatio: "4/3", background: "#DCE4F5", borderRadius: 5, boxShadow: "0 30px 60px -30px rgba(12,26,63,0.35)" }}>
              <img src={asset("projects/framing-aerial.jpg")} alt="DVA Contracting crew framing a roof" className="w-full h-full object-cover" />
              <p className="absolute bottom-3 left-4 text-white/95" style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.08em", textShadow: "0 1px 8px rgba(0,0,0,.6)" }}>
                The crew, setting trusses
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-24 px-8" style={{ background: DARK, scrollMarginTop: 70 }}>
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <p className="mb-3" style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: SKY }}>
                Work With Us
              </p>
              <h2 className="mb-4 text-white" style={{ fontFamily: SERIF, fontWeight: 500, fontSize: "clamp(2.2rem,4.5vw,3.4rem)", lineHeight: 1.05 }}>
                Start your project
              </h2>
              <p className="max-w-lg mx-auto text-sm leading-relaxed" style={{ fontWeight: 300, color: "rgba(255,255,255,0.6)" }}>
                Tell us what you're planning. Dave will call you back to talk through scope, budget, and timing. No pressure, no obligation.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-5 gap-12 md:gap-16">
            <div className="md:col-span-2 space-y-6">
              {[
                { icon: <Phone size={15} />,  label: "Call Dave", value: PHONE_DISPLAY, href: PHONE_TEL },
                { icon: <Mail  size={15} />,  label: "Email",     value: EMAIL, href: `mailto:${EMAIL}` },
                { icon: <MapPin size={15}/>,  label: "Service Area", value: "Bartlett, IL, and about 2 hours in every direction" },
              ].map((c) => (
                <div key={c.label} className="flex items-start gap-4">
                  <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center" style={{ background: "rgba(96,165,250,0.12)", color: SKY, border: "1px solid rgba(96,165,250,0.25)", borderRadius: 3 }}>
                    {c.icon}
                  </div>
                  <div>
                    <p className="mb-0.5" style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(147,197,253,0.65)" }}>{c.label}</p>
                    {c.href
                      ? <a href={c.href} className="text-white/85 hover:text-white text-sm transition-colors">{c.value}</a>
                      : <p className="text-white/85 text-sm">{c.value}</p>}
                  </div>
                </div>
              ))}
              <div className="pt-5" style={{ borderTop: "1px solid rgba(96,165,250,0.15)" }}>
                <p className="text-xs leading-relaxed" style={{ fontWeight: 300, color: "rgba(255,255,255,0.45)" }}>
                  Family run. You'll get a call back from the owner, not a call center.
                </p>
              </div>
            </div>

            <form className="md:col-span-3 space-y-3" onSubmit={submitForm}>
              <div className="grid sm:grid-cols-2 gap-3">
                <input name="name" type="text" placeholder="Full Name" required
                  className="w-full px-4 py-3 text-white placeholder-white/40 text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(96,165,250,0.6)")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(96,165,250,0.2)")}
                />
                <input name="phone" type="tel" placeholder="Phone Number"
                  className="w-full px-4 py-3 text-white placeholder-white/40 text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(96,165,250,0.6)")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(96,165,250,0.2)")}
                />
              </div>
              <input name="email" type="email" placeholder="Email Address"
                className="w-full px-4 py-3 text-white placeholder-white/40 text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(96,165,250,0.6)")}
                onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(96,165,250,0.2)")}
              />
              <textarea name="message" placeholder="Describe your project: what, where, and roughly when" rows={4} required
                className="w-full px-4 py-3 text-white placeholder-white/40 text-sm outline-none transition-all resize-none"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(96,165,250,0.6)")}
                onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(96,165,250,0.2)")}
              />
              <button type="submit"
                className="w-full text-white py-4 font-semibold uppercase transition-all duration-300 flex items-center justify-center gap-2.5 group"
                style={{ fontFamily: SANS, fontSize: "0.85rem", letterSpacing: "0.12em", background: BLUE, borderRadius: 3 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = BLUE_DARK)}
                onMouseLeave={(e) => (e.currentTarget.style.background = BLUE)}
              >
                Send Message <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </button>
              <p className="text-xs text-center pt-1" style={{ fontWeight: 300, color: "rgba(255,255,255,0.4)" }}>
                Opens your email app with everything filled in. Prefer to talk? <a href={PHONE_TEL} style={{ color: SKY_SOFT }}>Call {PHONE_DISPLAY}</a>.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-8" style={{ background: DARKER, borderTop: "1px solid rgba(96,165,250,0.1)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-baseline gap-2.5">
            <span style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 22, color: SKY }}>DVA</span>
            <span style={{ fontFamily: SANS, fontWeight: 400, fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Contracting</span>
          </div>
          {/* [VERIFY with Dave: add real IL license number here if he wants it public] */}
          <p className="text-xs text-center" style={{ fontFamily: SANS, fontWeight: 300, color: "rgba(255,255,255,0.4)" }}>
            © 2026 DVA Contracting, Inc. All rights reserved. · Bartlett, Illinois · <a href={PHONE_TEL} className="hover:text-white/70 transition-colors">{PHONE_DISPLAY}</a>
          </p>
        </div>
      </footer>

      {/* ── Lightbox ── */}
      <Lightbox project={selectedProject} onClose={() => setSelectedIdx(null)} onPrev={goPrev} onNext={goNext} />
    </div>
  );
}
