import { useRef, useEffect, useState, useCallback } from "react";
import { X, Phone, Mail, MapPin, Menu, ArrowRight, ChevronDown } from "lucide-react";

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
  year: string;
}

const PROJECTS: Project[] = [
  { id: 1, thumb: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=400&fit=crop&auto=format", full: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&h=1000&fit=crop&auto=format", label: "Foundation Work",    category: "Structural",  year: "2024" },
  { id: 2, thumb: "https://images.unsplash.com/photo-1599707254554-027aeb4deacd?w=400&h=400&fit=crop&auto=format", full: "https://images.unsplash.com/photo-1599707254554-027aeb4deacd?w=1600&h=1000&fit=crop&auto=format", label: "Crane Operations",   category: "Heavy Civil", year: "2024" },
  { id: 3, thumb: "https://images.unsplash.com/photo-1694521787162-5373b598945c?w=400&h=400&fit=crop&auto=format", full: "https://images.unsplash.com/photo-1694521787162-5373b598945c?w=1600&h=1000&fit=crop&auto=format", label: "Site Management",   category: "Operations",  year: "2023" },
  { id: 4, thumb: "https://images.unsplash.com/photo-1527335988388-b40ee248d80c?w=400&h=400&fit=crop&auto=format", full: "https://images.unsplash.com/photo-1527335988388-b40ee248d80c?w=1600&h=1000&fit=crop&auto=format", label: "Steel Framing",     category: "Structural",  year: "2023" },
  { id: 5, thumb: "https://images.unsplash.com/photo-1609867271967-a82f85c48531?w=400&h=400&fit=crop&auto=format", full: "https://images.unsplash.com/photo-1609867271967-a82f85c48531?w=1600&h=1000&fit=crop&auto=format", label: "High-Rise Build",   category: "Commercial",  year: "2023" },
  { id: 6, thumb: "https://images.unsplash.com/photo-1718816281270-ed6ef8357859?w=400&h=400&fit=crop&auto=format", full: "https://images.unsplash.com/photo-1718816281270-ed6ef8357859?w=1600&h=1000&fit=crop&auto=format", label: "Interior Fit-Out",  category: "Renovation",  year: "2024" },
  { id: 7, thumb: "https://images.unsplash.com/photo-1731168273756-e02cae42265b?w=400&h=400&fit=crop&auto=format", full: "https://images.unsplash.com/photo-1731168273756-e02cae42265b?w=1600&h=1000&fit=crop&auto=format", label: "Finish Carpentry",  category: "Renovation",  year: "2024" },
  { id: 8, thumb: "https://images.unsplash.com/photo-1694521787673-28cbd8830ea5?w=400&h=400&fit=crop&auto=format", full: "https://images.unsplash.com/photo-1694521787673-28cbd8830ea5?w=1600&h=1000&fit=crop&auto=format", label: "Field Crew",        category: "Operations",  year: "2023" },
  { id: 9, thumb: "https://images.unsplash.com/photo-1602757115429-b4190ae087be?w=400&h=400&fit=crop&auto=format", full: "https://images.unsplash.com/photo-1602757115429-b4190ae087be?w=1600&h=1000&fit=crop&auto=format", label: "Concrete Pour",    category: "Structural",  year: "2024" },
  { id: 10,thumb: "https://images.unsplash.com/photo-1698889670677-caac664cfce0?w=400&h=400&fit=crop&auto=format", full: "https://images.unsplash.com/photo-1698889670677-caac664cfce0?w=1600&h=1000&fit=crop&auto=format", label: "Shell Structure",  category: "Commercial",  year: "2023" },
  { id: 11,thumb: "https://images.unsplash.com/photo-1692890659047-079b769ee3e6?w=400&h=400&fit=crop&auto=format", full: "https://images.unsplash.com/photo-1692890659047-079b769ee3e6?w=1600&h=1000&fit=crop&auto=format", label: "Site Prep",        category: "Structural",  year: "2024" },
];

