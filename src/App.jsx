import { useState, useEffect } from 'react'
import { supabase } from './supabase.js'

/* ── Roadmap data ─────────────────────────────────────────── */
const PHASES = [
  {
    id: 'p1',
    name: 'FASE 1 — El Impulso Inicial y Vuelo Exprés',
    color: '#3b82f6',
    steps: [
      { id: 's1',  title: 'Granja de Cobblestone',                      desc: 'Bloques para puentes en el Nether, tapar lava y navegar el End.', badges: [] },
      { id: 's2',  title: 'Criadero de Aldeanos y Trading Hall',         desc: 'Herramientas de diamante. Librero con Mending + Unbreaking III para tus Élitras.', badges: [] },
      { id: 's3',  title: '⚔️ Trial Chambers (Cámaras del Juicio)',      desc: 'Consigue Botellas Siniestras (Ominous Bottles) para la mini-granja de raids en Fase 2.', badges: [{ label: 'Clave 1.21', type: 'important' }] },
      { id: 's4',  title: '⛏️ El Nether Exprés',                         desc: 'Varas de Blaze en una fortaleza. Perlas en Warped Forest con techo de 2 bloques.', badges: [{ label: 'Nether', type: 'location' }] },
      { id: 's5',  title: '🚀 HITO: Viaje al End',                       desc: 'Derrota al dragón, consigue Élitras y 10–20 Shulker Boxes en End Cities.', badges: [{ label: 'Hito Principal', type: 'important' }, { label: 'El End', type: 'location' }] },
    ],
  },
  {
    id: 'p2',
    name: 'FASE 2 — Cimientos de la Red Industrial (Post-End)',
    color: '#ef4444',
    steps: [
      { id: 's6',  title: '🔴 Mini-Granja de Raids (Ianxofour)',          desc: 'Ominous Bottle en el océano = Redstone infinita, esmeraldas y tótems de inmortalidad.', badges: [{ label: 'Océano', type: 'location' }] },
      { id: 's7',  title: 'Granja de Slime',                             desc: 'Vacía un Slime Chunk. Pegamento para máquinas voladoras y pistones pegajosos.', badges: [] },
      { id: 's8',  title: 'Granja de Polvo de Hueso + Caña y Bambú',    desc: 'Musgo de Lush Cave + dispensadores = polvo de hueso infinito. Caña para cohetes de Élitras.', badges: [] },
      { id: 's9',  title: 'Granja de Miel Automática',                  desc: 'Conecta tolvas a un Crafter para empaquetar botellas de miel en bloques automáticamente.', badges: [{ label: 'Crafter', type: 'default' }] },
      { id: 's10', title: 'Granja de Gallinas, Cactus y Tortugas',      desc: 'Gallinas: plumas/comida. Cactus: papelera anti-lag. Tortugas: cebo para monstruos.', badges: [] },
      { id: 's11', title: 'Granja de Oro + Trueque Piglin',             desc: 'Techo del Nether. Primer Item Sorter Nivel 1. Oro sobrante a Piglins por obsidiana y cuarzo.', badges: [{ label: 'Techo Nether', type: 'location' }, { label: 'Sorter Nv.1', type: 'default' }] },
    ],
  },
  {
    id: 'p3',
    name: 'FASE 3 — Logística Global y Confort Técnico',
    color: '#f59e0b',
    steps: [
      { id: 's12', title: 'Granja de Hielo → Nether Hub Central',       desc: 'Ice Roads en el techo del Nether para viajar a 70+ bloques/segundo entre portales.', badges: [{ label: 'Nether Hub', type: 'location' }] },
      { id: 's13', title: 'Granja de Madera Masiva + Creepers',         desc: 'Chunks dedicados. Sorters Nivel 2 (Shulker Box Loaders) para el volumen de producción.', badges: [{ label: 'Sorter Nv.2', type: 'default' }, { label: 'Chunk Loaders', type: 'default' }] },
      { id: 's14', title: 'Granja de Wither Skeletons (Faros)',         desc: 'Soul Sand Valley. Haste II obligatorio para aplanar terrenos de las mega-granjas de Fase 4.', badges: [{ label: 'Nether Fortaleza', type: 'location' }] },
      { id: 's15', title: 'Granja de Hoglins + Ovejas 16 Colores',     desc: 'Chuletas cocinadas, cuero para librerías y lana de todos los colores.', badges: [] },
      { id: 's16', title: 'Barro, Arcilla + Granja de Calamares',      desc: 'Terracota y ladrillos infinitos. Tinta luminosa para carteles brillantes en el almacén.', badges: [] },
    ],
  },
  {
    id: 'p4',
    name: '🌌 FASE 4 — El Olimpo Técnico',
    color: '#a855f7',
    steps: [
      { id: 's17', title: 'Granja de Cobre / Ahogados',                 desc: 'Hierro + cobre = decenas de Crafters para automatizar masivamente todos los crafteos.', badges: [{ label: 'Crafters Masivos', type: 'default' }] },
      { id: 's18', title: 'Granja de Guardianes + Ranabombillas',       desc: 'Linternas del Mar y luces de colores. Iluminación definitiva para mega-construcciones.', badges: [] },
      { id: 's19', title: 'Granja de Shulkers Automática',              desc: 'Cajas de Shulker infinitas por duplicación de proyectil. La logística deja de ser problema.', badges: [{ label: 'Logística ∞', type: 'important' }] },
      { id: 's20', title: 'Duplicador de Bloques de Gravedad',          desc: 'Portal del End. Duplica arena y grava para miles de bloques de concreto.', badges: [{ label: 'End Portal', type: 'location' }] },
      { id: 's21', title: 'El Mob Switch (Interruptor del Mundo)',      desc: '70 Aldeanos Zombi en chunk permanente llenan el Mobcap → spawn natural apagado.', badges: [{ label: 'Mobcap', type: 'important' }] },
      { id: 's22', title: '🏛️ MEGA ALMACÉN CENTRAL (MIS Nv.3)',        desc: 'Deja Shulkers en la tolva de entrada y la Redstone clasifica y ordena todos los ítems.', badges: [{ label: 'MIS Nivel 3', type: 'important' }] },
      { id: 's23', title: 'Stacking Raid Farm Masiva',                  desc: 'Reemplaza la Fase 2 por una megaestructura oceánica. Esmeraldas y Redstone a velocidad máxima.', badges: [{ label: 'Océano Profundo', type: 'location' }] },
    ],
  },
]

