import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

interface Finding {
  id: string;
  issue: string;
  severity: 'mild' | 'moderate' | 'severe';
  toothNumbers?: number[];
}

interface DentalViewer3DProps {
  findings?: Finding[];
  aesthetics?: { gumHealth?: number; [k: string]: number | undefined };
  overallScore?: number;
}

// ══════════════════════════════════════════
// Superellipse cross-section point
// n=2 → ellipse, n>2 → rounded rectangle
// ══════════════════════════════════════════
function superEllipsePoint(theta: number, rx: number, rz: number, n: number) {
  const ct = Math.cos(theta), st = Math.sin(theta);
  const x = rx * Math.sign(ct) * Math.pow(Math.abs(ct), 2 / n);
  const z = rz * Math.sign(st) * Math.pow(Math.abs(st), 2 / n);
  return { x, z };
}

// ══════════════════════════════════════════
// Height section profiles per tooth type
// t: 0=root tip → 1=crown top
// ══════════════════════════════════════════
type Section = { t: number; rx: number; rz: number; n: number };

// Scale factors: width vs height separate so teeth aren't elongated sticks
const SW = 5.0;  // width scale (radii)
const SH = 1.8;  // height scale (much less than width = wider, shorter teeth)

const PROFILES: Record<string, Section[]> = {
  incisor: [
    { t: 0, rx: 0.010*SW, rz: 0.010*SW, n: 2 },
    { t: 0.15, rx: 0.020*SW, rz: 0.016*SW, n: 2 },
    { t: 0.35, rx: 0.032*SW, rz: 0.025*SW, n: 2.1 },
    { t: 0.44, rx: 0.036*SW, rz: 0.030*SW, n: 2.2 },
    { t: 0.48, rx: 0.034*SW, rz: 0.028*SW, n: 2.3 },
    { t: 0.58, rx: 0.042*SW, rz: 0.020*SW, n: 2.6 },
    { t: 0.72, rx: 0.048*SW, rz: 0.018*SW, n: 3.0 },
    { t: 0.88, rx: 0.046*SW, rz: 0.014*SW, n: 3.2 },
    { t: 0.96, rx: 0.042*SW, rz: 0.010*SW, n: 3.5 },
    { t: 1, rx: 0.038*SW, rz: 0.006*SW, n: 4.0 },
  ],
  canine: [
    { t: 0, rx: 0.012*SW, rz: 0.012*SW, n: 2 },
    { t: 0.15, rx: 0.022*SW, rz: 0.020*SW, n: 2 },
    { t: 0.30, rx: 0.032*SW, rz: 0.028*SW, n: 2.1 },
    { t: 0.42, rx: 0.040*SW, rz: 0.035*SW, n: 2.2 },
    { t: 0.47, rx: 0.038*SW, rz: 0.032*SW, n: 2.3 },
    { t: 0.57, rx: 0.046*SW, rz: 0.028*SW, n: 2.4 },
    { t: 0.72, rx: 0.048*SW, rz: 0.025*SW, n: 2.6 },
    { t: 0.84, rx: 0.038*SW, rz: 0.020*SW, n: 2.8 },
    { t: 0.94, rx: 0.022*SW, rz: 0.014*SW, n: 3.0 },
    { t: 1, rx: 0.004*SW, rz: 0.004*SW, n: 2 },
  ],
  premolar: [
    { t: 0, rx: 0.012*SW, rz: 0.012*SW, n: 2 },
    { t: 0.14, rx: 0.024*SW, rz: 0.020*SW, n: 2 },
    { t: 0.30, rx: 0.034*SW, rz: 0.030*SW, n: 2.2 },
    { t: 0.42, rx: 0.040*SW, rz: 0.038*SW, n: 2.4 },
    { t: 0.47, rx: 0.038*SW, rz: 0.036*SW, n: 2.5 },
    { t: 0.57, rx: 0.046*SW, rz: 0.042*SW, n: 2.6 },
    { t: 0.72, rx: 0.048*SW, rz: 0.044*SW, n: 2.8 },
    { t: 0.85, rx: 0.046*SW, rz: 0.042*SW, n: 3.0 },
    { t: 0.95, rx: 0.042*SW, rz: 0.038*SW, n: 3.2 },
    { t: 1, rx: 0.038*SW, rz: 0.034*SW, n: 3.2 },
  ],
  molar: [
    { t: 0, rx: 0.016*SW, rz: 0.016*SW, n: 2 },
    { t: 0.12, rx: 0.032*SW, rz: 0.028*SW, n: 2.1 },
    { t: 0.28, rx: 0.048*SW, rz: 0.042*SW, n: 2.3 },
    { t: 0.40, rx: 0.058*SW, rz: 0.054*SW, n: 2.6 },
    { t: 0.45, rx: 0.055*SW, rz: 0.050*SW, n: 2.7 },
    { t: 0.55, rx: 0.064*SW, rz: 0.058*SW, n: 2.9 },
    { t: 0.70, rx: 0.066*SW, rz: 0.060*SW, n: 3.2 },
    { t: 0.82, rx: 0.064*SW, rz: 0.058*SW, n: 3.3 },
    { t: 0.93, rx: 0.058*SW, rz: 0.054*SW, n: 3.4 },
    { t: 1, rx: 0.052*SW, rz: 0.048*SW, n: 3.5 },
  ],
};

