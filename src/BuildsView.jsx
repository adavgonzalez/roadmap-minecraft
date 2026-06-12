import { useState } from 'react'
import { db } from './db'
import { BuildModal } from './Modals'

const C = { bg:'#080d16', panel:'#0d1520', card:'#111f30', border:'#1c2d42', text:'#f0f4fa', muted:'#5a7190' }
const MC_FONT = "'VT323', monospace"

const DIM = {
  overworld: { label:'Overworld', icon:'grass-block',  color:'#4ade80', bg:'#0a1f10' },
  nether:    { label:'Nether',    icon:'netherrack',   color:'#f87171', bg:'#1f0a0a' },
  end:       { label:'End',       icon:'end-stone',    color:'#c084fc', bg:'#160a2b' },
}

const STATUS = {
  planeado:     { label:'Planeado',     color:'#7dd3fc', bg:'#0a1830' },
  construyendo: { label:'Construyendo', color:'#fbbf24', bg:'#1f1408' },
  terminado:    { label:'Terminado',    color:'#4ade80', bg:'#0a1f10' },
}

const McIcon = ({ name, size = '' }) => (
  <i className={`mc mc-${name}${size ? ` mc-${size}` : ''}`}
     style={{ display:'inline-block', imageRendering:'pixelated', flexShrink:0 }} />
)

