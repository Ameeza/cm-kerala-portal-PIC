import React, { useEffect, useRef, useState } from 'react';
import { Landmark, Building2, HeartPulse, GraduationCap, Droplets, Zap, Trees, Bus, Route, Sparkles } from 'lucide-react';

export const FALLBACK_DEPARTMENTS = [
  { id: 'f1', name: 'Public Works Department', description: 'Roads, bridges and public infrastructure' },
  { id: 'f2', name: 'Health and Family Welfare', description: 'Hospitals, clinics and public health services' },
  { id: 'f3', name: 'General Education', description: 'Government schools and education services' },
  { id: 'f4', name: 'Local Self Government', description: 'Municipal and panchayat services' },
  { id: 'f5', name: 'Water Resources', description: 'Drinking water, irrigation and water supply' },
  { id: 'f6', name: 'Power Department', description: 'Electricity distribution and street lighting' },
  { id: 'f7', name: 'Revenue Department', description: 'Land records and revenue administration' },
  { id: 'f8', name: 'Transport Department', description: 'Public transport and road safety' }
];

export function deptIcon(name = '') {
  const n = name.toLowerCase();
  if (n.includes('work')) return <Route size={22} />;
  if (n.includes('health')) return <HeartPulse size={22} />;
  if (n.includes('educ')) return <GraduationCap size={22} />;
  if (n.includes('water')) return <Droplets size={22} />;
  if (n.includes('power')) return <Zap size={22} />;
  if (n.includes('revenue')) return <Landmark size={22} />;
  if (n.includes('transport')) return <Bus size={22} />;
  if (n.includes('local')) return <Trees size={22} />;
  return <Building2 size={22} />;
}

// Deterministic sample figures per district, clearly labelled as illustrative in the UI.
export function sampleFor(name) {
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const filed = 120 + (h % 380), resolved = Math.round(filed * (0.62 + ((h >>> 3) % 25) / 100)), days = 4 + ((h >>> 5) % 9);
  return { filed, resolved, days };
}
export const SAMPLE_WEIGHTS = Object.fromEntries(['Kasaragod','Kannur','Wayanad','Kozhikode','Malappuram','Palakkad','Thrissur','Ernakulam','Idukki','Kottayam','Alappuzha','Pathanamthitta','Kollam','Thiruvananthapuram'].map(d => [d, sampleFor(d).filed]));

export function useInView(threshold = 0.2) {
  const ref = useRef(null); const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (!('IntersectionObserver' in window)) { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold });
    io.observe(el); return () => io.disconnect();
  }, []);
  return [ref, seen];
}

export function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }) {
  const [ref, seen] = useInView(0.15);
  return <Tag ref={ref} className={`reveal ${seen ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</Tag>;
}

export function CountUp({ to, suffix = '', duration = 1400 }) {
  const [ref, seen] = useInView(0.4); const [v, setV] = useState(0);
  useEffect(() => {
    if (!seen) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(to); return; }
    let raf, t0; const step = t => { t0 ??= t; const p = Math.min((t - t0) / duration, 1); setV(Math.round(to * (1 - Math.pow(1 - p, 4)))); if (p < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf);
  }, [seen, to]);
  return <b ref={ref}>{v.toLocaleString('en-IN')}{suffix}</b>;
}

export function Tilt({ as: Tag = 'button', className, children, ...rest }) {
  const ref = useRef(null);
  const move = e => { const el = ref.current, r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; el.style.transform = `rotateY(${(x - 0.5) * 12}deg) rotateX(${(0.5 - y) * 10}deg) translateY(-4px)`; el.style.setProperty('--mx', x * 100 + '%'); el.style.setProperty('--my', y * 100 + '%'); };
  const leave = () => { if (ref.current) ref.current.style.transform = ''; };
  return <Tag ref={ref} className={className} onPointerMove={move} onPointerLeave={leave} {...rest}>{children}</Tag>;
}

// The path of a grievance: a gold line draws itself as the section scrolls into view.
export function Journey({ stops }) {
  const [ref, seen] = useInView(0.25);
  const path = useRef(null);
  useEffect(() => {
    if (!seen || !path.current) return;
    const p = path.current, len = p.getTotalLength(); p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
    p.getBoundingClientRect(); p.style.transition = 'stroke-dashoffset 2.6s cubic-bezier(.4,.1,.2,1)'; p.style.strokeDashoffset = 0;
  }, [seen]);
  return (
    <div className="journey" ref={ref}>
      <svg className="journeySvg" viewBox="0 0 1000 220" preserveAspectRatio="none" aria-hidden="true">
        <path ref={path} vectorEffect="non-scaling-stroke" d="M30 30 C 130 30, 150 100, 260 90 S 380 150, 480 120 S 620 60, 710 100 S 860 160, 970 90" />
      </svg>
      <div className="stops">
        {stops.map(([t, d], i) => <div key={t} className={`stop ${seen ? 'on' : ''}`} style={{ transitionDelay: `${i * 450}ms` }}><span className="node" style={{ transitionDelay: `${i * 450}ms` }}>{i + 1}</span><h3>{t}</h3><p>{d}</p></div>)}
      </div>
    </div>
  );
}

const DEMO_TEXT = 'The street light near Vazhuthacaud junction has been out for two weeks and the road is very dark for school children in the evening.';
export function AiDemo() {
  const [ref, seen] = useInView(0.35); const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(DEMO_TEXT.length); return; }
    const id = setInterval(() => setN(x => { if (x >= DEMO_TEXT.length) { clearInterval(id); return x; } return x + 2; }), 28);
    return () => clearInterval(id);
  }, [seen]);
  const done = n >= DEMO_TEXT.length;
  return (
    <div className="aiWindow" ref={ref}>
      <div className="typed">{DEMO_TEXT.slice(0, n)}{!done && <span className="caret" />}</div>
      <div className={`aiOut ${done ? 'show' : ''}`}>
        <span>Category<strong>Electricity</strong></span><span>Department<strong>Power Department</strong></span><span>Priority<strong>Medium</strong></span>
      </div>
      <div className="aiLabel"><Sparkles size={12} style={{ verticalAlign: '-2px' }} /> Example of an advisory suggestion. A CMO officer reviews it before any routing.</div>
    </div>
  );
}
