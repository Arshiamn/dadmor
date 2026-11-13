/* HeroCanvas — the living 3D hero background (R3F + three).
   v4 bug B5 fix: this runs on EVERY device — no pointer:fine gate, no
   width gate. Touch-drag counts as interaction (pointer events).
   Reduced motion is the only full off-switch; no-WebGL falls back to the
   static lion + CSS aurora.

   v26 (2026-11-06, performance — owner order: the landing page felt
   heavy, scrolling stuck and jumped, the hero background lagged):
   the wave is now computed on the GPU. Before v26 the terrain rebuilt
   3,024 vertices on the CPU every 2nd frame (BufferAttribute getters +
   3 Math.sin per point), the rain updated 220 points every frame and
   the aurora rebuilt 637 vertices — all on the main thread, which is
   what starved Lenis/ScrollTrigger and made scrolling stick then jump.
   Now the geometry is static; a uTime uniform drives the same 3-sine
   wave in the vertex shader, so per-frame CPU cost is ~zero (one
   uniform write + the two rotations). The visual is identical: same
   dot counts, same wave factors, same colours and opacities.
   Also: DPR cap 1.5 -> 1.25 and antialias off (the dots are ~4px;
   MSAA on a full-screen canvas cost more than it showed).

   Scene (from the v4 hero-three.js, reimplemented for React):
   - terrain: 72x42 = 3,024 points, 3-sine wave, violet + ~4.5% green,
     additive, slow drift
   - rain: 220 points falling and wrapping, violet + ~5% green
   - aurora ribbon: a wavy plane (48x12), violet gradient, additive
   - camera parallax from the pointer (mouse AND touch-drag), lerped
   - pauses off-screen / tab-hidden; DPR capped at 1.25
*/
import { useMemo, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const TERRAIN_W = 72
const TERRAIN_H = 42
const RAIN_N = 220
const CAM_FOV = 55

function terrainPositions(): Float32Array {
  const pos = new Float32Array(TERRAIN_W * TERRAIN_H * 3)
  let i = 0
  for (let x = 0; x < TERRAIN_W; x++) {
    for (let z = 0; z < TERRAIN_H; z++) {
      const px = (x / TERRAIN_W - 0.5) * 22
      const pz = (z / TERRAIN_H - 0.5) * 13
      const py =
        Math.sin(px * 0.35) * 0.9 + Math.sin(pz * 0.5 + px * 0.2) * 0.7 + Math.sin((px + pz) * 0.18) * 0.5
      pos[i++] = px
      pos[i++] = py
      pos[i++] = pz
    }
  }
  return pos
}

function terrainColors(dark: boolean): Float32Array {
  const col = new Float32Array(TERRAIN_W * TERRAIN_H * 3)
  const violet = new THREE.Color('#8c80ff')
  const live = new THREE.Color('#00e676')
  const dim = dark ? 0.85 : 0.6
  for (let i = 0; i < TERRAIN_W * TERRAIN_H; i++) {
    // Green is the live/verified signal — dark mode only. Light mode is
    // violet throughout (QA: green dots stayed visible in light mode).
    const c = dark && i % 22 === 0 ? live : violet
    col[i * 3] = c.r * dim
    col[i * 3 + 1] = c.g * dim
    col[i * 3 + 2] = c.b * dim
  }
  return col
}

/* Shared points shaders. The wave / fall is pure GPU; the CPU only
   writes uTime once per frame. gl_PointSize reproduces PointsMaterial
   sizeAttenuation: world-size * (pixelHeight/2 / tan(fov/2)) / depth. */
const POINTS_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelScale;
  uniform float uFall; // 0 = terrain wave, >0 = rain fall speed
  attribute vec3 aColor;
  varying vec3 vColor;
  void main() {
    vColor = aColor;
    vec3 p = position;
    if (uFall > 0.0) {
      // Rain: fall and wrap over a 10-unit range [-2.5, 7.5).
      p.y = mod(position.y - uTime * uFall + 2.5, 10.0) - 2.5;
    } else {
      // Terrain: the same 3-sine wave the CPU rebuild used to compute.
      p.y = sin(position.x * 0.35 + uTime * 0.28) * 0.9
          + sin(position.z * 0.5 + position.x * 0.2 + uTime * 0.2) * 0.7
          + sin((position.x + position.z) * 0.18 + uTime * 0.14) * 0.5;
    }
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * uPixelScale / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`
const POINTS_FRAG = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  void main() {
    gl_FragColor = vec4(vColor, uOpacity);
  }
`

/* Pixel scale for gl_PointSize. This reproduces three.js PointsMaterial
   sizeAttenuation EXACTLY (verified against the three.js source):
   gl_PointSize = size * (scale / -mvPosition.z), where three.js sets
   uniforms.size = material.size * pixelRatio and uniforms.scale =
   drawingBufferHeight * 0.5. So the scale is (CSS height * dpr^2) / 2.
   NOTE: do NOT divide by tan(fov/2) — that is the physically correct
   perspective size, but three.js does not do it, and doing it made the
   dots 1/tan(27.5°) = 1.92x too large (v26 first build, fixed here). */
function usePixelScale(): number {
  const size = useThree((s) => s.size)
  const dpr = useThree((s) => s.viewport.dpr)
  return useMemo(() => {
    return (size.height * dpr * dpr) / 2
  }, [size.height, dpr])
}

function Terrain({ dark }: { dark: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const pointsRef = useRef<THREE.Points>(null)
  const positions = useMemo(terrainPositions, [])
  const colors = useMemo(() => terrainColors(dark), [dark])
  const pixelScale = usePixelScale()
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 0.05 },
      uPixelScale: { value: pixelScale },
      uFall: { value: 0 },
      uOpacity: { value: dark ? 0.9 : 0.75 },
    }),
    [dark, pixelScale],
  )
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (matRef.current) matRef.current.uniforms.uTime.value = t
    if (pointsRef.current) pointsRef.current.rotation.y = Math.sin(t * 0.07) * 0.08
  })
  return (
    <points ref={pointsRef} position={[0, -2.2, -2]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={POINTS_VERT}
        fragmentShader={POINTS_FRAG}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function Rain({ dark }: { dark: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const pixelScale = usePixelScale()
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(RAIN_N * 3)
    const col = new Float32Array(RAIN_N * 3)
    const violet = new THREE.Color('#8c80ff')
    const live = new THREE.Color('#00e676')
    for (let i = 0; i < RAIN_N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = Math.random() * 10 - 2
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2
      const c = dark && i % 20 === 0 ? live : violet
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }
    return { positions: pos, colors: col }
  }, [dark])
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 0.045 },
      uPixelScale: { value: pixelScale },
      uFall: { value: 2.0 },
      uOpacity: { value: dark ? 0.55 : 0.35 },
    }),
    [dark, pixelScale],
  )
  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime
  })
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={POINTS_VERT}
        fragmentShader={POINTS_FRAG}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