function BuildCard({ build, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [hover,   setHover]   = useState(false)
  const [imgZoom, setImgZoom] = useState(false)

  const dim = DIM[build.dimension] || DIM.overworld
  const sta = STATUS[build.status] || STATUS.planeado

  async function handleEdit(fields) {
    const { data } = await db.builds.update(build.id, fields)
    if (data) onUpdated(data)
  }

  async function handleDelete() {
    if (build.image_url) await db.storage.remove(build.image_url)
    await db.builds.delete(build.id)
    onDeleted(build.id)
  }

  return (
    <>
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setConfirm(false) }}
        style={{ background: hover ? '#1c2d42' : C.card, border:`1px solid ${hover ? '#2a3f58' : C.border}`,
          borderTop:`3px solid ${dim.color}`, borderRadius:10,
          transition:'background 0.15s, border-color 0.15s', overflow:'hidden', position:'relative' }}>

        {/* Image */}
        {build.image_url && (
          <div style={{ position:'relative', cursor:'zoom-in' }} onClick={() => setImgZoom(true)}>
            <img src={build.image_url} alt={build.name}
              style={{ width:'100%', height:160, objectFit:'cover', display:'block' }} />
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 60%, rgba(9,14,22,0.8))',
              pointerEvents:'none' }} />
            <span style={{ position:'absolute', bottom:7, right:9, fontSize:10, color:'rgba(255,255,255,0.5)',
              background:'rgba(0,0,0,0.4)', padding:'1px 6px', borderRadius:3, backdropFilter:'blur(4px)' }}>
              🔍 ampliar
            </span>
          </div>
        )}

        <div style={{ padding:'14px 15px' }}>
          {/* Header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
              <McIcon name={dim.icon} size="xl" />
              <span style={{ fontFamily:MC_FONT, fontSize:18, color:C.text, lineHeight:1.2,
                textShadow:'1px 1px 0 #000' }}>{build.name}</span>
            </div>
            {hover && !confirm && (
              <div style={{ display:'flex', gap:2, flexShrink:0 }}>
                <button onClick={() => setEditing(true)}
                  style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, padding:'2px 5px', fontSize:13 }}
                  onMouseEnter={e => e.currentTarget.style.color='#94a3b8'}
                  onMouseLeave={e => e.currentTarget.style.color=C.muted}>✏️</button>
                <button onClick={() => setConfirm(true)}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444', padding:'2px 5px', fontSize:13 }}
                  onMouseEnter={e => e.currentTarget.style.color='#f87171'}
                  onMouseLeave={e => e.currentTarget.style.color='#ef4444'}>🗑</button>
              </div>
            )}
            {confirm && (
              <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                <button onClick={handleDelete}
                  style={{ background:'#7f1d1d', color:'#fca5a5', border:'none', borderRadius:4, padding:'3px 8px', fontSize:11, cursor:'pointer', fontWeight:600 }}>Sí</button>
                <button onClick={() => setConfirm(false)}
                  style={{ background:'#1c2b3f', color:'#94a3b8', border:'none', borderRadius:4, padding:'3px 8px', fontSize:11, cursor:'pointer' }}>No</button>
              </div>
            )}
          </div>

          {/* Badges */}
          <div style={{ display:'flex', gap:6, marginBottom: build.description ? 10 : 0, flexWrap:'wrap' }}>
            <span style={{ display:'flex', alignItems:'center', gap:5,
              padding:'3px 8px', borderRadius:4, fontSize:12, fontWeight:600,
              background:dim.bg, color:dim.color, border:`1px solid ${dim.color}30` }}>
              <McIcon name={dim.icon} size="sm" /> {dim.label}
            </span>
            <span style={{ display:'flex', alignItems:'center', gap:5,
              padding:'3px 8px', borderRadius:4, fontSize:12, fontWeight:600,
              background:sta.bg, color:sta.color, border:`1px solid ${sta.color}30` }}>
              {build.status === 'planeado' ? <McIcon name="map" size="sm" /> :
               build.status === 'construyendo' ? <McIcon name="crafting-table" size="sm" /> :
               <McIcon name="emerald" size="sm" />} {sta.label}
            </span>
          </div>

          {build.description && (
            <p style={{ fontSize:13, color:C.muted, lineHeight:1.5, marginBottom:8 }}>{build.description}</p>
          )}

          {build.coordinates && (
            <div style={{ fontSize:12, color:'#60a5fa', display:'flex', alignItems:'center', gap:4, marginBottom: build.notes ? 6 : 0 }}>
              <span>📍</span><span style={{ fontFamily:'monospace' }}>{build.coordinates}</span>
            </div>
          )}

          {build.notes && (
            <div style={{ fontSize:12, color:C.muted, paddingTop:8, borderTop:`1px solid ${C.border}`,
              fontStyle:'italic', lineHeight:1.4, marginTop:6 }}>
              {build.notes}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {imgZoom && (
        <div onClick={() => setImgZoom(false)}
          style={{ position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,0.92)',
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'zoom-out', padding:20 }}>
          <img src={build.image_url} alt={build.name}
            style={{ maxWidth:'90vw', maxHeight:'88vh', objectFit:'contain', borderRadius:8,
              boxShadow:'0 0 80px rgba(0,0,0,0.8)' }} />
          <div style={{ position:'absolute', top:16, right:20, color:'rgba(255,255,255,0.5)', fontSize:13 }}>
            ESC / click para cerrar
          </div>
        </div>
      )}

      {editing && <BuildModal build={build} onSave={handleEdit} onClose={() => setEditing(false)} />}
    </>
  )
}

