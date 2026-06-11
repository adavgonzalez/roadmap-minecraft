import { useState } from 'react'

const C = { bg: '#080d16', panel: '#0f1724', border: '#1c2b3f', text: '#f0f4fa', muted: '#5a7190' }
const COLORS = ['#10b981','#3b82f6','#ef4444','#f59e0b','#a855f7','#06b6d4','#ec4899','#f97316']
const EMOJIS = ['🛠️','🚀','🎮','⚡','🔥','🌟','🎯','💡','🏗️','📦','🔬','🎲','🌌','💎','🏆','⚔️','🧪','🌿','🦄','🎪']

const inp = {
  width:'100%', background:C.bg, border:`1px solid ${C.border}`, color:C.text,
  borderRadius:6, padding:'8px 12px', fontSize:14, outline:'none', boxSizing:'border-box',
  fontFamily:'inherit',
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ fontSize: 12, color: C.muted, marginBottom: 4, fontWeight: 500 }}>{label}</div>}
      {children}
    </div>
  )
}
function Inp({ label, value, onChange, placeholder }) {
  return <Field label={label}><input value={value} onChange={onChange} placeholder={placeholder} style={inp}
    onFocus={e => e.target.style.borderColor='#3b82f6'} onBlur={e => e.target.style.borderColor=C.border}/></Field>
}
function Textarea({ label, value, onChange, placeholder, rows = 3 }) {
  return <Field label={label}><textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
    style={{ ...inp, resize:'vertical', lineHeight:1.55 }}
    onFocus={e => e.target.style.borderColor='#3b82f6'} onBlur={e => e.target.style.borderColor=C.border}/></Field>
}
function Btn({ onClick, children, variant = 'primary', full }) {
  const bg = { primary:'#1d4ed8', ghost:'#1c2b3f', danger:'#7f1d1d' }[variant]
  const fc = { primary:'#fff', ghost:'#94a3b8', danger:'#fca5a5' }[variant]
  return <button onClick={onClick}
    style={{ background:bg, color:fc, border:'none', borderRadius:6, padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer', width:full?'100%':'auto', transition:'filter 0.15s' }}
    onMouseEnter={e => e.currentTarget.style.filter='brightness(1.2)'}
    onMouseLeave={e => e.currentTarget.style.filter='brightness(1)'}>{children}</button>
}

function ModalWrap({ title, onClose, children }) {
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.85)',
        display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:12, padding:24,
        width:'100%', maxWidth:460, maxHeight:'88vh', overflowY:'auto', boxShadow:'0 25px 70px rgba(0,0,0,0.6)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <span style={{ fontSize:15, fontWeight:700, color:C.text }}>{title}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:16 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function ProjectModal({ project, onSave, onClose }) {
  const [name,  setName]  = useState(project?.name  || '')
  const [emoji, setEmoji] = useState(project?.emoji || '🚀')
  const [desc,  setDesc]  = useState(project?.description || '')
  const [color, setColor] = useState(project?.color || COLORS[0])
  const save = () => {
    if (!name.trim()) return
    onSave({ ...project, name: name.trim(), emoji, description: desc, color })
    onClose()
  }
  return (
    <ModalWrap title={project?.id ? 'Editar Proyecto' : 'Nuevo Proyecto'} onClose={onClose}>
      <Inp label="Nombre" value={name} onChange={e => setName(e.target.value)} placeholder="Mi Proyecto..." />
      <Textarea label="Descripción" value={desc} onChange={e => setDesc(e.target.value)} placeholder="De qué trata..." rows={2} />
      <Field label="Ícono">
        <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
          {EMOJIS.map(em => (
            <button key={em} onClick={() => setEmoji(em)}
              style={{ fontSize:17, padding:'4px 7px', borderRadius:6, cursor:'pointer',
                background: emoji===em ? '#1e3a8a' : C.bg, border: emoji===em ? '1px solid #3b82f6' : `1px solid ${C.border}` }}>{em}</button>
          ))}
        </div>
      </Field>
      <Field label="Color">
        <div style={{ display:'flex', gap:7 }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)}
              style={{ width:24, height:24, borderRadius:'50%', background:c, border:'none', cursor:'pointer',
                outline: color===c ? '3px solid rgba(255,255,255,0.8)' : 'none',
                boxShadow: color===c ? '0 0 0 2px rgba(255,255,255,0.15)' : 'none' }}/>
          ))}
        </div>
      </Field>
      <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:6 }}>
        <Btn onClick={onClose} variant="ghost">Cancelar</Btn>
        <Btn onClick={save}>Guardar</Btn>
      </div>
    </ModalWrap>
  )
}

export function PhaseModal({ phase, onSave, onClose }) {
  const [name,  setName]  = useState(phase?.name  || '')
  const [color, setColor] = useState(phase?.color || COLORS[1])
  const save = () => {
    if (!name.trim()) return
    onSave({ ...phase, name: name.trim(), color })
    onClose()
  }
  return (
    <ModalWrap title={phase?.id ? 'Editar Fase' : 'Nueva Fase'} onClose={onClose}>
      <Inp label="Nombre de la fase" value={name} onChange={e => setName(e.target.value)} placeholder="FASE N — Descripción..." />
      <Field label="Color">
        <div style={{ display:'flex', gap:7 }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)}
              style={{ width:24, height:24, borderRadius:'50%', background:c, border:'none', cursor:'pointer',
                outline: color===c ? '3px solid rgba(255,255,255,0.8)' : 'none' }}/>
          ))}
        </div>
      </Field>
      <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:6 }}>
        <Btn onClick={onClose} variant="ghost">Cancelar</Btn>
        <Btn onClick={save}>Guardar</Btn>
      </div>
    </ModalWrap>
  )
}

