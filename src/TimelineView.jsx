import { useState, useRef } from 'react'
import { db } from './db'

const C = { bg:'#080d16', panel:'#0f1724', card:'#172030', border:'#1c2b3f', text:'#f0f4fa', muted:'#5a7190' }
const TODAY = new Date(); TODAY.setHours(0,0,0,0)

/* ── Date helpers ── */
const parseDate  = str => { if (!str) return null; const d = new Date(str + 'T00:00:00'); return isNaN(d) ? null : d }
const fmtDate    = d   => d ? d.toLocaleDateString('es-CO', { day:'numeric', month:'short' }) : '—'
const fmtMonth   = d   => d.toLocaleDateString('es-CO', { month:'short', year:'2-digit' })
const daysBetween = (a, b) => Math.round((b - a) / 86400000)

function pct(date, rangeStart, totalDays) {
  return Math.max(0, Math.min(100, (daysBetween(rangeStart, date) / totalDays) * 100))
}

function getMonthHeaders(start, end) {
  const headers = []
  const totalDays = daysBetween(start, end) || 1
  let cur = new Date(start.getFullYear(), start.getMonth(), 1)
  while (cur <= end) {
    const mStart = new Date(Math.max(cur, start))
    const mEnd   = new Date(Math.min(new Date(cur.getFullYear(), cur.getMonth() + 1, 0), end))
    headers.push({
      label:    fmtMonth(cur),
      leftPct:  pct(mStart, start, totalDays),
      widthPct: (daysBetween(mStart, mEnd) + 1) / totalDays * 100,
    })
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1)
  }
  return headers
}

/* ── Inline date editor ── */
function DateEditor({ phase, onSave, onClose }) {
  const [start, setStart] = useState(phase.start_date || '')
  const [end,   setEnd]   = useState(phase.end_date   || '')
  const inp = {
    background: C.bg, border:`1px solid ${C.border}`, color: C.text,
    borderRadius: 6, padding:'5px 8px', fontSize:12, outline:'none',
    colorScheme:'dark',
  }
  const valid = !start || !end || new Date(start) <= new Date(end)
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', padding:'8px 12px',
      background:'#0c1828', borderTop:`1px solid ${C.border}` }}>
      <span style={{ fontSize:12, color:C.muted, flexShrink:0 }}>Inicio:</span>
      <input type="date" value={start} onChange={e => setStart(e.target.value)} style={inp} />
      <span style={{ fontSize:12, color:C.muted, flexShrink:0 }}>Fin:</span>
      <input type="date" value={end}   onChange={e => setEnd(e.target.value)}   style={inp} />
      {!valid && <span style={{ fontSize:11, color:'#f87171' }}>La fecha fin debe ser ≥ inicio</span>}
      <div style={{ display:'flex', gap:6, marginLeft:'auto' }}>
        <button onClick={() => onSave(start || null, end || null)}
          disabled={!valid}
          style={{ background: valid ? '#1d4ed8' : '#1c2b3f', color: valid ? '#fff' : C.muted,
            border:'none', borderRadius:5, padding:'5px 12px', fontSize:12, cursor: valid ? 'pointer' : 'default', fontWeight:600 }}>
          Guardar
        </button>
        {(phase.start_date || phase.end_date) && (
          <button onClick={() => onSave(null, null)}
            style={{ background:'#7f1d1d', color:'#fca5a5', border:'none', borderRadius:5, padding:'5px 10px', fontSize:12, cursor:'pointer' }}>
            Quitar fechas
          </button>
        )}
        <button onClick={onClose}
          style={{ background:C.card, color:C.muted, border:`1px solid ${C.border}`, borderRadius:5, padding:'5px 10px', fontSize:12, cursor:'pointer' }}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

