import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const DISTRICTS = ['Kasaragod','Kannur','Wayanad','Kozhikode','Malappuram','Palakkad','Thrissur','Ernakulam','Idukki','Kottayam','Alappuzha','Pathanamthitta','Kollam','Thiruvananthapuram'];

// Geographic descriptions used by the district profile panel in Cinematic.jsx.
export const DISTRICT_INFO = {
  Kasaragod: { region: 'Northern Kerala', description: "Kerala's northernmost district, known for its coastline and historic Bekal Fort." },
  Kannur: { region: 'Northern Kerala', description: 'A northern coastal district known for its Theyyam tradition and historic forts.' },
  Wayanad: { region: 'Western Ghats', description: 'An eastern highland district characterised by forested hills, valleys and plantations.' },
  Kozhikode: { region: 'Malabar Coast', description: 'A historic coastal district associated with maritime trade and beaches.' },
  Malappuram: { region: 'Northern Kerala', description: 'A district of hills, river valleys and settled plains.' },
  Palakkad: { region: 'Central Kerala', description: 'An inland district shaped by the Palakkad Gap, a natural passage through the Western Ghats.' },
  Thrissur: { region: 'Central Kerala', description: 'A central Kerala district known for its cultural institutions and Thrissur Pooram.' },
  Ernakulam: { region: 'Central Kerala', description: 'A coastal and urban district that includes Kochi, a major port and commercial centre.' },
  Idukki: { region: 'High Ranges', description: 'A mountainous district in the Western Ghats with forests and major reservoirs.' },
  Kottayam: { region: 'Central Travancore', description: 'An inland district between the high ranges and the Vembanad lake region.' },
  Alappuzha: { region: 'Coastal Kerala', description: 'A low-lying coastal district known for backwaters, canals and Kuttanad.' },
  Pathanamthitta: { region: 'Southern Kerala', description: 'An eastern district of forested highlands and river valleys, including the Sabarimala region.' },
  Kollam: { region: 'Southern Kerala', description: 'A southern coastal district known for its maritime history and Ashtamudi Lake.' },
  Thiruvananthapuram: { region: 'Southern Kerala', description: "Kerala's southernmost district and home to the state capital." }
};


// Local copy first (drop kerala-districts.geojson into client/public for offline-proof demos), then CDNs.
const SOURCES = [
  '/kerala-districts.geojson',
  'https://cdn.jsdelivr.net/gh/geohacker/kerala@master/geojsons/district.geojson',
  'https://raw.githubusercontent.com/geohacker/kerala/master/geojsons/district.geojson'
];
const nameOf = p => String(p?.district || p?.DISTRICT || p?.dtname || p?.DTNAME || p?.district_name || p?.DISTRICT_N || p?.DIST_NAME || p?.name || p?.NAME_2 || p?.NAME_3 || '');
const canon = n => DISTRICTS.find(d => d.toLowerCase() === n.toLowerCase());

async function loadGeo() {
  for (const url of SOURCES) {
    try {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 6000);
      const r = await fetch(url, { signal: ctl.signal }); clearTimeout(t);
      if (!r.ok) continue;
      const geo = await r.json();
      const features = (geo.features || []).filter(f => canon(nameOf(f.properties)));
      if (features.length >= 10) return features;
    } catch { /* try next source */ }
  }
  return null;
}

// Stylised fallback: 14 district columns on Kerala's north-west to south-east spine.
function fallbackFeatures() {
  return DISTRICTS.map((d, i) => {
    const t = i / 13, lat = 12.5 - t * 4.1, lon = 75.2 + t * 1.7;
    const w = 0.22, h = 0.17;
    return { properties: { district: d }, geometry: { type: 'Polygon', coordinates: [[[lon - w, lat - h], [lon + w, lat - h], [lon + w, lat + h], [lon - w, lat + h], [lon - w, lat - h]]] } };
  });
}