function getToothType(num: number): string {
  const n = num <= 16 ? num : 33 - num;
  if (n === 8 || n === 9 || n === 7 || n === 10) return 'incisor';
  if (n === 6 || n === 11) return 'canine';
  if (n === 5 || n === 12 || n === 4 || n === 13) return 'premolar';
  return 'molar';
}

function getToothLabel(num: number): string {
  const n = num <= 16 ? num : 33 - num;
  if (n === 8 || n === 9) return 'Central Incisor';
  if (n === 7 || n === 10) return 'Lateral Incisor';
  if (n === 6 || n === 11) return 'Canine';
  if (n === 5 || n === 12) return '1st Premolar';
  if (n === 4 || n === 13) return '2nd Premolar';
  if (n === 3 || n === 14) return '1st Molar';
  if (n === 2 || n === 15) return '2nd Molar';
  return '3rd Molar';
}

// ══════════════════════════════════════════
// Interpolate profile sections at any t
// ══════════════════════════════════════════
function interpolateSection(sections: Section[], t: number): { rx: number; rz: number; n: number } {
  if (t <= 0) return sections[0];
  if (t >= 1) return sections[sections.length - 1];
  let i = 0;
  while (i < sections.length - 1 && sections[i + 1].t < t) i++;
  const a = sections[i], b = sections[i + 1];
  const f = (t - a.t) / (b.t - a.t);
  const sf = f * f * (3 - 2 * f); // smoothstep
  return {
    rx: a.rx + (b.rx - a.rx) * sf,
    rz: a.rz + (b.rz - a.rz) * sf,
    n: a.n + (b.n - a.n) * sf,
  };
}

// ══════════════════════════════════════════
// Occlusal cusp elevation for molars/premolars
// ══════════════════════════════════════════
function cuspElevation(type: string, theta: number, t: number): number {
  if (t < 0.82) return 0;
  const factor = (t - 0.82) / 0.18;
  if (type === 'molar') {
    const cusp = Math.max(0, Math.cos(theta * 2)) * 0.036 + Math.max(0, Math.cos(theta * 2 + Math.PI * 0.5)) * 0.024;
    const fissure = -(1 - Math.abs(Math.cos(theta * 2))) * 0.018;
    return (cusp + fissure) * factor;
  }
  if (type === 'premolar') {
    return Math.max(0, Math.cos(theta)) * 0.030 * factor;
  }
  return 0;
}

// ══════════════════════════════════════════
// Anatomical labial/lingual perturbation
// ══════════════════════════════════════════
function anatomicalPerturb(type: string, theta: number, t: number): number {
  if (type === 'incisor' && t > 0.48) {
    const crown = Math.min(1, (t - 0.48) * 3);
    return Math.cos(theta) * 0.015 * crown;
  }
  if (type === 'canine' && t > 0.5 && t < 0.9) {
    return Math.cos(theta) * 0.018 * Math.sin((t - 0.5) * Math.PI / 0.4);
  }
  return 0;
}

