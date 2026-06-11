import { useState } from 'react'
import MarkdownRenderer from './MarkdownRenderer'

const C = { bg: '#080d16', panel: '#0f1724', border: '#1c2b3f', text: '#f0f4fa', muted: '#5a7190' }
const COLORS = ['#10b981','#3b82f6','#ef4444','#f59e0b','#a855f7','#06b6d4','#ec4899','#f97316']

/* ── Shared image uploader ── */
export function ImageUploader({ imageUrl, onChange, label = '📸 Imagen de referencia' }) {
  const [uploading, setUploading] = useState(false)
  const [dragOver,  setDragOver]  = useState(false)
  const [err,       setErr]       = useState('')

  async function handleFile(file) {
    if (!file?.type.startsWith('image/')) { setErr('Solo imágenes (JPG, PNG, WebP, GIF)'); return }
    if (file.size > 5 * 1024 * 1024)     { setErr('Máximo 5 MB'); return }
    setErr(''); setUploading(true)
    const { db } = await import('./db')
    if (imageUrl) await db.storage.remove(imageUrl)
    const { url, error } = await db.storage.upload(file)
    if (error) { setErr('Error al subir'); setUploading(false); return }
    onChange(url); setUploading(false)
  }

  async function remove() {
    const { db } = await import('./db')
    await db.storage.remove(imageUrl)
    onChange('')
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize:12, color:C.muted, marginBottom:6, fontWeight:500 }}>{label}</div>
      {imageUrl ? (
        <div style={{ position:'relative', borderRadius:8, overflow:'hidden', border:`1px solid ${C.border}` }}>
          <img src={imageUrl} alt="" style={{ width:'100%', maxHeight:180, objectFit:'cover', display:'block' }} />
          <button onClick={remove}
            style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,0.75)', border:'none',
              color:'#fca5a5', borderRadius:5, padding:'4px 10px', fontSize:12, cursor:'pointer' }}>
            × Eliminar
          </button>
        </div>
      ) : (
        <label
          onDragOver={e  => { e.preventDefault(); setDragOver(true)  }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
          style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            gap:6, padding:'20px', borderRadius:8, cursor:'pointer', transition:'all 0.15s',
            border:`2px dashed ${dragOver ? '#3b82f6' : C.border}`,
            background: dragOver ? '#0f1f35' : 'transparent' }}>
          {uploading
            ? <><span style={{ fontSize:20 }}>⏳</span><span style={{ fontSize:12, color:'#60a5fa' }}>Subiendo…</span></>
            : <><span style={{ fontSize:22 }}>🖼️</span>
               <span style={{ fontSize:12, color:C.muted, textAlign:'center' }}>
                 Arrastra o <span style={{ color:'#60a5fa' }}>haz click</span>
                 <br/><span style={{ fontSize:10, opacity:0.6 }}>JPG, PNG, WebP · máx 5 MB</span>
               </span></>
          }
          <input type="file" accept="image/*" style={{ display:'none' }} onChange={e => handleFile(e.target.files[0])} />
        </label>
      )}
      {err && <div style={{ fontSize:11, color:'#f87171', marginTop:4 }}>⚠ {err}</div>}
    </div>
  )
}
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
  const [name,     setName]     = useState(phase?.name  || '')
  const [color,    setColor]    = useState(phase?.color || COLORS[1])
  const [notes,    setNotes]    = useState(phase?.notes || '')
  const [notesTab, setNotesTab] = useState('write')

  const save = () => {
    if (!name.trim()) return
    onSave({ ...phase, name: name.trim(), color, notes })
    onClose()
  }

  const tabBtn = (id, label) => (
    <button onClick={() => setNotesTab(id)}
      style={{ padding:'4px 12px', fontSize:11, fontWeight:600, cursor:'pointer', border:'none', borderRadius:4,
        background: notesTab === id ? '#1c2b3f' : 'transparent',
        color:      notesTab === id ? C.text    : C.muted }}>
      {label}
    </button>
  )

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

      {/* Phase notes with markdown */}
      <div style={{ marginBottom:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
          <div style={{ fontSize:12, color:C.muted, fontWeight:500 }}>
            📝 Notas de fase <span style={{ fontSize:10, color:'#3b82f6', marginLeft:4 }}>Markdown</span>
          </div>
          <div style={{ display:'flex', gap:2, background:'#080d16', borderRadius:5, padding:2 }}>
            {tabBtn('write',   '✏️ Escribir')}
            {tabBtn('preview', '👁 Preview')}
          </div>
        </div>
        {notesTab === 'write' ? (
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={5}
            placeholder="Objetivos de la fase, materiales clave, referencias..."
            style={{ ...inp, resize:'vertical', lineHeight:1.55, fontFamily:"'Fira Code', monospace", fontSize:12 }}
            onFocus={e => e.target.style.borderColor='#3b82f6'}
            onBlur={e  => e.target.style.borderColor=C.border} />
        ) : (
          <div style={{ minHeight:80, background:'#080d16', border:`1px solid ${C.border}`,
            borderRadius:6, padding:'10px 14px' }}>
            {notes.trim()
              ? <MarkdownRenderer content={notes} />
              : <span style={{ color:C.muted, fontSize:12, fontStyle:'italic' }}>Sin notas…</span>
            }
          </div>
        )}
      </div>

      <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:6 }}>
        <Btn onClick={onClose} variant="ghost">Cancelar</Btn>
        <Btn onClick={save}>Guardar</Btn>
      </div>
    </ModalWrap>
  )
}