const ALL_STEP_IDS = PHASES.flatMap(p => p.steps.map(s => s.id))

/* ── Styles ───────────────────────────────────────────────── */
const S = {
  bg:     '#090e18',
  panel:  '#101724',
  card:   '#192030',
  border: '#1b2a3d',
  text:   '#f1f5f9',
  muted:  '#64748b',
}

const BADGE_STYLES = {
  default:   { background: '#1a3050', color: '#7dd3fc' },
  location:  { background: '#1e3a8a', color: '#93c5fd' },
  important: { background: '#7f1d1d', color: '#fca5a5' },
}

/* ── Components ───────────────────────────────────────────── */
function Badge({ label, type = 'default' }) {
  const s = BADGE_STYLES[type] || BADGE_STYLES.default
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
      whiteSpace: 'nowrap', ...s,
    }}>{label}</span>
  )
}

function ProgressBar({ pct, color, height = 8 }) {
  return (
    <div style={{ background: '#1e2d42', borderRadius: height, height, width: '100%', overflow: 'hidden' }}>
      <div style={{
        width: `${Math.min(100, pct)}%`, height: '100%',
        background: color, borderRadius: height, transition: 'width 0.4s ease',
      }} />
    </div>
  )
}

function StepCard({ step, status, onStatusChange }) {
  const isComplete = status === 'completado'
  const isProgress = status === 'progreso'
  const borderColor = isComplete ? '#10b981' : isProgress ? '#f59e0b' : '#2a3a4d'
  const bgColor     = isComplete ? '#0b1b10' : isProgress ? '#1c1908'  : S.card

  return (
    <div style={{
      background: bgColor,
      border: `1px solid ${S.border}`,
      borderLeft: `4px solid ${borderColor}`,
      borderRadius: 8, padding: '13px 15px', marginBottom: 8,
      opacity: isComplete ? 0.75 : 1,
      transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 14, fontWeight: 600, flex: 1, minWidth: 0, lineHeight: 1.4,
          color: isComplete ? S.muted : S.text,
          textDecoration: isComplete ? 'line-through' : 'none',
        }}>{step.title}</span>
        <select
          value={status}
          onChange={e => onStatusChange(step.id, e.target.value)}
          style={{
            background: S.bg, color: S.text, border: `1px solid ${S.border}`,
            padding: '4px 8px', borderRadius: 5, fontSize: 12,
            cursor: 'pointer', outline: 'none', flexShrink: 0,
          }}
        >
          <option value="pendiente">Pendiente</option>
          <option value="progreso">En Progreso</option>
          <option value="completado">Completado</option>
        </select>
      </div>

      {step.desc && (
        <p style={{ fontSize: 13, color: S.muted, margin: '7px 0 0', lineHeight: 1.55 }}>{step.desc}</p>
      )}

      {step.badges.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
          {step.badges.map((b, i) => <Badge key={i} label={b.label} type={b.type} />)}
        </div>
      )}
    </div>
  )
}

