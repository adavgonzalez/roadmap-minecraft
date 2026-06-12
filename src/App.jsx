import { useState, useEffect } from 'react'
import { db } from './db'
import { seedIfEmpty } from './seed'
import { ProjectModal } from './Modals'
import { useIsMobile } from './hooks'
import RoadmapView  from './RoadmapView'
import ProgressView from './ProgressView'
import BuildsView   from './BuildsView'
import TimelineView from './TimelineView'

const C = { bg:'#080d16', panel:'#0d1520', border:'#1c2d42', text:'#f0f4fa', muted:'#5a7190', accent:'#3b82f6' }
const MC = "'VT323', monospace"

/* ── MC Icon helper ── */
const McIcon = ({ name, size = '', style = {} }) => (
  <i className={`mc mc-${name}${size ? ` mc-${size}` : ''}`}
     style={{ display:'inline-block', imageRendering:'pixelated', flexShrink:0, ...style }} />
)

/* ── XP-style progress bar ── */
function XPBar({ pct, color, h = 8 }) {
  const isGreen = !color
  return isGreen ? (
    <div className="xp-bar-track" style={{ height:h }}>
      <div className="xp-bar-fill" style={{ width:`${Math.min(100,pct)}%` }} />
    </div>
  ) : (
    <div style={{ height:h, background:'#111', borderRadius:1, overflow:'hidden',
      boxShadow:'inset 0 0 0 1px rgba(0,0,0,0.8)' }}>
      <div style={{ width:`${Math.min(100,pct)}%`, height:'100%', background:color,
        boxShadow:`0 0 8px ${color}55`, transition:'width 0.5s ease', borderRadius:1 }} />
    </div>
  )
}

