import React, { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { ArrowRight, Search, ArrowDown } from 'lucide-react';
import KeralaScene, { DISTRICTS, DISTRICT_INFO } from './KeralaScene.jsx';
import { FALLBACK_DEPARTMENTS } from './ui.jsx';

// Real photo from /public/images if present; otherwise a quiet topographic texture.
function Photo({ name, className = '' }) {
  const [ok, setOk] = useState(true);
  return <div className={'photo ' + className}>{ok ? <img src={`/images/${name}.jpg`} alt="" onError={() => setOk(false)} /> : null}<i className="contour" /></div>;
}

function Preloader({ onDone }) {
  const [n, setN] = useState(0), [out, setOut] = useState(false);
  useEffect(() => {
    const t0 = performance.now(); let raf;
    const f = t => { const p = Math.min((t - t0) / 1900, 1); setN(Math.round(p * 100)); if (p < 1) raf = requestAnimationFrame(f); else { setOut(true); setTimeout(onDone, 900); } };
    raf = requestAnimationFrame(f); return () => cancelAnimationFrame(raf);
  }, []);
  return <div className={'pre' + (out ? ' out' : '')}><i className="curtain l" /><i className="curtain r" />
    <div className="preMid"><small>Public Grievance Portal · Kerala</small><h1 lang="ml">പരാതി</h1><p>Say it. We will route it.</p><div className="preBar"><b style={{ width: n + '%' }} /></div><span>{String(n).padStart(3, '0')}</span></div></div>;
}

function Lines({ lines, go }) {
  return <h1 className="mega">{lines.map((l, i) => <span className="mask" key={i}><span style={{ '--d': go ? i * 0.12 + 's' : '9s' }}>{l}</span></span>)}</h1>;
}

function HScroll({ steps }) {
  const box = useRef(null), track = useRef(null);
  useEffect(() => {
    const on = () => { const b = box.current.getBoundingClientRect(), max = track.current.scrollWidth - innerWidth, p = Math.min(Math.max(-b.top / (b.height - innerHeight), 0), 1); track.current.style.transform = `translate3d(${-p * max}px,0,0)`; box.current.style.setProperty('--p', p); };
    on(); addEventListener('scroll', on, { passive: true }); addEventListener('resize', on); return () => { removeEventListener('scroll', on); removeEventListener('resize', on); };
  }, []);
  return <section className="hs" ref={box} id="journey"><div className="hsStick"><div className="hsHead"><h2>One complaint.<br />Five accountable hands.</h2><div className="hsBar"><b /></div></div>
    <div className="hsTrack" ref={track}>{steps.map(([t, d], i) => <article className="hsCard" key={t}><span className="hsNum">{i + 1}</span><h3>{t}</h3><p>{d}</p></article>)}</div></div></section>;
}

export default function CinematicHome({ go, user, departments, district, setDistrict }) {
  const [ready, setReady] = useState(!!sessionStorage.getItem('cm_seen'));
  const [prog, setProg] = useState(0), cur = useRef(null);
  const depts = (departments?.length ? departments : FALLBACK_DEPARTMENTS);
  const sel = district && DISTRICTS.includes(district) ? DISTRICT_INFO[district] : null;
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.085 }); let raf; const loop = t => { lenis.raf(t); raf = requestAnimationFrame(loop); }; raf = requestAnimationFrame(loop);
    const sc = () => setProg(scrollY / (document.documentElement.scrollHeight - innerHeight));
    const mv = e => { if (cur.current) cur.current.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5; document.documentElement.style.setProperty('--mx', x); document.documentElement.style.setProperty('--my', y); };
    addEventListener('scroll', sc, { passive: true }); addEventListener('pointermove', mv);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); removeEventListener('scroll', sc); removeEventListener('pointermove', mv); };
  }, []);
  return <div className="cine">
    {!ready && <Preloader onDone={() => { sessionStorage.setItem('cm_seen', '1'); setReady(true); }} />}
    <div className="scrollBar"><b style={{ transform: `scaleX(${prog})` }} /></div><div className="cursorDot" ref={cur} />
    <section className="cHero"><div className="cHeroBg" style={{ transform: 'translate3d(calc(var(--mx,0)*-26px),calc(var(--my,0)*-18px),0) scale(1.08)' }}><Photo name="hero" className="kb" /></div><div className="cShade" />
      <div className="cLeader"><img src="/images/leader.jpg" alt="Portrait for the demonstration portal" /></div><div className="cHeroIn"><small className="cTag">Kerala · Public grievance redressal · Recruitment prototype</small>
        <Lines go={ready} lines={['EVERY VOICE.', 'EVERY DISTRICT.', 'ONE TRAIL.']} />
        <p className="cLead">Raise a concern, watch it travel from the Chief Minister's Office to the right department, and see the outcome on record.</p>
        <div className="cBtns"><button className="cBtn gold" onClick={() => go(user ? 'submit' : 'register')}>Submit a grievance <ArrowRight size={18} /></button><button className="cBtn ghost" onClick={() => go('track')}><Search size={17} /> Track a grievance</button></div></div>
      <div className="cDisc">Demonstration only. Not an official Government of Kerala or Chief Minister's Office service, and not endorsed by either.</div><div className="cScroll"><ArrowDown size={16} /> Scroll</div></section>
    <section className="cSec atlas" id="atlas"><Photo name="forest" className="dim" /><div className="atlasHead"><span className="secNo">03</span><h2>FOURTEEN DISTRICTS.<br />ONE LIVE ATLAS.</h2><p>Explore Kerala by district. Select a boundary or search the district directory to read a short geographic profile.</p></div>
      <div className="atlasGrid"><div className="atlasStage"><KeralaScene selected={district} onSelect={setDistrict} /></div>
        <aside className="atlasPanel"><small>District profile</small><h3>{district || 'Explore Kerala'}</h3>{sel ? <><span className="districtRegion">{sel.region}</span><p className="districtDescription">{sel.description}</p><button className="cBtn gold" onClick={() => go(user ? 'submit' : 'register')}>Raise a concern in {district} <ArrowRight size={16} /></button></> : <p>Select any district on the satellite map or use the district directory to explore its geographic profile.</p>}<em>No grievance statistics are displayed here. Case figures are shown only in authenticated dashboards using stored application records.</em></aside></div></section>
    <HScroll steps={[['Citizen files', 'Describe the issue, pick a district, attach a photo. A unique reference ID is issued at once.'], ['CMO reviews', 'The AI suggests category, department and priority. An administrator confirms or changes it.'], ['Department acts', 'The assigned officer investigates, updates the status and records remarks with a timestamp.'], ['Report returns', 'The action-taken report goes back to the CMO for review before anything is closed.'], ['Citizen decides', 'Resolved or reopened. Feedback is recorded against the officer and department.']]} />
    <section className="cSec depts"><Photo name="backwater" className="dim" /><div className="deptHead"><span className="secNo">05</span><h2>WHO ANSWERS<br />YOUR COMPLAINT</h2></div>
      <div className="deptPhotoGrid">{depts.slice(0, 6).map((d, i) => {
        const name = String(d.name || '').toLowerCase();
        const photo = name.includes('public works') || name.includes('road') ? 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=85'
          : name.includes('health') ? 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=85'
          : name.includes('education') ? 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=85'
          : name.includes('local self') || name.includes('government') || name.includes('municipal') ? 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=85'
          : name.includes('water') ? 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=85'
          : name.includes('power') || name.includes('electric') ? 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=85'
          : ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=85','https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=85','https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=85','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=85','https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=85','https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=85'][i];
        return <button type="button" className="deptPhotoCard" key={d.id || i} onClick={() => go(user ? 'submit' : 'register')} aria-label={`Submit a grievance about ${d.name}`}>
          <span className="deptPhotoMedia"><img src={photo} alt={d.name} loading="lazy" /><span className="deptPhotoNumber">0{i + 1}</span><span className="deptPhotoArrow"><ArrowRight size={20} /></span></span>
          <span className="deptPhotoCopy"><span className="deptPhotoEyebrow">PUBLIC SERVICE</span><strong>{d.name}</strong><span className="deptPhotoDescription">{d.description}</span></span>
        </button>;
      })}</div>
</section>
    <section className="cEnd"><Photo name="end" className="kb" /><div className="cShade" /><div className="cEndIn"><h2>READY TO<br />BE HEARD?</h2><button className="cBtn gold big" onClick={() => go(user ? 'submit' : 'register')}>Start your grievance <ArrowRight /></button><small>Recruitment prototype. Not an official Government of Kerala service.</small></div></section>
  </div>;
}