function PhaseSection({ phase, statuses, onStatusChange }) {
  const [collapsed, setCollapsed] = useState(false)
  const total = phase.steps.length
  const done  = phase.steps.filter(s => statuses[s.id] === 'completado').length
  const pct   = total > 0 ? Math.round(done / total * 100) : 0

  return (
    <div style={{
      background: S.panel, border: `1px solid ${S.border}`,
      borderTop: `3px solid ${phase.color}`,
      borderRadius: 10, marginBottom: 20, overflow: 'hidden',
    }}>
      <div
        onClick={() => setCollapsed(c => !c)}
        style={{ padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}
      >
        <span style={{ color: phase.color, fontSize: 12, width: 16, flexShrink: 0 }}>
          {collapsed ? '▶' : '▼'}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: S.text }}>{phase.name}</span>
            <span style={{ fontSize: 11, color: S.muted, background: S.bg, padding: '1px 6px', borderRadius: 3 }}>
              {done}/{total} · {pct}%
            </span>
          </div>
          <div style={{ maxWidth: 260 }}><ProgressBar pct={pct} color={phase.color} height={3} /></div>
        </div>
      </div>

      {!collapsed && (
        <div style={{ padding: '2px 16px 16px' }}>
          {phase.steps.map(step => (
            <StepCard
              key={step.id}
              step={step}
              status={statuses[step.id] || 'pendiente'}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ── App ──────────────────────────────────────────────────── */
export default function App() {
  const [statuses, setStatuses] = useState({})
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)

  /* Load all statuses from Supabase */
  useEffect(() => {
    supabase
      .from('roadmap_steps')
      .select('step_id, status')
      .then(({ data, error }) => {
        if (error) { console.error(error); setLoading(false); return }
        const map = {}
        data.forEach(row => { map[row.step_id] = row.status })
        setStatuses(map)
        setLoading(false)
      })
  }, [])

  const handleStatusChange = async (stepId, newStatus) => {
    setStatuses(prev => ({ ...prev, [stepId]: newStatus }))
    setSaving(true)
    const { error } = await supabase
      .from('roadmap_steps')
      .upsert({ step_id: stepId, status: newStatus, updated_at: new Date().toISOString() }, { onConflict: 'step_id' })
    if (error) console.error('Error saving:', error)
    setSaving(false)
  }

  const total     = ALL_STEP_IDS.length
  const completed = ALL_STEP_IDS.filter(id => statuses[id] === 'completado').length
  const inProg    = ALL_STEP_IDS.filter(id => statuses[id] === 'progreso').length
  const pct       = total > 0 ? Math.round(completed / total * 100) : 0

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: S.bg, color: S.muted,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: 14,
      }}>
        Cargando roadmap…
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: S.bg, color: S.text, padding: '24px 20px',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          background: S.panel, border: `1px solid ${S.border}`,
          borderTop: '3px solid #10b981',
          borderRadius: 12, padding: '22px 26px', marginBottom: 28,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: S.text }}>
                🛠️ Roadmap Técnico Minecraft
              </h1>
              <p style={{ margin: '5px 0 0', fontSize: 13, color: S.muted }}>
                Plan de progresión industrial y automatización global.
              </p>
            </div>
            {saving && (
              <span style={{ fontSize: 12, color: '#60a5fa', alignSelf: 'center' }}>
                Guardando…
              </span>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            {[
              { v: completed, l: 'Completados', c: '#10b981' },
              { v: inProg,    l: 'En Progreso', c: '#f59e0b' },
              { v: total - completed - inProg, l: 'Pendientes', c: S.muted },
              { v: total,     l: 'Total',       c: '#3b82f6' },
            ].map(({ v, l, c }) => (
              <div key={l} style={{
                background: S.bg, borderRadius: 8, padding: '7px 14px',
                border: `1px solid ${S.border}`, textAlign: 'center', minWidth: 72,
              }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: c, lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: 10, color: S.muted, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: S.muted, marginBottom: 6 }}>
              <span>Progreso General</span>
              <span style={{ color: S.text, fontWeight: 700 }}>{pct}%</span>
            </div>
            <ProgressBar pct={pct} color="#10b981" height={10} />
          </div>
        </div>

        {/* Phases */}
        {PHASES.map(phase => (
          <PhaseSection
            key={phase.id}
            phase={phase}
            statuses={statuses}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </div>
  )
}