export default function BuildsView({ builds, projectId, onBuildsChange, mobile }) {
  const [filter,    setFilter]    = useState('all')
  const [addBuild,  setAddBuild]  = useState(false)
  const [statusF,   setStatusF]   = useState('all')

  const filtered = builds.filter(b => {
    const dimOk    = filter   === 'all' || b.dimension === filter
    const statOk   = statusF  === 'all' || b.status    === statusF
    return dimOk && statOk
  })

  async function handleAdd(fields) {
    const { data } = await db.builds.insert({ ...fields, project_id: projectId })
    if (data) onBuildsChange([...builds, data])
  }

  function updateBuild(updated) {
    onBuildsChange(builds.map(b => b.id === updated.id ? updated : b))
  }

  function deleteBuild(id) {
    onBuildsChange(builds.filter(b => b.id !== id))
  }

  const filterBtn = (val, label, active) => (
    <button onClick={() => setFilter(val)}
      style={{ padding:'5px 12px', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer', border:'none', transition:'all 0.15s',
        background: active ? '#1d4ed8' : C.panel, color: active ? '#fff' : C.muted,
        outline: active ? 'none' : `1px solid ${C.border}` }}>
      {label}
    </button>
  )

  const statusBtn = (val, label, active) => (
    <button onClick={() => setStatusF(val)}
      style={{ padding:'5px 12px', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer', border:'none', transition:'all 0.15s',
        background: active ? '#172030' : 'transparent', color: active ? C.text : C.muted,
        outline: active ? `1px solid ${C.border}` : 'none' }}>
      {label}
    </button>
  )

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display:'flex', flexDirection: mobile ? 'column' : 'row',
        justifyContent:'space-between', gap:10, marginBottom:16 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {/* Dimension filter — horizontal scroll on mobile */}
          <div style={{ display:'flex', gap:4, overflowX:'auto', paddingBottom:2 }}>
            {filterBtn('all',       '🌍 Todas',     filter==='all')}
            {filterBtn('overworld', '🌿 Overworld', filter==='overworld')}
            {filterBtn('nether',    '🔥 Nether',    filter==='nether')}
            {filterBtn('end',       '🌌 End',       filter==='end')}
          </div>
          {/* Status filter */}
          <div style={{ display:'flex', gap:4, overflowX:'auto', paddingBottom:2 }}>
            {statusBtn('all',          'Todos',           statusF==='all')}
            {statusBtn('planeado',     '🗺️ Planeado',     statusF==='planeado')}
            {statusBtn('construyendo', '🏗️ Construyendo',  statusF==='construyendo')}
            {statusBtn('terminado',    '✅ Terminado',    statusF==='terminado')}
          </div>
        </div>
        <button onClick={() => setAddBuild(true)}
          style={{ background:'#1d4ed8', color:'#fff', border:'none', borderRadius:7,
            padding:'9px 16px', fontSize:13, fontWeight:600, cursor:'pointer',
            flexShrink:0, alignSelf: mobile ? 'stretch' : 'flex-start',
            transition:'filter 0.15s', textAlign:'center' }}
          onMouseEnter={e => e.currentTarget.style.filter='brightness(1.2)'}
          onMouseLeave={e => e.currentTarget.style.filter='brightness(1)'}>
          + Nueva Construcción
        </button>
      </div>

      {/* Stats row */}
      {builds.length > 0 && (
        <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
          {[
            { v: builds.length,                                      l:'Total',        c:'#3b82f6' },
            { v: builds.filter(b=>b.status==='terminado').length,    l:'Terminadas',   c:'#10b981' },
            { v: builds.filter(b=>b.status==='construyendo').length, l:'En obra',      c:'#f59e0b' },
            { v: builds.filter(b=>b.status==='planeado').length,     l:'Planeadas',    c:'#5a7190' },
          ].map(({ v, l, c }) => (
            <div key={l} style={{ background:C.panel, borderRadius:8, padding:'8px 16px',
              border:`1px solid ${C.border}`, textAlign:'center', flex:1, minWidth:80 }}>
              <div style={{ fontSize:20, fontWeight:700, color:c, lineHeight:1 }}>{v}</div>
              <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:14 }}>
          {filtered.map(b => (
            <BuildCard key={b.id} build={b} onUpdated={updateBuild} onDeleted={deleteBuild} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign:'center', padding:'48px 20px', color:C.muted,
          border:`1px dashed ${C.border}`, borderRadius:12 }}>
          <div style={{ fontSize:36, marginBottom:8 }}>🏗️</div>
          <div style={{ marginBottom:10 }}>
            {builds.length === 0 ? 'Sin construcciones registradas todavía' : 'Sin resultados para ese filtro'}
          </div>
          {builds.length === 0 && (
            <button onClick={() => setAddBuild(true)}
              style={{ background:'#1d4ed8', color:'#fff', border:'none', borderRadius:6,
                padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              Registrar primera construcción
            </button>
          )}
        </div>
      )}

      {addBuild && <BuildModal onSave={handleAdd} onClose={() => setAddBuild(false)} />}
    </div>
  )
}