export function StepModal({ step, onSave, onClose }) {
  const [title,       setTitle]    = useState(step?.title        || '')
  const [desc,        setDesc]     = useState(step?.description  || '')
  const [notes,       setNotes]    = useState(step?.notes        || '')
  const [imageUrl,    setImageUrl] = useState(step?.image_url    || '')
  const [badges,      setBadges]   = useState(step?.badges       || [])
  const [bl,          setBl]       = useState('')
  const [bt,          setBt]       = useState('default')
  const [notesTab,    setNotesTab] = useState('write') // 'write' | 'preview'

  const addBadge = () => {
    if (!bl.trim()) return
    setBadges(p => [...p, { label: bl.trim(), type: bt }])
    setBl('')
  }
  const save = () => {
    if (!title.trim()) return
    onSave({ ...step, title: title.trim(), description: desc, badges, notes, image_url: imageUrl })
    onClose()
  }

  const tabBtn = (id, label) => (
    <button onClick={() => setNotesTab(id)}
      style={{ padding:'4px 12px', fontSize:11, fontWeight:600, cursor:'pointer', border:'none', borderRadius:4,
        background: notesTab === id ? '#1c2b3f' : 'transparent',
        color:      notesTab === id ? C.text    : C.muted }}>
      {label}
    </button>
  )

  return (
    <ModalWrap title={step?.id ? 'Editar Paso' : 'Nuevo Paso'} onClose={onClose}>
      <Inp label="Título" value={title} onChange={e => setTitle(e.target.value)} placeholder="Nombre del paso..." />
      <Textarea label="Descripción breve" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Para qué sirve este paso..." rows={2} />

      {/* Notes with editor/preview */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
          <div style={{ fontSize:12, color:C.muted, fontWeight:500 }}>
            📝 Notas <span style={{ fontSize:10, color:'#3b82f6', marginLeft:4 }}>Markdown soportado</span>
          </div>
          <div style={{ display:'flex', gap:2, background:'#080d16', borderRadius:5, padding:2 }}>
            {tabBtn('write',   '✏️ Escribir')}
            {tabBtn('preview', '👁 Preview')}
          </div>
        </div>

        {notesTab === 'write' ? (
          <div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={7}
              placeholder={`Pega links de tutoriales, comandos, materiales necesarios...\n\n## Tutorial\nhttps://youtube.com/...\n\n## Materiales\n- 64x Piedra\n- 32x Madera\n\n\`\`\`\n/tp 120 64 -300\n\`\`\``}
              style={{ ...inp, resize:'vertical', lineHeight:1.55, fontFamily:"'Fira Code', monospace", fontSize:12 }}
              onFocus={e => e.target.style.borderColor='#3b82f6'}
              onBlur={e  => e.target.style.borderColor=C.border}
            />
            <div style={{ fontSize:10, color:C.muted, marginTop:4 }}>
              `código` · **negrita** · ## Título · - lista · [link](url)
            </div>
          </div>
        ) : (
          <div style={{ minHeight:120, background:'#080d16', border:`1px solid ${C.border}`,
            borderRadius:6, padding:'10px 14px' }}>
            {notes.trim()
              ? <MarkdownRenderer content={notes} />
              : <span style={{ color:C.muted, fontSize:12, fontStyle:'italic' }}>Sin notas todavía…</span>
            }
          </div>
        )}
      </div>

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
      <ImageUploader imageUrl={imageUrl} onChange={setImageUrl} />
      <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:6 }}>
        <Btn onClick={onClose} variant="ghost">Cancelar</Btn>
        <Btn onClick={save}>Guardar</Btn>
      </div>
    </ModalWrap>
  )
}