// ══════════════════════════════════════════
// Enamel color at different heights
// ══════════════════════════════════════════
function enamelColor(t: number): THREE.Color {
  if (t < 0.40) return new THREE.Color(0.85, 0.78, 0.62); // root: dark yellowish
  if (t < 0.50) {
    const f = (t - 0.40) / 0.10;
    return new THREE.Color(0.85 + f * 0.1, 0.78 + f * 0.12, 0.62 + f * 0.22); // transition
  }
  // Crown: natural ivory with slight variation
  const warmth = Math.sin(t * Math.PI) * 0.03;
  return new THREE.Color(0.95 + warmth, 0.92 + warmth * 0.5, 0.86 - warmth);
}

// ══════════════════════════════════════════
// GENERATE TOOTH BUFFERGEOMETRY
// ══════════════════════════════════════════
function createToothGeometry(type: string, seed: number): THREE.BufferGeometry {
  const segs = 28;
  const hSteps = 30;
  const sections = PROFILES[type] || PROFILES.incisor;
  const totalH = (type === 'molar' ? 0.28 : type === 'premolar' ? 0.32 : type === 'canine' ? 0.42 : 0.38) * SH;

  const positions: number[] = [];
  const vertColors: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let hi = 0; hi <= hSteps; hi++) {
    const t = hi / hSteps;
    const { rx, rz, n } = interpolateSection(sections, t);
    const y = (t - 0.45) * totalH; // center at cervical line

    for (let si = 0; si <= segs; si++) {
      const theta = (si / segs) * Math.PI * 2;
      const { x, z } = superEllipsePoint(theta, rx, rz, n);

      // Anatomical perturbation
      const radialPerturb = anatomicalPerturb(type, theta, t);
      const px = x + Math.cos(theta) * radialPerturb;
      const pz = z + Math.sin(theta) * radialPerturb;

      // Cusp elevation
      const yOffset = cuspElevation(type, theta, t);

      // Subtle organic noise
      const noise = (Math.sin(theta * 5.7 + seed) * 0.003 + Math.cos(theta * 9.3 + t * 7 + seed) * 0.002) * (t > 0.4 ? 1 : 0.3);

      positions.push(px + noise, y + yOffset, pz + noise);

      // Vertex color
      const col = enamelColor(t);
      // Slight per-tooth color variation
      const tint = Math.sin(seed) * 0.02;
      vertColors.push(col.r + tint, col.g + tint * 0.5, col.b - tint);

      uvs.push(si / segs, t);
    }
  }

  // Triangulate
  for (let hi = 0; hi < hSteps; hi++) {
    for (let si = 0; si < segs; si++) {
      const a = hi * (segs + 1) + si;
      const b = a + (segs + 1);
      indices.push(a, b, a + 1);
      indices.push(b, b + 1, a + 1);
    }
  }

  // Cap the top
  const topCenter = positions.length / 3;
  const lastT = 1;
  const topCol = enamelColor(lastT);
  positions.push(0, (lastT - 0.45) * totalH + cuspElevation(type, 0, lastT), 0);
  vertColors.push(topCol.r, topCol.g, topCol.b);
  uvs.push(0.5, 1);
  const topRing = hSteps * (segs + 1);
  for (let si = 0; si < segs; si++) {
    indices.push(topRing + si, topRing + si + 1, topCenter);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(vertColors, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// ══════════════════════════════════════════
// Tooth arch position
// ══════════════════════════════════════════
function getToothTransform(num: number) {
  const isUpper = num <= 16;
  let idx = isUpper ? num - 1 : 32 - num;
  const t = (idx - 7.5) / 7.5;
  const absT = Math.abs(t);

  const x = t * 2.8;
  const z = -(absT * absT * 2.0) + 0.5;
  const y = isUpper ? 0.35 : -0.35;

  const angle = Math.atan2(x, -z + 0.5) * 0.55;
  const scale = absT > 0.7 ? 1.15 : absT > 0.4 ? 1.05 : 1.0;

  return { pos: [x, y, z] as [number, number, number], rotY: angle, scale, isUpper };
}

// ══════════════════════════════════════════
// Tooth Mesh Component
// ══════════════════════════════════════════
function Tooth({ num, findings }: { num: number; findings: Finding[] }) {
  const [hovered, setHovered] = useState(false);
  const type = getToothType(num);
  const label = getToothLabel(num);
  const { pos, rotY, scale, isUpper } = getToothTransform(num);

  const geometry = useMemo(() => createToothGeometry(type, num * 1.618), [type, num]);

  const affected = findings.filter(f => f.toothNumbers?.includes(num));
  const severity = affected.reduce((w, f) => {
    if (f.severity === 'severe') return 'severe';
    if (f.severity === 'moderate' && w !== 'severe') return 'moderate';
    if (f.severity === 'mild' && w === 'none') return 'mild';
    return w;
  }, 'none');

  const matProps = useMemo(() => {
    const base = {
      vertexColors: true as const,
      roughness: 0.14,
      metalness: 0,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
      transmission: 0.06,
      thickness: 0.4,
      ior: 1.52,
      envMapIntensity: 0.6,
    };
    if (hovered) return { ...base, emissive: new THREE.Color('#2563eb'), emissiveIntensity: 0.2 };
    if (severity === 'severe') return { ...base, emissive: new THREE.Color('#b91c1c'), emissiveIntensity: 0.18, vertexColors: false as const, color: new THREE.Color('#e8a0a0') };
    if (severity === 'moderate') return { ...base, emissive: new THREE.Color('#92400e'), emissiveIntensity: 0.12, vertexColors: false as const, color: new THREE.Color('#fbbf24') };
    if (severity === 'mild') return { ...base, emissive: new THREE.Color('#000000'), emissiveIntensity: 0 };
    return { ...base, emissive: new THREE.Color('#000000'), emissiveIntensity: 0 };
  }, [severity, hovered]);

  return (
    <group position={pos} rotation={[isUpper ? Math.PI : 0, rotY, 0]} scale={scale}>
      <mesh
        geometry={geometry}
        onPointerOver={(e: any) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
        castShadow receiveShadow
      >
        <meshPhysicalMaterial {...matProps} />
      </mesh>
      {hovered && (
        <Html position={[0, isUpper ? -0.28 : 0.28, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="bg-black/90 text-white px-3 py-2 rounded-xl shadow-2xl border border-white/10 whitespace-nowrap text-center backdrop-blur-md">
            <div className="text-[11px] font-bold">#{num} · {label}</div>
            {affected.length > 0 && (
              <div className={`text-[10px] mt-0.5 ${severity === 'severe' ? 'text-red-400' : severity === 'moderate' ? 'text-amber-400' : 'text-yellow-200'}`}>
                ⚠ {affected[0].issue}
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

// ══════════════════════════════════════════
// Gum Arch Mesh
// ══════════════════════════════════════════
function GumArch({ isUpper, gumHealth }: { isUpper: boolean; gumHealth: number }) {
  const geometry = useMemo(() => {
    // Small, thin gum ridge cross-section that sits behind the teeth
    const shape = new THREE.Shape();
    const hw = 0.08; // half-width (thin!)
    const hh = 0.06; // half-height
    shape.moveTo(-hw, 0);
    shape.bezierCurveTo(-hw, hh, -hw * 0.3, hh * 1.2, 0, hh * 1.2);
    shape.bezierCurveTo(hw * 0.3, hh * 1.2, hw, hh, hw, 0);
    shape.bezierCurveTo(hw, -hh * 0.4, hw * 0.3, -hh * 0.5, 0, -hh * 0.5);
    shape.bezierCurveTo(-hw * 0.3, -hh * 0.5, -hw, -hh * 0.4, -hw, 0);

    // Path follows the arch — positioned at the ROOT level of teeth
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 50; i++) {
      const t = (i / 50 - 0.5) * 2;
      const a = Math.abs(t);
      const x = t * 3.0;
      const z = -(a * a * 2.0) + 0.5;
      // Gum sits at root level
      const y = isUpper ? 0.35 + 0.12 : -0.35 - 0.12;
      pts.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.ExtrudeGeometry(shape, { steps: 80, bevelEnabled: false, extrudePath: new THREE.CatmullRomCurve3(pts) });
  }, [isUpper]);

  const color = gumHealth >= 75 ? '#c47080' : gumHealth >= 55 ? '#b85858' : '#a04848';
  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshPhysicalMaterial color={color} roughness={0.55} metalness={0} clearcoat={0.25} clearcoatRoughness={0.4} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ══════════════════════════════════════════
// Scene
// ══════════════════════════════════════════
function DentalScene({ findings, aesthetics }: DentalViewer3DProps) {
  const ref = useRef<THREE.Group>(null);
  const gh = aesthetics?.gumHealth || 75;
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.025; });

  return (
    <>
      {/* Clinical lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 8, 6]} intensity={1.2} castShadow color="#fff5ee" />
      <directionalLight position={[-4, 5, -3]} intensity={0.3} color="#d0e0ff" />
      <pointLight position={[0, 0, 5]} intensity={0.5} color="#f0f4ff" distance={12} />
      <hemisphereLight args={['#cce0ff', '#4a1010', 0.3]} />
      {/* Rim light */}
      <directionalLight position={[0, -3, -5]} intensity={0.15} color="#aabbff" />

      <group ref={ref} rotation={[0.15, 0, 0]}>
        <GumArch isUpper gumHealth={gh} />
        <GumArch isUpper={false} gumHealth={gh} />
        {Array.from({ length: 32 }, (_, i) => (
          <Tooth key={i + 1} num={i + 1} findings={findings || []} />
        ))}
      </group>

      <OrbitControls enableZoom enablePan enableRotate minDistance={1.8} maxDistance={10} makeDefault />
    </>
  );
}

// ══════════════════════════════════════════
// Exported Component
// ══════════════════════════════════════════
export default function DentalViewer3D({ findings, aesthetics, overallScore }: DentalViewer3DProps) {
  const [view, setView] = useState<'full' | 'upper' | 'lower'>('full');
  const cam: [number, number, number] = view === 'upper' ? [0, 3.5, 2.5] : view === 'lower' ? [0, -3.5, 2.5] : [0, 1.5, 4.2];

  return (
    <div className="dashboard-card !p-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-healthcare-border dark:border-dark-border">
        <div>
          <h3 className="text-lg font-heading font-semibold text-healthcare-text-primary dark:text-dark-text-primary">3D Dental Visualization</h3>
          <p className="text-xs text-healthcare-text-muted dark:text-dark-text-muted">Drag to rotate · Scroll to zoom · Right-click to pan</p>
        </div>
        <div className="flex gap-1">
          {(['full', 'upper', 'lower'] as const).map(m => (
            <button key={m} onClick={() => setView(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${view === m ? 'bg-primary-500 text-white shadow-sm' : 'bg-gray-100 dark:bg-dark-surface text-healthcare-text-secondary dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-border'}`}>
              {m === 'full' ? 'Full' : m === 'upper' ? 'Upper' : 'Lower'}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full h-[480px] relative" style={{ background: 'radial-gradient(ellipse at center, #1a2540 0%, #0c1220 70%, #080d18 100%)' }}>
        <Canvas camera={{ position: cam, fov: 36 }} shadows dpr={[1, 2]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}>
          <DentalScene findings={findings} aesthetics={aesthetics} overallScore={overallScore} />
        </Canvas>
        {overallScore !== undefined && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur border border-white/8 rounded-xl px-3 py-2 pointer-events-none">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest">Score</p>
            <p className={`text-2xl font-bold leading-tight ${overallScore >= 80 ? 'text-emerald-400' : overallScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
              {overallScore}<span className="text-sm text-slate-500">/100</span>
            </p>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur border border-white/8 rounded-xl px-3 py-2 pointer-events-none">
          <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Legend</p>
          {[{ c: '#faf5ee', l: 'Healthy' }, { c: '#fde68a', l: 'Mild' }, { c: '#fbbf24', l: 'Moderate' }, { c: '#e8a0a0', l: 'Severe' }].map(i => (
            <div key={i.l} className="flex items-center gap-1.5 leading-tight">
              <div className="w-2 h-2 rounded-full border border-white/10" style={{ background: i.c }} />
              <span className="text-[10px] text-slate-400">{i.l}</span>
            </div>
          ))}
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
          <span className="text-[10px] text-slate-500/70 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">Hover any tooth for details</span>
        </div>
      </div>
    </div>
  );
}
