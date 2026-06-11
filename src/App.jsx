import { useState, useEffect } from 'react'
import { db } from './db'
import { seedIfEmpty } from './seed'
import { ProjectModal } from './Modals'
import RoadmapView  from './RoadmapView'
import ProgressView from './ProgressView'
import BuildsView   from './BuildsView'

const C = { bg:'#080d16', panel:'#0f1724', border:'#1c2b3f', text:'#f0f4fa', muted:'#5a7190' }

function Sidebar({ projects, activeId, onSelect, onAdd }) {
  return (
    <div style={{ width:230, flexShrink:0, background:C.panel, borderRight:`1px solid ${C.border}`,
      display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      <div style={{ padding:'18px 16px 14px', borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:20 }}>🗺️</span>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:C.text, lineHeight:1 }}>MC Manager</div>
            <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>Roadmap & Construcciones</div>
          </div>
        </div>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'8px 7px' }}>
        <div style={{ fontSize:10, fontWeight:600, color:C.muted, padding:'6px 8px 4px', textTransform:'uppercase', letterSpacing:'0.08em' }}>
          Proyectos
        </div>
        {projects.map(p => {
          const active = p.id === activeId
          return (
            <div key={p.id} onClick={() => onSelect(p.id)}
              style={{ padding:'9px 10px', borderRadius:8, cursor:'pointer', marginBottom:3, transition:'background 0.15s',
                background: active ? '#152135' : 'transparent',
                border: active ? `1px solid ${p.color}30` : '1px solid transparent' }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background='#131d2c' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background='transparent' }}>
              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                <span style={{ fontSize:16, flexShrink:0 }}>{p.emoji}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:600, color: active ? C.text : '#8fa3b8',
                    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize:10, color:C.muted, marginTop:1 }}>{p.description?.slice(0,30) || '—'}</div>
                </div>
                {active && <div style={{ width:3, height:18, background:p.color, borderRadius:2, flexShrink:0 }} />}
              </div>
            </div>
          )
        })}
        {projects.length === 0 && (
          <div style={{ padding:'16px 8px', textAlign:'center', color:C.muted, fontSize:12 }}>Sin proyectos</div>
        )}
      </div>
      <div style={{ padding:'10px 8px', borderTop:`1px solid ${C.border}` }}>
        <button onClick={onAdd}
          style={{ width:'100%', padding:'8px', background:'#142032', border:'1px solid #1e3352',
            borderRadius:7, color:'#60a5fa', fontSize:12, fontWeight:600, cursor:'pointer', transition:'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background='#192840'}
          onMouseLeave={e => e.currentTarget.style.background='#142032'}>
          + Nuevo Proyecto
        </button>
      </div>
    </div>
  )
}