export default function KeralaScene({ selected, onSelect, weights = {} }) {
  const host = useRef(null);
  const api = useRef({});
  const [state, setState] = useState('loading');
  const [hover, setHover] = useState('');
  const selRef = useRef(selected);
  selRef.current = selected;

  useEffect(() => {
    let disposed = false, frame, renderer, ro, off = () => {};
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    (async () => {
      let features = await loadGeo(); let real = true;
      if (!features) { features = fallbackFeatures(); real = false; }
      if (disposed || !host.current) return;
      setState(real ? 'ready' : 'fallback');

      const coords = features.flatMap(f => { const g = f.geometry; const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates; return polys.flat(2); });
      const xs = coords.map(c => c[0]), ys = coords.map(c => c[1]);
      const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
      const k = 100, cosL = Math.cos(((minY + maxY) / 2) * Math.PI / 180);
      const proj = ([lo, la]) => [(lo - (minX + maxX) / 2) * cosL * k, (la - (minY + maxY) / 2) * k];

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x072a2c, 0.0009);
      const camera = new THREE.PerspectiveCamera(32, 1, 1, 4000);
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      host.current.innerHTML = ''; host.current.appendChild(renderer.domElement);
      const canvas = renderer.domElement;

      scene.add(new THREE.HemisphereLight(0xcfeede, 0x0a2f31, 1.15));
      const sun = new THREE.DirectionalLight(0xffe6b0, 2.4); sun.position.set(-160, -120, 260); sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -300, right: 300, top: 300, bottom: -300, far: 900 }); scene.add(sun);
      const rim = new THREE.PointLight(0xc79a3b, 2.2, 700); rim.position.set(160, 120, 90); scene.add(rim);

      const group = new THREE.Group(); scene.add(group);
      const items = [];
      const maxW = Math.max(1, ...Object.values(weights));
      const base = new THREE.Color('#1f6b55'), hi = new THREE.Color('#58c28a'), gold = new THREE.Color('#e0b050');

      features.forEach(f => {
        const name = canon(nameOf(f.properties)) || nameOf(f.properties);
        const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
        const w = (weights[name] ?? 0.4) / maxW;
        const depth = 5 + w * 9;
        polys.forEach(poly => {
          if (!poly?.[0]) return;
          const shape = new THREE.Shape();
          poly[0].forEach((c, i) => { const [x, y] = proj(c); i ? shape.lineTo(x, y) : shape.moveTo(x, y); });
          for (let i = 1; i < poly.length; i++) { const h = new THREE.Path(); poly[i].forEach((c, j) => { const [x, y] = proj(c); j ? h.lineTo(x, y) : h.moveTo(x, y); }); shape.holes.push(h); }
          const geom = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: 0.7, bevelThickness: 0.7, bevelSegments: 1, curveSegments: real ? 2 : 1 });
          const mat = new THREE.MeshStandardMaterial({ color: base.clone().lerp(hi, w * 0.55), roughness: 0.62, metalness: 0.12 });
          const mesh = new THREE.Mesh(geom, mat); mesh.castShadow = mesh.receiveShadow = true;
          const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geom, 35), new THREE.LineBasicMaterial({ color: 0xe0b050, transparent: true, opacity: 0.55 }));
          mesh.add(edges);
          mesh.position.z = -60; mesh.scale.z = 0.01; // rises in on load
          mesh.userData = { name, baseColor: mat.color.clone(), lift: 0, target: 0, delay: Math.random() * 0.5 };
          group.add(mesh); items.push(mesh);
        });
      });
      api.current.items = items;

      // backwater floor + drifting monsoon rain
      const floor = new THREE.Mesh(new THREE.CircleGeometry(520, 64), new THREE.MeshStandardMaterial({ color: 0x0a3b3a, roughness: 0.4, metalness: 0.3 }));
      floor.position.z = -4; floor.receiveShadow = true; group.add(floor);
      const grid = new THREE.GridHelper(900, 36, 0x2c8a74, 0x14504a); grid.rotation.x = Math.PI / 2; grid.position.z = -3.5; grid.material.transparent = true; grid.material.opacity = 0.35; group.add(grid);
      const N = 420, pos = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 520; pos[i * 3 + 1] = (Math.random() - 0.5) * 520; pos[i * 3 + 2] = Math.random() * 260; }
      const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const rain = new THREE.Points(rg, new THREE.PointsMaterial({ color: 0xbfe6d4, size: 1.6, transparent: true, opacity: 0.55, depthWrite: false }));
      group.add(rain);

      group.rotation.x = -0.95; group.rotation.z = -0.1;
      camera.position.set(0, 20, 560); camera.lookAt(0, 0, 0);

      const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
      let drag = false, moved = false, lx = 0, ly = 0, hovered = null, tiltX = 0, tiltY = 0, zoom = 1, spin = 0, t0 = performance.now();

      const hit = e => { const r = canvas.getBoundingClientRect(); ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ptr, camera); return ray.intersectObjects(items)[0]?.object || null; };
      const down = e => { drag = true; moved = false; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); };
      const move = e => {
        if (drag) { const dx = e.clientX - lx, dy = e.clientY - ly; if (Math.abs(dx) + Math.abs(dy) > 3) moved = true; spin += dx * 0.005; group.rotation.x = THREE.MathUtils.clamp(group.rotation.x + dy * 0.004, -1.35, -0.35); lx = e.clientX; ly = e.clientY; return; }
        const h = hit(e); if (h !== hovered) { hovered = h; setHover(h?.userData.name || ''); canvas.style.cursor = h ? 'pointer' : 'grab'; }
        const r = canvas.getBoundingClientRect(); tiltX = ((e.clientX - r.left) / r.width - 0.5); tiltY = ((e.clientY - r.top) / r.height - 0.5);
      };
      const up = e => { if (drag) { drag = false; if (!moved) { const h = hit(e); if (h) onSelect(h.userData.name); } } };
      const leave = () => { hovered = null; setHover(''); };
      const wheel = e => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); zoom = THREE.MathUtils.clamp(zoom * (e.deltaY > 0 ? 0.95 : 1.05), 0.7, 2); };
      canvas.style.cursor = 'grab'; canvas.style.touchAction = 'pan-y';
      canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerup', up); canvas.addEventListener('pointerleave', leave); canvas.addEventListener('wheel', wheel, { passive: false });

      const resize = () => { const w = host.current.clientWidth || 600, h = host.current.clientHeight || 520; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); camera.position.z = (w < 520 ? 740 : 620) / zoom; };
      ro = new ResizeObserver(resize); ro.observe(host.current); resize();

      const tick = () => {
        frame = requestAnimationFrame(tick);
        const t = (performance.now() - t0) / 1000;
        if (!drag && !reduce) spin += 0.0011;
        group.rotation.z += ((-0.1 + Math.sin(spin) * 0.28 + tiltX * 0.18) - group.rotation.z) * 0.06;
        camera.position.z += (((host.current?.clientWidth < 520 ? 740 : 620) / zoom) - camera.position.z) * 0.08;
        const sel = selRef.current;
        items.forEach(m => {
          const u = m.userData, on = u.name === sel, hv = hovered && u.name === hovered.userData.name;
          const rise = reduce ? 1 : THREE.MathUtils.clamp((t - u.delay - 0.2) / 1.1, 0, 1), eased = 1 - Math.pow(1 - rise, 3);
          u.target = on ? 14 : hv ? 8 : 0; u.lift += (u.target - u.lift) * 0.14;
          m.scale.z = Math.max(0.01, eased); m.position.z = -60 * (1 - eased) + u.lift;
          m.material.color.lerp(on ? gold : hv ? hi : u.baseColor, 0.16);
          m.material.emissive.setRGB(on ? 0.2 : hv ? 0.07 : 0, on ? 0.13 : hv ? 0.1 : 0, 0);
        });
        if (!reduce) { const p = rg.attributes.position; for (let i = 0; i < N; i++) { let z = p.getZ(i) - 0.9; if (z < 0) z = 260; p.setZ(i, z); } p.needsUpdate = true; }
        rim.intensity = 2 + Math.sin(t * 1.2) * 0.4;
        renderer.render(scene, camera);
      };
      tick();

      off = () => {
        cancelAnimationFrame(frame); ro?.disconnect();
        canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointerleave', leave); canvas.removeEventListener('wheel', wheel);
        scene.traverse(o => { o.geometry?.dispose?.(); const m = o.material; Array.isArray(m) ? m.forEach(x => x.dispose()) : m?.dispose?.(); });
        renderer.dispose();
      };
    })().catch(() => !disposed && setState('error'));

    return () => { disposed = true; off(); };
  }, []);

  return (
    <div className="scene">
      <div ref={host} className="sceneCanvas" role="img" aria-label="Interactive 3D map of Kerala's 14 districts" />
      {state === 'loading' && <div className="sceneNote">Raising the districts…</div>}
      {state === 'fallback' && <div className="sceneNote soft">Boundary data unavailable offline, showing the district tower view.</div>}
      {state === 'error' && <div className="sceneNote">3D view is not supported on this device. Choose a district below.</div>}
      {hover && <div className="sceneTag">{hover}</div>}
    </div>
  );
}