const SERVICES = [
  {
    num: "01",
    title: "General Contracting",
    tagline: "End-to-end project delivery",
    desc: "Full-scope management from groundbreaking through final inspection. We self-perform critical path work and hold every subcontractor to our standard.",
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&h=900&fit=crop&auto=format",
  },
  {
    num: "02",
    title: "Renovations & Fit-Out",
    tagline: "Precision with minimal disruption",
    desc: "Commercial and residential renovations delivered on time, with meticulous attention to finishes and active-occupancy sequencing.",
    img: "https://images.unsplash.com/photo-1718816281270-ed6ef8357859?w=700&h=900&fit=crop&auto=format",
  },
  {
    num: "03",
    title: "Design-Build",
    tagline: "One team, one vision",
    desc: "Integrated design and construction services that compress schedules, reduce change orders, and deliver a single point of accountability.",
    img: "https://images.unsplash.com/photo-1527335988388-b40ee248d80c?w=700&h=900&fit=crop&auto=format",
  },
];

const STATS = [
  { value: "150+", label: "Projects Completed" },
  { value: "22",   label: "Years in Business"  },
  { value: "$480M",label: "Project Value"       },
  { value: "98%",  label: "Client Satisfaction" },
];

// ─── 3D Sphere Carousel ───────────────────────────────────────────────────────

