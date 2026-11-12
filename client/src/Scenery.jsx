import React from 'react';

const Palm = ({ x, y, s = 1, lean = 1, c = '#0f3d2e' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M0 0 Q${6 * lean} -40 ${14 * lean} -78`} stroke={c} strokeWidth="4" fill="none" strokeLinecap="round" />
    <g transform={`translate(${14 * lean} -78)`} fill={c}>
      {[-165, -130, -95, -55, -15, 20, 195, 160].map(a => <path key={a} transform={`rotate(${a})`} d="M0 0 Q20 -14 44 -2 Q20 -6 0 0Z" />)}
    </g>
  </g>
);

const Svg = ({ children }) => <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">{children}</svg>;
const Grad = ({ id, stops, v = true }) => <linearGradient id={id} x1="0" y1="0" x2={v ? 0 : 1} y2={v ? 1 : 0}>{stops.map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}</linearGradient>;

// Munnar tea terraces (Idukki)
export const Munnar = () => (
  <Svg>
    <defs>
      <Grad id="mnSky" stops={[[0, '#12485a'], [0.55, '#e7b98a'], [1, '#f6e1b8']]} />
      <pattern id="mnTea" width="9" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)"><rect width="9" height="6" fill="#2f7d4a" /><path d="M0 3h9" stroke="#1d5a37" strokeWidth="1.5" /></pattern>
    </defs>
    <rect width="400" height="300" fill="url(#mnSky)" />
    <circle cx="298" cy="118" r="34" fill="#fff3d0" opacity=".92" />
    <path d="M0 150 Q70 98 140 140 T270 118 T400 150 V300 H0Z" fill="#5d8f88" opacity=".65" />
    <path d="M0 182 Q90 130 180 176 T400 160 V300 H0Z" fill="url(#mnTea)" />
    <ellipse cx="200" cy="176" rx="280" ry="16" fill="#fff" opacity=".22" />
    <path d="M0 218 Q110 172 220 212 T400 202 V300 H0Z" fill="url(#mnTea)" />
    <path d="M0 254 Q130 218 250 247 T400 242 V300 H0Z" fill="#1d5a37" />
  </Svg>
);

// Alleppey backwaters (Alappuzha)
export const Backwater = () => (
  <Svg>
    <defs>
      <Grad id="bwSky" stops={[[0, '#2f2458'], [0.5, '#e8744a'], [1, '#ffd28a']]} />
      <Grad id="bwWater" stops={[[0, '#1d5a60'], [1, '#08262c']]} />
    </defs>
    <rect width="400" height="300" fill="url(#bwSky)" />
    <circle cx="200" cy="150" r="42" fill="#ffe9ae" />
    <rect y="170" width="400" height="130" fill="url(#bwWater)" />
    {[0, 1, 2, 3, 4].map(i => <rect key={i} x={170 - i * 6} y={176 + i * 9} width={60 + i * 12} height="2.5" rx="1.2" fill="#ffd28a" opacity={0.7 - i * 0.12} />)}
    <path d="M0 172 Q60 160 120 170 T250 168 T400 170 V176 H0Z" fill="#0f3d2e" />
    <Palm x={40} y={176} s={1.3} c="#0a2a22" /><Palm x={355} y={176} s={1.5} lean={-1} c="#0a2a22" /><Palm x={330} y={176} s={1} c="#0a2a22" />
    <path d="M108 206 Q200 226 292 206 L282 192 H118Z" fill="#2b1a12" />
    <path d="M128 192 Q128 160 200 158 Q272 160 272 192Z" fill="#9a6a32" />
    {[150, 170, 190, 210, 230, 250].map(x => <path key={x} d={`M${x} 190 Q${x + 2} 168 ${x + 4} 160`} stroke="#6b4420" strokeWidth="1.6" fill="none" />)}
    <rect x="146" y="176" width="108" height="14" fill="#c79a3b" opacity=".85" />
    <path d="M60 232 Q200 246 340 232" stroke="#ffd28a" strokeWidth="1.4" fill="none" opacity=".4" /><path d="M90 252 Q200 262 310 252" stroke="#ffd28a" strokeWidth="1.2" fill="none" opacity=".3" />
  </Svg>
);

// Chinese fishing nets, Fort Kochi (Ernakulam)
export const Kochi = () => (
  <Svg>
    <defs><Grad id="kcSky" stops={[[0, '#1a1f4a'], [0.55, '#c2506a'], [1, '#f7a45a']]} /><Grad id="kcWater" stops={[[0, '#5a2a52'], [1, '#150f2a']]} /></defs>
    <rect width="400" height="300" fill="url(#kcSky)" />
    <circle cx="280" cy="176" r="30" fill="#ffd7a0" />
    <rect y="182" width="400" height="118" fill="url(#kcWater)" />
    <rect x="248" y="188" width="64" height="3" rx="1.5" fill="#ffd7a0" opacity=".6" /><rect x="258" y="198" width="44" height="3" rx="1.5" fill="#ffd7a0" opacity=".4" />
    <g stroke="#150a1c" fill="none" strokeLinecap="round">
      <path d="M150 238 L206 92" strokeWidth="6" /><path d="M206 92 L92 172" strokeWidth="4" /><path d="M176 170 L128 200" strokeWidth="3" />
      <path d="M92 172 L52 226 H134Z" strokeWidth="1.2" />
      {[72, 92, 112].map(x => <path key={x} d={`M92 172 L${x - 10} 226`} strokeWidth=".8" />)}
      {[188, 204, 218].map(y => <path key={y} d={`M${92 - (y - 172) * 0.74} ${y} H${92 + (y - 172) * 0.74}`} strokeWidth=".8" />)}
    </g>
    <path d="M300 182 Q340 150 400 168 V190 H300Z" fill="#150a1c" opacity=".9" /><Palm x={360} y={186} s={1.1} c="#150a1c" />
  </Svg>
);

// Vizhinjam / Kovalam lighthouse (Thiruvananthapuram)
export const Lighthouse = () => (
  <Svg>
    <defs>
      <Grad id="lhSky" stops={[[0, '#050d2a'], [1, '#27508a']]} />
      <linearGradient id="lhBeam" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="#ffe6a0" stopOpacity=".7" /><stop offset="1" stopColor="#ffe6a0" stopOpacity="0" /></linearGradient>
    </defs>
    <rect width="400" height="300" fill="url(#lhSky)" />
    {[[40, 40], [90, 90], [150, 30], [330, 50], [370, 100], [300, 20], [20, 120], [200, 60]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 3 ? 1 : 1.6} fill="#fff" opacity=".8" />)}
    <path d="M254 102 L0 52 V152Z" fill="url(#lhBeam)" />
    <path d="M238 232 L244 112 H256 L262 232Z" fill="#f4efe4" />
    <path d="M241 190 L242.5 160 H257.5 L259 190Z" fill="#b53a2a" /><path d="M243.4 140 L244 126 H256 L256.6 140Z" fill="#b53a2a" />
    <rect x="243" y="100" width="14" height="12" fill="#ffe08a" /><path d="M241 100 L250 88 L259 100Z" fill="#b53a2a" />
    <path d="M190 236 Q215 214 250 222 Q290 210 320 236 V260 H190Z" fill="#14202c" />
    <rect y="236" width="400" height="64" fill="#0b2347" opacity=".92" />
    {[246, 258, 272, 286].map((y, i) => <path key={y} d={`M0 ${y} Q50 ${y - 7} 100 ${y} T200 ${y} T300 ${y} T400 ${y}`} stroke="#9ec5e8" strokeWidth="1.3" fill="none" opacity={0.5 - i * 0.08} />)}
  </Svg>
);

export const HeroSilhouette = () => (
  <svg className="heroSil" viewBox="0 0 1440 220" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <path d="M0 220V140 Q180 82 360 130 T720 112 T1080 136 T1440 100V220Z" fill="#06383a" opacity=".75" />
    <path d="M0 220V172 Q240 122 480 166 T960 150 T1440 162V220Z" fill="#041f21" />
    {[60, 180, 330, 520, 760, 980, 1180, 1330].map((x, i) => <Palm key={x} x={x} y={176 + (i % 3) * 8} s={1.1 + (i % 3) * 0.25} lean={i % 2 ? 1 : -1} c="#041f21" />)}
  </svg>
);