/* ── Phase row ── */
function PhaseRow({ phase, rangeStart, totalDays, todayPct, onUpdated, mobile }) {
  const [editing, setEditing] = useState(false)
  const [hover,   setHover]   = useState(false)

  const steps    = phase.steps || []
  const done     = steps.filter(s => s.status === 'completado').length
  const inProg   = steps.filter(s => s.status === 'progreso').length
  const pctDone  = steps.length > 0 ? Math.round(done / steps.length * 100) : 0
  const start    = parseDate(phase.start_date)
  const end      = parseDate(phase.end_date)
  const hasDates = start && end

  // Bar geometry
  const barLeft  = hasDates ? pct(start, rangeStart, totalDays) : null
  const barWidth = hasDates ? Math.max(0.5, pct(end, rangeStart, totalDays) - barLeft) : null

  async function handleSave(startVal, endVal) {
    const { data } = await db.phases.update(phase.id, { start_date: startVal, end_date: endVal })
    if (data) onUpdated({ ...phase, start_date: startVal, end_date: endVal })
    setEditing(false)
  }

  const isLate = hasDates && end < TODAY && pctDone < 100

  return (
    <div style={{ borderBottom:`1px solid ${C.border}` }}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ display:'flex', alignItems:'stretch', minHeight:52,
          background: hover ? '#0e1e30' : 'transparent', transition:'background 0.15s' }}
      >
        {/* Left info panel */}
        <div style={{ width: mobile ? 140 : 210, flexShrink:0, padding:'10px 12px',
          borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column', justifyContent:'center', gap:3 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:phase.color, flexShrink:0 }} />
            <span style={{ fontSize: mobile ? 11 : 12, fontWeight:600, color:C.text,
              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {phase.name.includes('—') ? phase.name.split('—')[1].trim() : phase.name}
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, paddingLeft:14 }}>
            <span style={{ fontSize:10, color: isLate ? '#f87171' : C.muted }}>
              {hasDates ? `${fmtDate(start)} → ${fmtDate(end)}` : 'Sin fechas'}
            </span>
            {isLate && <span style={{ fontSize:9, color:'#f87171', fontWeight:600 }}>VENCIDA</span>}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5, paddingLeft:14 }}>
            <div style={{ background:'#1e2d42', borderRadius:3, height:4, width:50, overflow:'hidden' }}>
              <div style={{ width:`${pctDone}%`, height:'100%', background:phase.color, borderRadius:3 }} />
            </div>
            <span style={{ fontSize:10, color:C.muted }}>{pctDone}%</span>
          </div>
        </div>

        {/* Right: Gantt bar area */}
        <div style={{ flex:1, position:'relative', minWidth:0, padding:'0 8px', display:'flex', alignItems:'center' }}>
          {/* Track background */}
          <div style={{ position:'absolute', left:8, right:8, height:2, background:'#1e2d42', borderRadius:2 }} />

          {hasDates ? (
            <div style={{ position:'absolute', left:`calc(8px + ${barLeft}%)`,
              width:`${barWidth}%`, height:28,
              background: phase.color + '25', border:`1px solid ${phase.color}60`,
              borderRadius:5, overflow:'hidden', cursor:'pointer', transition:'all 0.15s',
              boxShadow: hover ? `0 0 0 1px ${phase.color}` : 'none' }}
              onClick={() => setEditing(e => !e)}>
              {/* Completion fill */}
              <div style={{ position:'absolute', top:0, bottom:0, left:0, width:`${pctDone}%`,
                background:phase.color, opacity:0.65,
                borderRadius: pctDone === 100 ? 4 : '4px 0 0 4px', transition:'width 0.4s' }} />
              {/* Label inside bar */}
              {barWidth > 8 && (
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:10, fontWeight:600,
                  color: pctDone > 40 ? 'rgba(255,255,255,0.9)' : phase.color, zIndex:1,
                  whiteSpace:'nowrap', overflow:'hidden', padding:'0 6px' }}>
                  {pctDone}%
                </div>
              )}
            </div>
          ) : (
            /* No dates: dashed placeholder */
            <div onClick={() => setEditing(true)}
              style={{ position:'absolute', left:8, right:8, height:24,
                border:`1.5px dashed ${C.border}`, borderRadius:5, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                transition:'border-color 0.15s', fontSize:11, color:C.muted }}
              onMouseEnter={e => e.currentTarget.style.borderColor='#3b82f6'}
              onMouseLeave={e => e.currentTarget.style.borderColor=C.border}>
              + añadir fechas
            </div>
          )}

          {/* Today marker */}
          {todayPct >= 0 && todayPct <= 100 && (
            <div style={{ position:'absolute', left:`calc(8px + ${todayPct}%)`, top:4, bottom:4,
              width:2, background:'#f59e0b', borderRadius:1, zIndex:5 }}>
              <div style={{ position:'absolute', top:-14, left:'50%', transform:'translateX(-50%)',
                fontSize:9, color:'#f59e0b', fontWeight:700, whiteSpace:'nowrap',
                background:'#1c1908', padding:'1px 4px', borderRadius:3 }}>HOY</div>
            </div>
          )}

          {/* Edit button on hover when has dates */}
          {hover && hasDates && (
            <button onClick={() => setEditing(e => !e)}
              style={{ position:'absolute', right:14, background:C.panel, border:`1px solid ${C.border}`,
                borderRadius:4, padding:'2px 7px', fontSize:10, color:C.muted,
                cursor:'pointer', zIndex:10 }}>
              ✏️ editar
            </button>
          )}
        </div>
      </div>

      {/* Inline date editor */}
      {editing && <DateEditor phase={phase} onSave={handleSave} onClose={() => setEditing(false)} />}
    </div>
  )
}