const AURORA_VERT = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z = sin(position.x * 0.35 + uTime * 0.5) * 0.9 + sin(position.y * 0.6 + uTime * 0.3) * 0.5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`
const AURORA_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    gl_FragColor = vec4(uColor, uOpacity);
  }
`

function Aurora({ dark }: { dark: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const geo = useMemo(() => new THREE.PlaneGeometry(24, 7, 48, 12), [])
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(dark ? '#8c80ff' : '#3a3587') },
      uOpacity: { value: dark ? 0.14 : 0.08 },
    }),
    [dark],
  )
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (matRef.current) matRef.current.uniforms.uTime.value = t
    if (meshRef.current) meshRef.current.rotation.z = Math.sin(t * 0.07) * 0.05
  })
  return (
    <mesh ref={meshRef} geometry={geo} position={[0, 1.4, -6]}>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={AURORA_VERT}
        fragmentShader={AURORA_FRAG}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

/* FirstFrame — fires onFirst once, after the first frame is rendered.
   v28 (2026-11-06): the canvas fade-in is gated on this, not on mount.
   The old CSS animation started fading the moment the <canvas> element
   mounted, but on mobile the first WebGL frame can land after the 800ms
   animation already finished — so the dot field popped in at full
   opacity (the mobile refresh/flicker). With .is-ready set here, the
   fade is of real content. */
function FirstFrame({ onFirst }: { onFirst: () => void }) {
  const done = useRef(false)
  useFrame(() => {
    if (!done.current) {
      done.current = true
      onFirst()
    }
  })
  return null
}

function ParallaxRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null)
  const target = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const hero = document.querySelector('.hero')
    if (!hero) return
    const onMove = (ev: Event) => {
      const e = ev as PointerEvent
      const r = hero.getBoundingClientRect()
      target.current.x = ((e.clientX - r.left) / r.width - 0.5) * 1.6
      target.current.y = ((e.clientY - r.top) / r.height - 0.5) * -1.0
    }
    hero.addEventListener('pointermove', onMove)
    return () => hero.removeEventListener('pointermove', onMove)
  }, [])
  useFrame((_, delta) => {
    if (!group.current) return
    const k = Math.min(1, delta * 3)
    group.current.rotation.y += (target.current.x * 0.12 - group.current.rotation.y) * k
    group.current.rotation.x += (target.current.y * 0.08 - group.current.rotation.x) * k
  })
  return <group ref={group}>{children}</group>
}

export default function HeroCanvas({ dark }: { dark: boolean }) {
  const [failed, setFailed] = useState(false)
  const [visible, setVisible] = useState(true)
  const [reduced, setReduced] = useState(false)
  // v28: the canvas starts transparent and fades in only after its first
  // frame renders (.is-ready -> CSS transition). See FirstFrame above.
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    const hero = document.querySelector('.hero')
    if (!hero || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 })
    io.observe(hero)
    const onVis = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])
  if (failed || reduced || typeof window === 'undefined') return null
  return (
    <Canvas
      dpr={typeof window === 'undefined' ? 1 : Math.min(1.25, window.devicePixelRatio || 1)}
      camera={{ position: [0, 0.4, 9], fov: CAM_FOV }}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: 'high-performance',
        // v32 (2026-11-06): preserveDrawingBuffer RESTORED (was v29, removed
        // in v31). The wave animation is back per owner order, and the
        // canvas must snapshot correctly in the View Transition — without
        // this the buffer is cleared after each frame and the theme-change
        // snapshot is blank (the landing-only flicker). The owner accepts
        // it may still flicker/reload on his own iPhone Safari.
        preserveDrawingBuffer: true,
      }}
      frameloop={visible ? 'always' : 'never'}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0)
      }}
      onError={() => setFailed(true)}
      aria-hidden="true"
      className={ready ? 'hero-canvas is-ready' : 'hero-canvas'}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <FirstFrame onFirst={() => setReady(true)} />
      <ParallaxRig>
        <Terrain dark={dark} />
        <Rain dark={dark} />
        <Aurora dark={dark} />
      </ParallaxRig>
    </Canvas>
  )
}