function Sphere3D({ onSelect }: { onSelect: (p: Project) => void }) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const imgRefs       = useRef<(HTMLDivElement | null)[]>(new Array(PROJECTS.length).fill(null));
  const angleRef      = useRef(0);
  const velRef        = useRef(BASE_SPEED);
  const dragging      = useRef(false);
  const prevX         = useRef(0);
  const totalDragRef  = useRef(0);
  const rafId         = useRef(0);
  const [grabbing, setGrabbing] = useState(false);

  // Pre-compute fixed sphere positions in radians
  const positions = SPHERE_CONFIG.map((c) => ({
    az: (c.az * Math.PI) / 180,
    el: (c.el * Math.PI) / 180,
    size: c.size,
  }));

  useEffect(() => {
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 16.67, 3);
      last = now;

      if (!dragging.current) {
        velRef.current *= Math.pow(FRICTION, dt);
        if (Math.abs(velRef.current) < BASE_SPEED) velRef.current = BASE_SPEED;
        angleRef.current += velRef.current * dt;
      }

      positions.forEach((pos, i) => {
        const el = imgRefs.current[i];
        if (!el) return;

        const effectiveAz = pos.az + angleRef.current;

        // Spherical → cartesian (y-up, z-toward viewer)
        const cosEl = Math.cos(pos.el);
        const x3d   =  SPHERE_R * cosEl * Math.sin(effectiveAz);
        const y3d   = -SPHERE_R * Math.sin(pos.el);        // negative = up in CSS
        const z3d   =  SPHERE_R * cosEl * Math.cos(effectiveAz);

        // Perspective projection
        const denom  = PERSPECTIVE - z3d;
        const scale  = PERSPECTIVE / denom;
        const x2d    = x3d * scale;
        const y2d    = y3d * scale;

        const sz     = pos.size * scale;
        const opacity= Math.min(1, Math.max(0.12, (z3d + SPHERE_R) / (2 * SPHERE_R)));
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
      if (Math.abs(velRef.current) < 0.003) velRef.current = BASE_SPEED;
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
        if (Math.abs(velRef.current) < 0.003) velRef.current = BASE_SPEED;
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
          border: "1px solid rgba(96,165,250,0.12)",
        }}
      />

      {/* Images */}
      {PROJECTS.map((proj, i) => (
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
              border: "2px solid rgba(255,255,255,0.22)",
              boxShadow: "0 12px 48px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)",
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
                background: "rgba(37,99,235,0.22)",
                border: "2px solid rgba(147,197,253,0.7)",
              }}
            />
            {/* Label on hover */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-blue-950/90 to-transparent p-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p
                className="text-white font-bold uppercase leading-tight"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: "0.06em" }}
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
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 9,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(148,163,184,0.5)",
        }}
      >
        drag to spin · click to expand
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
      style={{ background: "rgba(8,15,40,0.97)", backdropFilter: "blur(14px)" }}
      onClick={onClose}
    >
      <button
        className="absolute top-6 right-6 flex items-center justify-center w-10 h-10 rounded-full transition-all hover:bg-white/10"
        style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)" }}
        onClick={onClose}
      >
        <X size={18} />
      </button>

      <button
        className="absolute left-4 md:left-8 flex items-center justify-center w-10 h-10 rounded-full transition-all hover:bg-blue-500/20"
        style={{ border: "1px solid rgba(96,165,250,0.25)", color: "rgba(147,197,253,0.7)" }}
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
      >
        <ArrowRight size={18} className="rotate-180" />
      </button>

      <button
        className="absolute right-4 md:right-8 flex items-center justify-center w-10 h-10 rounded-full transition-all hover:bg-blue-500/20"
        style={{ border: "1px solid rgba(96,165,250,0.25)", color: "rgba(147,197,253,0.7)" }}
        onClick={(e) => { e.stopPropagation(); onNext(); }}
      >
        <ArrowRight size={18} />
      </button>

      <div
        className="relative mx-16 md:mx-24 w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-sm" style={{ background: "#0C1A3F" }}>
          <img
            src={project.full}
            alt={project.label}
            className="w-full object-cover"
            style={{ maxHeight: "72vh" }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 px-6 py-5 flex items-end justify-between"
            style={{ background: "linear-gradient(to top, rgba(8,15,40,0.92) 0%, transparent 100%)" }}
          >
            <div>
              <p className="text-blue-400 mb-1" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                {project.category}
              </p>
              <h2 className="text-white font-black uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(1.8rem,4vw,3rem)", lineHeight: 0.95 }}>
                {project.label}
              </h2>
            </div>
            <span className="text-white/35" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 300 }}>{project.year}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {PROJECTS.map((p) => (
            <div
              key={p.id}
              className="flex-shrink-0 w-14 h-10 rounded overflow-hidden transition-all"
              style={{
                border: p.id === project.id ? "1.5px solid #3B82F6" : "1.5px solid rgba(255,255,255,0.08)",
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

function ServiceCard({ s, idx }: { s: (typeof SERVICES)[number]; idx: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative overflow-hidden cursor-pointer"
      style={{ aspectRatio: "3/4", borderRadius: 4, background: "#0C1A3F" }}
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
          background: "linear-gradient(to top, rgba(8,15,50,0.97) 0%, rgba(8,15,50,0.65) 45%, rgba(8,15,50,0.28) 100%)",
          opacity: hovered ? 0.88 : 1,
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-7">
        {/* Number */}
        <p
          className="font-black leading-none mb-4 transition-colors duration-300"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "4.5rem",
            color: hovered ? "rgba(96,165,250,0.5)" : "rgba(255,255,255,0.1)",
            lineHeight: 1,
          }}
        >
          {s.num}
        </p>

        <p
          className="mb-2 transition-colors duration-300"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: hovered ? "#93C5FD" : "rgba(147,197,253,0.5)",
          }}
        >
          {s.tagline}
        </p>

        <h3
          className="text-white font-black uppercase mb-4"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(1.5rem,2.5vw,2rem)", lineHeight: 0.95 }}
        >
          {s.title}
        </h3>

        {/* Description — slides in on hover */}
        <div
          className="overflow-hidden transition-all duration-500"
          style={{ maxHeight: hovered ? "120px" : "0px", opacity: hovered ? 1 : 0 }}
        >
          <p className="text-white/60 text-sm leading-relaxed mb-5" style={{ fontWeight: 300 }}>
            {s.desc}
          </p>
          <div
            className="flex items-center gap-2 font-semibold uppercase transition-all duration-300"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.9rem", letterSpacing: "0.1em", color: "#60A5FA" }}
          >
            Learn more <ArrowRight size={14} />
          </div>
        </div>

        {/* Collapsed "learn more" hint */}
        {!hovered && (
          <div
            className="flex items-center gap-1.5"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.1em", color: "rgba(96,165,250,0.5)" }}
          >
            <span className="w-6 h-px bg-blue-400/40" />
            <span className="uppercase font-medium">Explore</span>
          </div>
        )}
      </div>

      {/* Blue glow border on hover */}
      <div
        className="absolute inset-0 rounded transition-opacity duration-300 pointer-events-none"
        style={{
          border: "1.5px solid rgba(96,165,250,0.55)",
          opacity: hovered ? 1 : 0,
          borderRadius: 4,
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

  return (
    <div className="bg-background text-foreground min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Nav ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-10 py-4"
        style={{ background: "rgba(12,26,63,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(96,165,250,0.1)" }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-blue-400 font-black leading-none" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, letterSpacing: "0.03em" }}>DVA</span>
          <span className="text-white/55 font-light hidden sm:block" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, letterSpacing: "0.28em", textTransform: "uppercase" }}>Contracting</span>
        </div>
        <div className="hidden md:flex items-center gap-7">
          {["Services", "Projects", "About", "Contact"].map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`} className="text-white/50 hover:text-white transition-colors" style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500 }}>
              {link}
            </a>
          ))}
          <a href="#contact" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 font-bold transition-colors" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Get a Quote
          </a>
        </div>
        <button className="md:hidden text-white/70 hover:text-white transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-8" style={{ background: "rgba(8,15,40,0.98)" }}>
          {["Services", "Projects", "About", "Contact"].map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`} className="text-white font-black uppercase hover:text-blue-400 transition-colors"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "2.5rem", letterSpacing: "0.06em" }}
              onClick={() => setMenuOpen(false)}
            >
              {link}
            </a>
          ))}
        </div>
      )}

      {/* ── Hero ── */}
      <section
        className="relative min-h-screen flex flex-col lg:flex-row items-center justify-center pt-16 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #080F28 0%, #0C1A3F 55%, #0D2060 100%)" }}
      >
        {/* Very subtle noise — just a radial vignette for depth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 70% at 70% 50%, rgba(37,99,235,0.07) 0%, transparent 70%)" }}
        />

        {/* Left — Headline */}
        <div className="relative z-10 w-full lg:w-5/12 px-8 lg:pl-16 lg:pr-6 text-center lg:text-left mb-10 lg:mb-0 pt-8 lg:pt-0">
          <p
            className="mb-5 text-blue-400/70"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase" }}
          >
            Licensed · Bonded · Insured
          </p>

          <h1
            className="font-black uppercase leading-none mb-6"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "clamp(4rem, 9vw, 7.8rem)",
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              lineHeight: 0.9,
            }}
          >
            Building
            <br />
            <span style={{ color: "#60A5FA" }}>Your</span>
            <br />
            Vision
          </h1>

          <p className="text-white/40 mb-8 max-w-sm mx-auto lg:mx-0" style={{ fontSize: "0.95rem", lineHeight: 1.75, fontWeight: 300 }}>
            DVA Contracting delivers commercial and residential construction with unmatched precision — foundation to finish.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <a
              href="#contact"
              className="group flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 font-bold uppercase transition-all duration-300"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.05rem", letterSpacing: "0.1em" }}
            >
              Free Estimate
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#projects"
              className="flex items-center justify-center gap-2.5 text-white/60 hover:text-white border hover:border-white/40 px-8 py-4 font-semibold uppercase transition-all duration-300"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.05rem", letterSpacing: "0.1em", borderColor: "rgba(96,165,250,0.25)" }}
            >
              View Work
            </a>
          </div>
        </div>

        {/* Right — 3D Sphere */}
        <div className="relative z-10 w-full lg:w-7/12 flex items-center justify-center py-8 lg:py-0">
          <div style={{ transform: `scale(min(1, calc((min(100vw, 560px) - 2rem) / 520px)))`, transformOrigin: "center center" }}>
            <Sphere3D onSelect={openProject} />
          </div>
        </div>

        {/* Scroll cue */}
        <a href="#stats" className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 transition-colors" style={{ color: "rgba(148,163,184,0.3)" }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase" }}>Scroll</span>
          <ChevronDown size={14} className="animate-bounce" />
        </a>
      </section>

      {/* ── Stats ── */}
      <section id="stats" className="py-14 bg-white border-b" style={{ borderColor: "rgba(37,99,235,0.1)" }}>
        <div className="max-w-5xl mx-auto px-8 grid grid-cols-2 lg:grid-cols-4 gap-10">
          {STATS.map((s, i) => (
            <div key={s.label} className="text-center relative">
              {i > 0 && (
                <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 h-10 w-px" style={{ background: "rgba(37,99,235,0.12)" }} />
              )}
              <div className="font-black leading-none mb-1.5" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(2.4rem,5vw,3.5rem)", color: "#1D4ED8" }}>
                {s.value}
              </div>
              <div className="text-slate-500" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 500 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="py-24 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-blue-600 mb-3" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                What We Do
              </p>
              <h2 className="font-black uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(2.5rem,5vw,4rem)", color: "#0C1A3F", lineHeight: 0.95 }}>
                Our Services
              </h2>
            </div>
            <p className="text-slate-400 max-w-xs text-sm leading-relaxed" style={{ fontWeight: 300 }}>
              Hover each service to explore — or reach out to discuss your project scope.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {SERVICES.map((s, idx) => (
              <ServiceCard key={s.num} s={s} idx={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Projects grid ── */}
      <section id="projects" className="py-24" style={{ background: "#F0F4FF" }}>
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex items-end justify-between mb-14">
            <div>
              <p className="text-blue-600 mb-3" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                Portfolio
              </p>
              <h2 className="font-black uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(2.5rem,5vw,4rem)", color: "#0C1A3F", lineHeight: 0.95 }}>
                Recent Projects
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {PROJECTS.map((p, i) => (
              <div
                key={p.id}
                className="group relative overflow-hidden cursor-pointer"
                style={{ aspectRatio: i === 0 || i === 5 ? "1/1.3" : "1/1", background: "#CBD5E1", borderRadius: 3 }}
                onClick={() => setSelectedIdx(i)}
              >
                <img src={p.thumb} alt={p.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4"
                  style={{ background: "linear-gradient(to top, rgba(8,15,50,0.88) 0%, rgba(8,15,50,0.1) 60%, transparent 100%)" }}
                >
                  <p className="text-blue-300" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>{p.category}</p>
                  <p className="text-white font-bold uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.1rem" }}>{p.label}</p>
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ border: "1.5px solid rgba(96,165,250,0.5)", borderRadius: 3 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-24 px-8 bg-white border-t" style={{ borderColor: "rgba(37,99,235,0.08)" }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-blue-600 mb-3" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              About DVA
            </p>
            <h2 className="font-black uppercase mb-6" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(2.5rem,5vw,4rem)", color: "#0C1A3F", lineHeight: 0.95 }}>
              Built on Trust,<br />
              <span style={{ color: "#2563EB" }}>Delivered with Pride</span>
            </h2>
            <p className="text-slate-500 mb-4 leading-relaxed text-sm" style={{ fontWeight: 300 }}>
              Since 2002, DVA Contracting has been the partner of choice for developers, property owners, and municipalities. We combine trade expertise with rigorous project management to deliver results that stand for generations.
            </p>
            <p className="text-slate-500 leading-relaxed text-sm mb-8" style={{ fontWeight: 300 }}>
              Our crews are fully licensed, bonded, and insured. We self-perform the critical path and manage specialty subcontractors with the same accountability we hold ourselves to.
            </p>
            <div className="flex flex-wrap gap-3">
              {["Licensed GC — Class A", "OSHA 30 Certified", "Bonded & Insured", "MBE Certified"].map((badge) => (
                <span key={badge} className="px-3 py-1.5 text-blue-700 text-xs font-medium" style={{ background: "#EFF6FF", border: "1px solid rgba(37,99,235,0.18)", letterSpacing: "0.05em" }}>
                  {badge}
                </span>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden" style={{ aspectRatio: "4/3", background: "#CBD5E1", borderRadius: 3 }}>
            <img src="https://images.unsplash.com/photo-1694521787799-ad4ad241cb39?w=800&h=600&fit=crop&auto=format" alt="DVA Contracting team" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.12) 0%, transparent 60%)" }} />
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-24 px-8" style={{ background: "#0C1A3F" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-400 mb-3" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Work With Us
            </p>
            <h2 className="font-black uppercase mb-4" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(2.5rem,5vw,4rem)", color: "#FFFFFF", lineHeight: 0.95 }}>
              Start Your Project
            </h2>
            <p className="text-white/35 max-w-lg mx-auto text-sm leading-relaxed" style={{ fontWeight: 300 }}>
              Tell us about your project and we'll respond within 24 hours with a preliminary assessment.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-12 md:gap-16">
            <div className="md:col-span-2 space-y-6">
              {[
                { icon: <Phone size={15} />, label: "Call Us",  value: "(555) 842-3900" },
                { icon: <Mail  size={15} />, label: "Email",    value: "projects@dvacontracting.com" },
                { icon: <MapPin size={15}/>, label: "Office",   value: "1200 Industrial Blvd, Suite 400" },
              ].map((c) => (
                <div key={c.label} className="flex items-start gap-4">
                  <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center" style={{ background: "rgba(96,165,250,0.12)", color: "#60A5FA", border: "1px solid rgba(96,165,250,0.2)" }}>
                    {c.icon}
                  </div>
                  <div>
                    <p className="text-blue-400/50 mb-0.5" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>{c.label}</p>
                    <p className="text-white/75 text-sm">{c.value}</p>
                  </div>
                </div>
              ))}
              <div className="pt-5 border-t" style={{ borderColor: "rgba(96,165,250,0.1)" }}>
                <p className="text-white/20 text-xs leading-relaxed" style={{ fontWeight: 300 }}>
                  Mon–Fri 7:00am–5:30pm<br />Emergency line available 24/7
                </p>
              </div>
            </div>

            <form className="md:col-span-3 space-y-3" onSubmit={(e) => e.preventDefault()}>
              <div className="grid sm:grid-cols-2 gap-3">
                {["Full Name", "Company"].map((f) => (
                  <input key={f} type="text" placeholder={f}
                    className="w-full px-4 py-3 text-white placeholder-white/25 text-sm outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(96,165,250,0.15)", fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(96,165,250,0.55)")}
                    onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(96,165,250,0.15)")}
                  />
                ))}
              </div>
              {["Email Address", "Phone Number"].map((f) => (
                <input key={f} type="text" placeholder={f}
                  className="w-full px-4 py-3 text-white placeholder-white/25 text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(96,165,250,0.15)", fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(96,165,250,0.55)")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(96,165,250,0.15)")}
                />
              ))}
              <textarea placeholder="Describe your project — scope, location, timeline..." rows={4}
                className="w-full px-4 py-3 text-white placeholder-white/25 text-sm outline-none transition-all resize-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(96,165,250,0.15)", fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(96,165,250,0.55)")}
                onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(96,165,250,0.15)")}
              />
              <button type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2.5 group"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1rem", letterSpacing: "0.12em" }}
              >
                Send Message <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-8 border-t" style={{ background: "#080F28", borderColor: "rgba(96,165,250,0.08)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-blue-400 font-black" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22 }}>DVA</span>
            <span className="text-white/30 font-light" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: "0.22em", textTransform: "uppercase" }}>Contracting</span>
          </div>
          <p className="text-white/18 text-xs text-center" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.2)" }}>
            © 2024 DVA Contracting. All rights reserved. · Licensed Contractor #C-38291
          </p>
        </div>
      </footer>

      {/* ── Lightbox ── */}
      <Lightbox project={selectedProject} onClose={() => setSelectedIdx(null)} onPrev={goPrev} onNext={goNext} />
    </div>
  );
}