export function StepModal({ step, onSave, onClose }) {
  const [title,  setTitle]  = useState(step?.title  || '')
  const [desc,   setDesc]   = useState(step?.description || '')
  const [badges, setBadges] = useState(step?.badges || [])
  const [bl, setBl] = useState('')
  const [bt, setBt] = useState('default')
  const addBadge = () => {
    if (!bl.trim()) return
    setBadges(p => [...p, { label: bl.trim(), type: bt }])
    setBl('')
  }
  const save = () => {
    if (!title.trim()) return
    onSave({ ...step, title: title.trim(), description: desc, badges })
    onClose()
  }
  return (
    <ModalWrap title={step?.id ? 'Editar Paso' : 'Nuevo Paso'} onClose={onClose}>
      <Inp label="Título" value={title} onChange={e => setTitle(e.target.value)} placeholder="Nombre del paso..." />
      <Textarea label="Descripción" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Para qué sirve este paso..." rows={4} />
      <Field label="Etiquetas">
        {badges.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:8 }}>
            {badges.map((b, i) => (
              <span key={i} style={{ display:'flex', alignItems:'center', gap:3 }}>
                <BadgeEl label={b.label} type={b.type} />
                <button onClick={() => setBadges(p => p.filter((_, j) => j !== i))}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444', fontSize:11 }}>✕</button>
              </span>
            ))}
          </div>
        )}
        <div style={{ display:'flex', gap:6 }}>
          <input value={bl} onChange={e => setBl(e.target.value)} placeholder="Nueva etiqueta..."
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addBadge())}
            style={{ flex:1, background:C.bg, border:`1px solid ${C.border}`, color:C.text, borderRadius:6, padding:'6px 10px', fontSize:13, outline:'none' }}/>
          <select value={bt} onChange={e => setBt(e.target.value)}
            style={{ background:C.bg, border:`1px solid ${C.border}`, color:C.text, borderRadius:6, padding:'6px 8px', fontSize:12, cursor:'pointer', outline:'none' }}>
            <option value="default">ℹ️ Info</option>
            <option value="location">📍 Lugar</option>
            <option value="important">⚠️ Clave</option>
          </select>
          <Btn onClick={addBadge}>+</Btn>
        </div>
      </Field>
      <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:6 }}>
        <Btn onClick={onClose} variant="ghost">Cancelar</Btn>
        <Btn onClick={save}>Guardar</Btn>
      </div>
    </ModalWrap>
  )
}

export function BuildModal({ build, onSave, onClose }) {
  const [name, setName] = useState(build?.name || '')
  const [desc, setDesc] = useState(build?.description || '')
  const [status, setStatus] = useState(build?.status || 'planeado')
  const [dim, setDim] = useState(build?.dimension || 'overworld')
  const [coords, setCoords] = useState(build?.coordinates || '')
  const [notes, setNotes] = useState(build?.notes || '')
  const save = () => {
    if (!name.trim()) return
    onSave({ ...build, name: name.trim(), description: desc, status, dimension: dim, coordinates: coords, notes })
    onClose()
  }
  const sel = { background:C.bg, border:`1px solid ${C.border}`, color:C.text, borderRadius:6, padding:'8px 12px', fontSize:14, cursor:'pointer', outline:'none', width:'100%' }
  return (
    <ModalWrap title={build?.id ? 'Editar Construcción' : 'Nueva Construcción'} onClose={onClose}>
      <Inp label="Nombre" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre de la construcción..." />
      <Textarea label="Descripción" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Qué es y para qué sirve..." rows={2} />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
        <Field label="Estado">
          <select value={status} onChange={e => setStatus(e.target.value)} style={sel}>
            <option value="planeado">🗺️ Planeado</option>
            <option value="construyendo">🏗️ Construyendo</option>
            <option value="terminado">✅ Terminado</option>
          </select>
        </Field>
        <Field label="Dimensión">
          <select value={dim} onChange={e => setDim(e.target.value)} style={sel}>
            <option value="overworld">🌿 Overworld</option>
            <option value="nether">🔥 Nether</option>
            <option value="end">🌌 End</option>
          </select>
        </Field>
      </div>
      <Inp label="Coordenadas (X, Y, Z)" value={coords} onChange={e => setCoords(e.target.value)} placeholder="x: 120, y: 64, z: -300" />
      <Textarea label="Notas adicionales" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Materiales, referencia de tutorial, etc..." rows={3} />
      <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:6 }}>
        <Btn onClick={onClose} variant="ghost">Cancelar</Btn>
        <Btn onClick={save}>Guardar</Btn>
      </div>
    </ModalWrap>
  )
}

function BadgeEl({ label, type = 'default' }) {
  const s = { default:{bg:'#1a3050',c:'#7dd3fc'}, location:{bg:'#1e3a8a',c:'#93c5fd'}, important:{bg:'#7f1d1d',c:'#fca5a5'} }[type] || {bg:'#1a3050',c:'#7dd3fc'}
  return <span style={{ padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:600, background:s.bg, color:s.c, whiteSpace:'nowrap' }}>{label}</span>
}
