import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const C = { bg:'#080d16', panel:'#0f1724', border:'#1c2b3f', text:'#f0f4fa', muted:'#5a7190' }

function StatCard({ value, label, color, sub }) {
  return (
    <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:10,
      padding:'16px 20px', flex:1, minWidth:120 }}>
      <div style={{ fontSize:28, fontWeight:800, color, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color, marginTop:2, opacity:0.7 }}>{sub}</div>}
    </div>
  )
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#0f1724', border:'1px solid #1c2b3f', borderRadius:6, padding:'8px 12px' }}>
      <p style={{ color:'#f0f4fa', fontSize:13, margin:0 }}>{payload[0].name}: <strong>{payload[0].value}</strong></p>
    </div>
  )
}

export default function ProgressView({ phases }) {
  const allSteps   = phases.flatMap(p => p.steps || [])
  const total      = allSteps.length
  const completed  = allSteps.filter(s => s.status === 'completado').length
  const inProgress = allSteps.filter(s => s.status === 'progreso').length
  const pending    = total - completed - inProgress
  const pct        = total > 0 ? Math.round(completed / total * 100) : 0

  const donutData = [
    { name: 'Completado',   value: completed,  color: '#10b981' },
    { name: 'En Progreso',  value: inProgress, color: '#f59e0b' },
    { name: 'Pendiente',    value: pending,    color: '#1e2d42' },
  ]

  const phaseData = phases.map(p => {
    const steps  = p.steps || []
    const done   = steps.filter(s => s.status === 'completado').length
    const prog   = steps.filter(s => s.status === 'progreso').length
    const pend   = steps.length - done - prog
    const label  = p.name.includes('—') ? p.name.split('—')[1].trim() : p.name
    return { name: label.length > 22 ? label.slice(0, 22) + '…' : label, done, prog, pend, color: p.color, total: steps.length }
  })

  // Recent activity: steps updated recently (those with a non-default updated_at)
  const recent = allSteps
    .filter(s => s.status !== 'pendiente')
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 8)

  const statusColor = { completado:'#10b981', progreso:'#f59e0b', pendiente:'#5a7190' }
  const statusLabel = { completado:'Completado', progreso:'En Progreso', pendiente:'Pendiente' }

  if (total === 0) {
    return (
      <div style={{ textAlign:'center', padding:'60px 20px', color:C.muted }}>
        <div style={{ fontSize:40, marginBottom:8 }}>📊</div>
        <div>Agrega pasos al roadmap para ver estadísticas</div>
      </div>
    )
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* Top stats */}
      <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
        <StatCard value={`${pct}%`}   label="Progreso General"  color="#10b981" sub={`${completed} de ${total} pasos`} />
        <StatCard value={completed}   label="Completados"        color="#10b981" />
        <StatCard value={inProgress}  label="En Progreso"        color="#f59e0b" />
        <StatCard value={pending}     label="Pendientes"         color="#5a7190" />
      </div>

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:16 }}>

        {/* Donut chart */}
        <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:10, padding:'20px' }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:4 }}>Distribución de estados</div>
          <div style={{ fontSize:11, color:C.muted, marginBottom:12 }}>{total} pasos en total</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={58} outerRadius={82} dataKey="value" strokeWidth={0}>
                {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:8 }}>
            {donutData.filter(d => d.value > 0).map((d, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:d.color, flexShrink:0 }} />
                  <span style={{ fontSize:12, color:C.muted }}>{d.name}</span>
                </div>
                <span style={{ fontSize:12, fontWeight:600, color:d.color }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Phase breakdown bar chart */}
        <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:10, padding:'20px' }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:4 }}>Progreso por fase</div>
          <div style={{ fontSize:11, color:C.muted, marginBottom:16 }}>Completado / En Progreso / Pendiente</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={phaseData} layout="vertical" margin={{ left:0, right:20, top:0, bottom:0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{ fontSize:11, fill:C.muted }} width={120} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill:'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="done"  name="Completado"  stackId="a" fill="#10b981" radius={[0,0,0,0]} />
              <Bar dataKey="prog"  name="En Progreso" stackId="a" fill="#f59e0b" />
              <Bar dataKey="pend"  name="Pendiente"   stackId="a" fill="#1e2d42" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Phase detail cards */}
      <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:10, padding:'20px' }}>
        <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:16 }}>Detalle por fase</div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {phases.map(p => {
            const steps = p.steps || []
            const done  = steps.filter(s => s.status === 'completado').length
            const pct   = steps.length > 0 ? Math.round(done / steps.length * 100) : 0
            return (
              <div key={p.id}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:10, height:10, borderRadius:2, background:p.color, flexShrink:0 }} />
                    <span style={{ fontSize:13, color:C.text }}>{p.name}</span>
                  </div>
                  <span style={{ fontSize:12, color:p.color, fontWeight:600 }}>{pct}%</span>
                </div>
                <div style={{ background:'#1e2d42', borderRadius:4, height:6, overflow:'hidden' }}>
                  <div style={{ width:`${pct}%`, height:'100%', background:p.color, transition:'width 0.4s ease', borderRadius:4 }} />
                </div>
                <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>
                  {done} completados · {steps.filter(s => s.status === 'progreso').length} en progreso · {steps.filter(s => s.status === 'pendiente').length} pendientes
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent activity */}
      {recent.length > 0 && (
        <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:10, padding:'20px' }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:14 }}>Actividad reciente</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {recent.map(s => (
              <div key={s.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 12px',
                background:C.bg, borderRadius:7, border:`1px solid ${C.border}` }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:statusColor[s.status], flexShrink:0 }} />
                <span style={{ fontSize:13, color:C.text, flex:1, minWidth:0,
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.title}</span>
                <span style={{ fontSize:11, color:statusColor[s.status], fontWeight:600, flexShrink:0 }}>
                  {statusLabel[s.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