/* ── Sidebar ── */
function Sidebar({ projects, activeId, onSelect, onAdd, mobile, open, onClose }) {
  const overlay = mobile
    ? { position:'fixed', top:0, left:0, height:'100%', zIndex:500,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition:'transform 0.25s ease', boxShadow:'6px 0 32px rgba(0,0,0,0.8)' }
    : {}

  return (
    <>
      {mobile && open && (
        <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:499,
          background:'rgba(0,0,0,0.7)', backdropFilter:'blur(2px)' }} />
      )}
      <div style={{ width:230, flexShrink:0, background:C.panel,
        borderRight:`1px solid ${C.border}`,
        display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', ...overlay }}>

        {/* Logo */}
        <div style={{ padding:'16px 14px', borderBottom:`1px solid ${C.border}`,
          background:'linear-gradient(180deg, #0f1e30 0%, #0d1520 100%)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <McIcon name="filled-map" size="xl" />
              <div>
                <div style={{ fontFamily:MC, fontSize:22, color:'#f0f4fa', lineHeight:1,
                  textShadow:'1px 1px 0 #000, 0 0 12px #3b82f644' }}>
                  MC Manager
                </div>
                <div style={{ fontSize:10, color:C.muted, marginTop:1 }}>Roadmap & Builds</div>
              </div>
            </div>
            {mobile && (
              <button onClick={onClose}
                style={{ background:'none', border:'none', color:C.muted, fontSize:18, cursor:'pointer' }}>✕</button>
            )}
          </div>
        </div>

        {/* Projects list */}
        <div style={{ flex:1, overflowY:'auto', padding:'8px 7px' }}>
          <div style={{ fontSize:10, fontFamily:MC, color:C.muted, padding:'6px 8px 4px',
            letterSpacing:'0.1em', opacity:0.7 }}>PROYECTOS</div>

          {projects.map(p => {
            const allS = p.phases?.flatMap(ph => ph.steps || []) || []
            const pct  = allS.length > 0 ? Math.round(allS.filter(s => s.status==='completado').length / allS.length * 100) : 0
            const active = p.id === activeId
            return (
              <div key={p.id} onClick={() => { onSelect(p.id); if (mobile) onClose() }}
                style={{ padding:'9px 10px', borderRadius:6, cursor:'pointer', marginBottom:3,
                  transition:'all 0.15s',
                  background: active ? 'rgba(59,130,246,0.12)' : 'transparent',
                  border: active ? `1px solid ${p.color}40` : '1px solid transparent' }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background='rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background='transparent' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:16, flexShrink:0 }}>{p.emoji}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:600,
                      color: active ? C.text : '#8fa3b8',
                      whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize:10, color:C.muted, marginTop:1 }}>
                      {pct}% · {allS.length} pasos
                    </div>
                  </div>
                  {active && <div style={{ width:3, height:18, background:p.color, borderRadius:2, flexShrink:0 }} />}
                </div>
                <div style={{ marginTop:5 }}>
                  <XPBar pct={pct} color={p.color} h={3} />
                </div>
              </div>
            )
          })}

          {projects.length === 0 && (
            <div style={{ padding:'20px 8px', textAlign:'center', color:C.muted, fontSize:12 }}>
              Sin proyectos
            </div>
          )}
        </div>

        <div style={{ padding:'10px 8px', borderTop:`1px solid ${C.border}` }}>
          <button onClick={onAdd}
            style={{ width:'100%', padding:'8px', background:'rgba(59,130,246,0.12)',
              border:'1px solid rgba(59,130,246,0.3)', borderRadius:6,
              color:'#60a5fa', fontSize:12, fontWeight:600, cursor:'pointer',
              fontFamily:MC, fontSize:16, letterSpacing:'0.05em',
              transition:'all 0.15s', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(59,130,246,0.2)'; e.currentTarget.style.borderColor='rgba(59,130,246,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(59,130,246,0.12)'; e.currentTarget.style.borderColor='rgba(59,130,246,0.3)' }}>
            <McIcon name="crafting-table" size="sm" /> Nuevo Proyecto
          </button>
        </div>
      </div>
    </>
  )
}

/* ── Tab bar ── */
function TabBar({ active, onChange, project, mobile, onMenuOpen }) {
  const tabs = [
    { id:'roadmap',  label:'Roadmap',        icon:'book'          },
    { id:'progress', label:'Progreso',        icon:'clock'         },
    { id:'builds',   label:'Construcciones',  icon:'crafting-table'},
    { id:'timeline', label:'Timeline',        icon:'compass'       },
  ]
  return (
    <div style={{ background:C.panel, borderBottom:`1px solid ${C.border}`, flexShrink:0,
      backgroundImage:'linear-gradient(180deg, #0f1e30 0%, #0d1520 100%)' }}>
      <div style={{ display:'flex', alignItems:'center',
        padding: mobile ? '0 10px' : '0 20px', gap: mobile ? 6 : 12 }}>

        {mobile && (
          <button onClick={onMenuOpen}
            style={{ background:'none', border:'none', color:C.muted, fontSize:20,
              cursor:'pointer', padding:'14px 4px 14px 0', flexShrink:0, lineHeight:1 }}>☰</button>
        )}

        {/* Project name */}
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 0',
          borderRight:`1px solid ${C.border}`, paddingRight: mobile ? 10 : 16,
          marginRight: mobile ? 0 : 4, minWidth:0,
          flex: mobile ? 1 : 'none', maxWidth: mobile ? undefined : 230 }}>
          <span style={{ fontSize: mobile ? 18 : 20, flexShrink:0 }}>{project.emoji}</span>
          <div style={{ minWidth:0 }}>
            <div style={{ fontFamily:MC, fontSize: mobile ? 16 : 18, color:C.text, lineHeight:1,
              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {project.name}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:0 }}>
          {tabs.map(t => {
            const isActive = active === t.id
            return (
              <button key={t.id} onClick={() => onChange(t.id)}
                style={{ display:'flex', alignItems:'center', gap: mobile ? 0 : 6,
                  padding: mobile ? '12px 10px 10px' : '12px 14px 10px',
                  background:'none', border:'none', cursor:'pointer',
                  borderBottom: isActive ? `2px solid ${project.color}` : '2px solid transparent',
                  transition:'all 0.15s' }}>
                <McIcon name={t.icon} size="sm"
                  style={{ opacity: isActive ? 1 : 0.4, transition:'opacity 0.15s' }} />
                {!mobile && (
                  <span style={{ fontFamily:MC, fontSize:16, letterSpacing:'0.05em',
                    color: isActive ? C.text : C.muted, transition:'color 0.15s' }}>
                    {t.label}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── Project header ── */
function ProjectHeader({ project, phases, onProjectUpdated, onProjectDeleted, mobile }) {
  const [editing, setEditing] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const allSteps  = phases.flatMap(p => p.steps || [])
  const total     = allSteps.length
  const completed = allSteps.filter(s => s.status === 'completado').length
  const inProg    = allSteps.filter(s => s.status === 'progreso').length
  const pct       = total > 0 ? Math.round(completed / total * 100) : 0

  async function handleEdit(fields) {
    const { data } = await db.projects.update(project.id, fields)
    if (data) onProjectUpdated(data)
  }
  async function handleDelete() {
    await db.projects.delete(project.id)
    onProjectDeleted(project.id)
  }

  return (
    <>
      <div style={{ background:C.panel, border:`1px solid ${C.border}`,
        borderTop:`3px solid ${project.color}`, borderRadius:10,
        padding: mobile ? '14px 16px' : '18px 22px', marginBottom: mobile ? 14 : 20,
        backgroundImage:'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10 }}>
          <div style={{ minWidth:0 }}>
            <h1 style={{ margin:0, fontFamily:MC, fontSize: mobile ? 22 : 26, color:C.text,
              display:'flex', alignItems:'center', gap:8, letterSpacing:'0.03em',
              textShadow:'1px 1px 0 #000' }}>
              <span style={{ fontSize: mobile ? 20 : 24 }}>{project.emoji}</span>
              {project.name}
            </h1>
            {project.description && !mobile && (
              <p style={{ margin:'4px 0 0', fontSize:13, color:C.muted }}>{project.description}</p>
            )}
          </div>
          <div style={{ display:'flex', gap:4, alignItems:'center' }}>
            {confirm ? (
              <div style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 8px',
                background:'#2d1010', borderRadius:6, border:'1px solid #7f1d1d' }}>
                <span style={{ fontSize:11, color:'#fca5a5' }}>¿Eliminar?</span>
                <button onClick={handleDelete} style={{ background:'#7f1d1d', color:'#fca5a5', border:'none', borderRadius:4, padding:'3px 8px', fontSize:11, cursor:'pointer', fontWeight:600 }}>Sí</button>
                <button onClick={() => setConfirm(false)} style={{ background:'#1c2b3f', color:'#94a3b8', border:'none', borderRadius:4, padding:'3px 8px', fontSize:11, cursor:'pointer' }}>No</button>
              </div>
            ) : (
              <>
                <button onClick={() => setEditing(true)}
                  style={{ background:'none', border:'none', cursor:'pointer', color:C.muted,
                    padding:'4px 8px', fontSize:13, borderRadius:4, transition:'color 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.color='#94a3b8'}
                  onMouseLeave={e => e.currentTarget.style.color=C.muted}>
                  {mobile ? '✏️' : '✏️ Editar'}
                </button>
                <button onClick={() => setConfirm(true)}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444',
                    padding:'4px 8px', fontSize:13, borderRadius:4, transition:'color 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.color='#f87171'}
                  onMouseLeave={e => e.currentTarget.style.color='#ef4444'}>
                  {mobile ? '🗑' : '🗑 Eliminar'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stat pills */}
        <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
          {[
            { v:completed, l:'Completados', c:'#4ade80', icon:'emerald'     },
            { v:inProg,    l:'En Progreso', c:'#fbbf24', icon:'gold-ingot'  },
            { v:total-completed-inProg, l:'Pendientes', c:C.muted, icon:'cobblestone' },
            { v:total,     l:'Total',       c:'#60a5fa', icon:'book'        },
          ].map(({ v, l, c, icon }) => (
            <div key={l} style={{ background:'rgba(0,0,0,0.3)', borderRadius:6,
              padding: mobile ? '6px 10px' : '8px 14px',
              border:`1px solid ${C.border}`, textAlign:'center', flex:'1 1 60px', minWidth:60 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4, marginBottom:2 }}>
                <McIcon name={icon} size="sm" style={{ opacity:0.8 }} />
                <span style={{ fontSize: mobile ? 16 : 20, fontWeight:700, color:c, fontFamily:MC }}>{v}</span>
              </div>
              <div style={{ fontSize: mobile ? 9 : 10, color:C.muted }}>{l}</div>
            </div>
          ))}
        </div>

        {/* XP-style progress bar */}
        <div style={{ marginTop:14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12,
            color:C.muted, marginBottom:5, fontFamily:MC, letterSpacing:'0.05em' }}>
            <span style={{ fontSize:14 }}>{completed}/{total} completados</span>
            <span style={{ color:C.text, fontSize:16 }}>{pct}%</span>
          </div>
          <XPBar pct={pct} h={10} />
        </div>
      </div>
      {editing && <ProjectModal project={project} onSave={handleEdit} onClose={() => setEditing(false)} />}
    </>
  )
}

/* ── App root ── */
export default function App() {
  const [projects,    setProjects]    = useState([])
  const [activeId,    setActiveId]    = useState(null)
  const [phases,      setPhases]      = useState([])
  const [builds,      setBuilds]      = useState([])
  const [tab,         setTab]         = useState('roadmap')
  const [loading,     setLoading]     = useState(true)
  const [newProject,  setNewProject]  = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    (async () => {
      await seedIfEmpty()
      const { data: projs } = await db.projects.list()
      const list = projs || []
      setProjects(list)
      if (list.length > 0) setActiveId(list[0].id)
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    if (!activeId) return
    setPhases([]); setBuilds([]);
    (async () => {
      const [{ data: ph }, { data: bu }] = await Promise.all([
        db.phases.list(activeId), db.builds.list(activeId),
      ])
      setPhases(ph || []); setBuilds(bu || [])
    })()
  }, [activeId])

  const activeProject = projects.find(p => p.id === activeId) || null

  async function handleAddProject(fields) {
    const { data } = await db.projects.insert(fields)
    if (data) { setProjects(prev => [...prev, data]); setActiveId(data.id) }
    setNewProject(false)
  }
  function handleProjectUpdated(updated) {
    setProjects(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p))
  }
  function handleProjectDeleted(id) {
    const remaining = projects.filter(p => p.id !== id)
    setProjects(remaining); setActiveId(remaining[0]?.id || null)
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', background:C.bg, color:C.muted, fontSize:14, gap:12,
      flexDirection:'column' }}>
      <McIcon name="clock" size="3xl" />
      <span style={{ fontFamily:MC, fontSize:20, letterSpacing:'0.1em' }}>Cargando...</span>
    </div>
  )

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:C.bg, color:C.text }}>
      <Sidebar
        projects={projects} activeId={activeId}
        onSelect={id => { setActiveId(id); setTab('roadmap') }}
        onAdd={() => setNewProject(true)}
        mobile={isMobile} open={sidebarOpen} onClose={() => setSidebarOpen(false)}
      />

      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden',
        width: isMobile ? '100%' : undefined }}>
        {activeProject ? (
          <>
            <TabBar active={tab} onChange={setTab} project={activeProject}
              mobile={isMobile} onMenuOpen={() => setSidebarOpen(true)} />
            <div style={{ flex:1, overflowY:'auto', padding: isMobile ? '12px 14px' : '20px 24px' }}>
              <ProjectHeader project={activeProject} phases={phases} mobile={isMobile}
                onProjectUpdated={handleProjectUpdated} onProjectDeleted={handleProjectDeleted} />
              {tab === 'roadmap'  && <RoadmapView  phases={phases}  projectId={activeId} onPhasesChange={setPhases} />}
              {tab === 'progress' && <ProgressView phases={phases}  mobile={isMobile} />}
              {tab === 'builds'   && <BuildsView   builds={builds}  projectId={activeId} onBuildsChange={setBuilds} mobile={isMobile} />}
              {tab === 'timeline' && <TimelineView phases={phases}  onPhasesChange={setPhases} mobile={isMobile} />}
            </div>
          </>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
            justifyContent:'center', height:'100%', gap:16, color:C.muted, textAlign:'center', padding:20 }}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)}
                style={{ position:'absolute', top:16, left:16, background:'none', border:'none',
                  color:C.muted, fontSize:22, cursor:'pointer' }}>☰</button>
            )}
            <McIcon name="filled-map" size="5xl" />
            <p style={{ fontFamily:MC, fontSize:22, margin:0, letterSpacing:'0.05em' }}>
              Crea tu primer proyecto
            </p>
            <button onClick={() => setNewProject(true)}
              style={{ background:'rgba(59,130,246,0.2)', color:'#60a5fa',
                border:'1px solid rgba(59,130,246,0.4)', borderRadius:7,
                padding:'10px 24px', fontFamily:MC, fontSize:20, cursor:'pointer',
                letterSpacing:'0.05em', transition:'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(59,130,246,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(59,130,246,0.2)' }}>
              + Nuevo Proyecto
            </button>
          </div>
        )}
      </div>

      {newProject && <ProjectModal onSave={handleAddProject} onClose={() => setNewProject(false)} />}
    </div>
  )
}