export function BuildModal({ build, onSave, onClose }) {
  const [name,      setName]      = useState(build?.name        || '')
  const [desc,      setDesc]      = useState(build?.description || '')
  const [status,    setStatus]    = useState(build?.status      || 'planeado')
  const [dim,       setDim]       = useState(build?.dimension   || 'overworld')
  const [coords,    setCoords]    = useState(build?.coordinates || '')
  const [notes,     setNotes]     = useState(build?.notes       || '')
  const [imageUrl,  setImageUrl]  = useState(build?.image_url   || '')
  const [uploading, setUploading] = useState(false)
  const [dragOver,  setDragOver]  = useState(false)
  const [uploadErr, setUploadErr] = useState('')

  const { db: dbImport } = (() => { try { return { db: null } } catch { return { db: null } } })()

  async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      setUploadErr('Solo se aceptan imágenes (JPG, PNG, WebP, GIF)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadErr('Máximo 5 MB por imagen')
      return
    }
    setUploadErr('')
    setUploading(true)
    // dynamic import to avoid circular deps
    const { db } = await import('./db')
    // Remove old image if replacing
    if (imageUrl) await db.storage.remove(imageUrl)
    const { url, error } = await db.storage.upload(file)
    if (error) { setUploadErr('Error al subir la imagen'); setUploading(false); return }
    setImageUrl(url)
    setUploading(false)
  }

  async function removeImage() {
    if (!imageUrl) return
    const { db } = await import('./db')
    await db.storage.remove(imageUrl)
    setImageUrl('')
  }

  const save = () => {
    if (!name.trim()) return
    onSave({ ...build, name: name.trim(), description: desc, status, dimension: dim, coordinates: coords, notes, image_url: imageUrl })
    onClose()
  }

  const sel = { background:C.bg, border:`1px solid ${C.border}`, color:C.text, borderRadius:6, padding:'8px 12px', fontSize:14, cursor:'pointer', outline:'none', width:'100%' }

  return (
    <ModalWrap title={build?.id ? 'Editar Construcción' : 'Nueva Construcción'} onClose={onClose}>
      <Inp label="Nombre" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre de la construcción..." />
      <Textarea label="Descripción" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Qué es y para qué sirve..." rows={2} />

      {/* Image uploader */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize:12, color:C.muted, marginBottom:6, fontWeight:500 }}>📸 Imagen / Screenshot</div>
        {imageUrl ? (
          <div style={{ position:'relative', borderRadius:8, overflow:'hidden', border:`1px solid ${C.border}` }}>
            <img src={imageUrl} alt="build" style={{ width:'100%', maxHeight:200, objectFit:'cover', display:'block' }} />
            <button onClick={removeImage}
              style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,0.75)', border:'none',
                color:'#fca5a5', borderRadius:5, padding:'4px 10px', fontSize:12, cursor:'pointer',
                backdropFilter:'blur(4px)' }}>
              × Eliminar
            </button>
          </div>
        ) : (
          <label
            onDragOver={e  => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
            style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:8, padding:'24px', borderRadius:8, cursor:'pointer', transition:'all 0.15s',
              border:`2px dashed ${dragOver ? '#3b82f6' : C.border}`,
              background: dragOver ? '#0f1f35' : 'transparent' }}>
            {uploading ? (
              <>
                <span style={{ fontSize:22 }}>⏳</span>
                <span style={{ fontSize:12, color:'#60a5fa' }}>Subiendo imagen…</span>
              </>
            ) : (
              <>
                <span style={{ fontSize:26 }}>🖼️</span>
                <span style={{ fontSize:12, color:C.muted, textAlign:'center' }}>
                  Arrastra una imagen o <span style={{ color:'#60a5fa' }}>haz click para seleccionar</span>
                  <br/><span style={{ fontSize:10, opacity:0.6 }}>JPG, PNG, WebP, GIF · máx. 5 MB</span>
                </span>
              </>
            )}
            <input type="file" accept="image/*" style={{ display:'none' }}
              onChange={e => handleFile(e.target.files[0])} />
          </label>
        )}
        {uploadErr && <div style={{ fontSize:11, color:'#f87171', marginTop:4 }}>⚠ {uploadErr}</div>}
      </div>

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