/* ── Timeline View ── */
export default function TimelineView({ phases, onPhasesChange, mobile }) {
  // Collect all phases with dates to determine range
  const dated  = phases.filter(p => p.start_date && p.end_date)
  const allWithDates = dated.length > 0

  // Build range: min start → max end, padded by ~7%
  let rangeStart, rangeEnd
  if (allWithDates) {
    const starts = dated.map(p => parseDate(p.start_date))
    const ends   = dated.map(p => parseDate(p.end_date))
    rangeStart = new Date(Math.min(...starts))
    rangeEnd   = new Date(Math.max(...ends))
    // Pad by 5% on each side
    const pad = Math.max(7, daysBetween(rangeStart, rangeEnd) * 0.05)
    rangeStart = new Date(rangeStart - pad * 86400000)
    rangeEnd   = new Date(rangeEnd   + pad * 86400000)
  } else {
    // Default: current month span
    rangeStart = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)
    rangeEnd   = new Date(TODAY.getFullYear(), TODAY.getMonth() + 3, 0)
  }

  const totalDays = Math.max(1, daysBetween(rangeStart, rangeEnd))
  const todayPct  = pct(TODAY, rangeStart, totalDays)
  const monthHdrs = getMonthHeaders(rangeStart, rangeEnd)

  function updatePhase(updated) {
    onPhasesChange(phases.map(p => p.id === updated.id ? { ...p, ...updated } : p))
  }

  const phasesWithDates = phases.filter(p => p.start_date && p.end_date).length
  const leftW = mobile ? 140 : 210

  return (
    <div>
      {/* Summary row */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        {[
          { v: phases.length,        l:'Fases',             c:'#3b82f6' },
          { v: phasesWithDates,      l:'Con fechas',        c:'#10b981' },
          { v: phases.length - phasesWithDates, l:'Sin fechas', c:C.muted },
          { v: phases.flatMap(p=>p.steps||[]).filter(s=>s.status==='completado').length,
            l:'Pasos completados', c:'#a855f7' },
        ].map(({ v, l, c }) => (
          <div key={l} style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:8,
            padding:'7px 14px', flex:'1 1 80px', textAlign:'center' }}>
            <div style={{ fontSize:18, fontWeight:700, color:c, lineHeight:1 }}>{v}</div>
            <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Gantt chart */}
      <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>

        {/* Month header row */}
        <div style={{ display:'flex', borderBottom:`1px solid ${C.border}`, background:'#0c1828' }}>
          <div style={{ width:leftW, flexShrink:0, padding:'8px 12px',
            borderRight:`1px solid ${C.border}`, fontSize:11, color:C.muted, fontWeight:600 }}>
            Fase
          </div>
          <div style={{ flex:1, position:'relative', height:32, minWidth:0 }}>
            {monthHdrs.map((m, i) => (
              <div key={i} style={{ position:'absolute', top:0, bottom:0,
                left:`${m.leftPct}%`, width:`${m.widthPct}%`,
                borderRight:`1px solid ${C.border}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:10, color:C.muted, fontWeight:600, overflow:'hidden' }}>
                {m.widthPct > 5 ? m.label : ''}
              </div>
            ))}
            {/* Today in header */}
            {todayPct >= 0 && todayPct <= 100 && (
              <div style={{ position:'absolute', top:0, bottom:0, left:`${todayPct}%`,
                width:2, background:'#f59e0b30', zIndex:3 }} />
            )}
          </div>
        </div>

        {/* Phase rows */}
        {phases.map(phase => (
          <PhaseRow
            key={phase.id}
            phase={phase}
            rangeStart={rangeStart}
            totalDays={totalDays}
            todayPct={todayPct}
            onUpdated={updatePhase}
            mobile={mobile}
          />
        ))}

        {phases.length === 0 && (
          <div style={{ textAlign:'center', padding:'40px', color:C.muted }}>
            <div style={{ fontSize:32, marginBottom:8 }}>📅</div>
            Crea fases en el Roadmap para verlas aquí
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display:'flex', gap:16, marginTop:14, flexWrap:'wrap' }}>
        {[
          { color:'#10b981', label:'Barra = rango planificado' },
          { color:'#10b981', opacity:0.65, label:'Relleno = % completado' },
          { color:'#f59e0b', label:'Línea naranja = hoy' },
          { color:'#f87171', label:'Vencida = fecha fin pasada sin completar' },
        ].map(({ color, opacity, label }) => (
          <div key={label} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:14, height:8, borderRadius:2, background:color, opacity:opacity||1 }} />
            <span style={{ fontSize:11, color:C.muted }}>{label}</span>
          </div>
        ))}
      </div>

      {!allWithDates && phases.length > 0 && (
        <div style={{ marginTop:12, padding:'12px 16px', background:'#0f1f10',
          border:`1px solid #1a3520`, borderRadius:8, fontSize:12, color:'#6aaf7a' }}>
          💡 Haz click en el área de líneas discontinuas de cada fase para asignarle fechas de inicio y fin.
        </div>
      )}
    </div>
  )
}