function TabBar({ active, onChange, project }) {
  const tabs = [
    { id:'roadmap',  label:'📋 Roadmap' },
    { id:'progress', label:'📊 Progreso' },
    { id:'builds',   label:'🏗️ Construcciones' },
  ]
  return (
    <div style={{ background:C.panel, borderBottom:`1px solid ${C.border}`, padding:'0 24px',
      display:'flex', alignItems:'center', gap:16, flexShrink:0 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'14px 0',
        borderRight:`1px solid ${C.border}`, paddingRight:16, marginRight:4 }}>
        <span style={{ fontSize:18 }}>{project.emoji}</span>
        <span style={{ fontSize:14, fontWeight:700, color:C.text, maxWidth:180,
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{project.name}</span>
      </div>
      <div style={{ display:'flex', gap:2 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => onChange(t.id)}
            style={{ padding:'14px 14px 12px', background:'none', border:'none', cursor:'pointer',
              fontSize:13, fontWeight:600, transition:'color 0.15s',
              color: active === t.id ? C.text : C.muted,
              borderBottom: active === t.id ? `2px solid ${project.color}` : '2px solid transparent' }}>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function ProjectHeader({ project, phases, onProjectUpdated, onProjectDeleted }) {
  const [editing, setEditing] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const allSteps  = phases.flatMap(p => p.steps || [])
  const total     = allSteps.length
  const completed = allSteps.filter(s => s.status === 'completado').length
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
      <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderTop:`3px solid ${project.color}`,
        borderRadius:12, padding:'18px 22px', marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ margin:0, fontSize:18, fontWeight:800, color:C.text, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:20 }}>{project.emoji}</span>{project.name}
            </h1>
            {project.description && <p style={{ margin:'4px 0 0', fontSize:13, color:C.muted }}>{project.description}</p>}
          </div>
          <div style={{ display:'flex', gap:4, alignItems:'center' }}>
            {confirm ? (
              <div style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 8px', background:'#2d1010', borderRadius:6, border:'1px solid #7f1d1d' }}>
                <span style={{ fontSize:11, color:'#fca5a5' }}>¿Eliminar proyecto?</span>
                <button onClick={handleDelete} style={{ background:'#7f1d1d', color:'#fca5a5', border:'none', borderRadius:4, padding:'3px 8px', fontSize:11, cursor:'pointer', fontWeight:600 }}>Sí</button>
                <button onClick={() => setConfirm(false)} style={{ background:'#1c2b3f', color:'#94a3b8', border:'none', borderRadius:4, padding:'3px 8px', fontSize:11, cursor:'pointer' }}>No</button>
              </div>
            ) : (
              <>
                <button onClick={() => setEditing(true)}
                  style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, padding:'4px 8px', fontSize:13, borderRadius:4, transition:'color 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.color='#94a3b8'}
                  onMouseLeave={e => e.currentTarget.style.color=C.muted}>✏️ Editar</button>
                <button onClick={() => setConfirm(true)}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444', padding:'4px 8px', fontSize:13, borderRadius:4, transition:'color 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.color='#f87171'}
                  onMouseLeave={e => e.currentTarget.style.color='#ef4444'}>🗑 Eliminar</button>
              </>
            )}
          </div>
        </div>
        <div style={{ marginTop:14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:C.muted, marginBottom:5 }}>
            <span>{completed}/{total} pasos completados</span>
            <span style={{ color:C.text, fontWeight:700 }}>{pct}%</span>
          </div>
          <div style={{ background:'#1e2d42', borderRadius:6, height:8, overflow:'hidden' }}>
            <div style={{ width:`${pct}%`, height:'100%', background:project.color, borderRadius:6, transition:'width 0.4s ease' }} />
          </div>
        </div>
      </div>
      {editing && <ProjectModal project={project} onSave={handleEdit} onClose={() => setEditing(false)} />}
    </>
  )
}

export default function App() {
  const [projects,   setProjects]   = useState([])
  const [activeId,   setActiveId]   = useState(null)
  const [phases,     setPhases]     = useState([])
  const [builds,     setBuilds]     = useState([])
  const [tab,        setTab]        = useState('roadmap')
  const [loading,    setLoading]    = useState(true)
  const [newProject, setNewProject] = useState(false)

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
    setPhases([])
    setBuilds([]);
    (async () => {
      const [{ data: ph }, { data: bu }] = await Promise.all([
        db.phases.list(activeId),
        db.builds.list(activeId),
      ])
      setPhases(ph || [])
      setBuilds(bu || [])
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
    setProjects(remaining)
    setActiveId(remaining[0]?.id || null)
  }

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
        height:'100vh', background:C.bg, color:C.muted, fontSize:14, gap:10 }}>
        <span style={{ fontSize:20 }}>⏳</span> Cargando…
      </div>
    )
  }

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:C.bg, color:C.text }}>
      <Sidebar
        projects={projects} activeId={activeId}
        onSelect={id => { setActiveId(id); setTab('roadmap') }}
        onAdd={() => setNewProject(true)}
      />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {activeProject ? (
          <>
            <TabBar active={tab} onChange={setTab} project={activeProject} />
            <div style={{ flex:1, overflowY:'auto', padding:'22px 24px' }}>
              <ProjectHeader project={activeProject} phases={phases}
                onProjectUpdated={handleProjectUpdated} onProjectDeleted={handleProjectDeleted} />
              {tab === 'roadmap'  && <RoadmapView  phases={phases}  projectId={activeId} onPhasesChange={setPhases} />}
              {tab === 'progress' && <ProgressView phases={phases} />}
              {tab === 'builds'   && <BuildsView   builds={builds}  projectId={activeId} onBuildsChange={setBuilds} />}
            </div>
          </>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            height:'100%', gap:12, color:C.muted, textAlign:'center' }}>
            <span style={{ fontSize:48 }}>🗺️</span>
            <p style={{ fontSize:15, margin:0 }}>Crea tu primer proyecto para empezar</p>
            <button onClick={() => setNewProject(true)}
              style={{ background:'#1d4ed8', color:'#fff', border:'none', borderRadius:7,
                padding:'10px 20px', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              + Nuevo Proyecto
            </button>
          </div>
        )}
      </div>
      {newProject && <ProjectModal onSave={handleAddProject} onClose={() => setNewProject(false)} />}
    </div>
  )
}
