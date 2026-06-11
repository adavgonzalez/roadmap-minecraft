import { useState } from 'react'
import {
  DndContext, closestCenter,
  KeyboardSensor, PointerSensor,
  useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { db } from './db'
import { PhaseModal, StepModal } from './Modals'
import MarkdownRenderer from './MarkdownRenderer'

const C = { bg:'#080d16', panel:'#0f1724', card:'#172030', border:'#1c2b3f', text:'#f0f4fa', muted:'#5a7190', hover:'#1c2d42' }
const BADGE_S = { default:{bg:'#1a3050',c:'#7dd3fc'}, location:{bg:'#1e3a8a',c:'#93c5fd'}, important:{bg:'#7f1d1d',c:'#fca5a5'} }

function Badge({ label, type = 'default' }) {
  const s = BADGE_S[type] || BADGE_S.default
  return <span style={{ padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:600, background:s.bg, color:s.c, whiteSpace:'nowrap' }}>{label}</span>
}
function ProgBar({ pct, color, h = 4 }) {
  return (
    <div style={{ background:'#1e2d42', borderRadius:h, height:h, width:'100%', overflow:'hidden' }}>
      <div style={{ width:`${Math.min(100,pct)}%`, height:'100%', background:color, borderRadius:h, transition:'width 0.4s ease' }} />
    </div>
  )
}
function ConfirmDel({ label, onConfirm, onCancel }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 8px', background:'#2d1010', borderRadius:6, border:'1px solid #7f1d1d' }}>
      <span style={{ fontSize:11, color:'#fca5a5' }}>{label}</span>
      <button onClick={onConfirm} style={{ background:'#7f1d1d', color:'#fca5a5', border:'none', borderRadius:4, padding:'3px 8px', fontSize:11, cursor:'pointer', fontWeight:600 }}>Sí</button>
      <button onClick={onCancel}  style={{ background:'#1c2b3f', color:'#94a3b8', border:'none', borderRadius:4, padding:'3px 8px', fontSize:11, cursor:'pointer' }}>No</button>
    </div>
  )
}
function IBtn({ onClick, title, children, danger }) {
  return (
    <button onClick={onClick} title={title}
      style={{ background:'none', border:'none', cursor:'pointer', color:danger?'#ef4444':C.muted, padding:'3px 6px', borderRadius:4, fontSize:13, lineHeight:1, transition:'color 0.1s' }}
      onMouseEnter={e => e.currentTarget.style.color = danger ? '#f87171' : '#94a3b8'}
      onMouseLeave={e => e.currentTarget.style.color = danger ? '#ef4444' : C.muted}
    >{children}</button>
  )
}
function DragHandle({ listeners, attributes }) {
  return (
    <div {...listeners} {...attributes}
      style={{ cursor:'grab', color:C.muted, padding:'0 6px', touchAction:'none',
        display:'flex', alignItems:'center', flexShrink:0, userSelect:'none',
        fontSize:14, lineHeight:1, opacity:0.5 }}
      onMouseEnter={e => e.currentTarget.style.opacity='1'}
      onMouseLeave={e => e.currentTarget.style.opacity='0.5'}
      title="Arrastrar para reordenar">⠿</div>
  )
}

/* ── Toggle button shared style ── */
function ToggleBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      style={{ background:'none', border:`1px solid ${active?'#3b82f6':'#1c2b3f'}`,
        borderRadius:5, padding:'2px 9px', fontSize:11, cursor:'pointer',
        color:active?'#60a5fa':C.muted, transition:'all 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='#3b82f6'; e.currentTarget.style.color='#60a5fa' }}
      onMouseLeave={e => { if(!active){e.currentTarget.style.borderColor='#1c2b3f';e.currentTarget.style.color=C.muted} }}>
      {children}
    </button>
  )
}

/* ── Step Card ── */
function StepCard({ step, onUpdated, onDeleted, dragProps }) {
  const [hover,     setHover]     = useState(false)
  const [editing,   setEditing]   = useState(false)
  const [confirm,   setConfirm]   = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [imgOpen,   setImgOpen]   = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [lightbox,  setLightbox]  = useState(false)

  const borderColor = { pendiente:'#2a3a4d', progreso:'#f59e0b', completado:'#10b981' }[step.status]
  const bgColor     = { pendiente:C.card,    progreso:'#1c1908',  completado:'#0b1b10' }[step.status]
  const done      = step.status === 'completado'
  const hasNotes  = !!step.notes?.trim()
  const hasImage  = !!step.image_url

  async function changeStatus(val) {
    setSaving(true)
    const { data } = await db.steps.update(step.id, { status: val })
    if (data) onUpdated(data)
    setSaving(false)
  }
  async function handleEdit(fields) {
    const { data } = await db.steps.update(step.id, fields)
    if (data) { onUpdated(data); if (!fields.notes?.trim()) setNotesOpen(false) }
  }
  async function handleDelete() {
    if (step.image_url) { const { db: d } = await import('./db'); await d.storage.remove(step.image_url) }
    await db.steps.delete(step.id)
    onDeleted(step.id)
  }

  return (
    <>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => { setHover(false); setConfirm(false) }}
        style={{ background:hover?C.hover:bgColor, border:`1px solid ${hover?'#263548':C.border}`,
          borderLeft:`4px solid ${borderColor}`, borderRadius:8, marginBottom:8,
          transition:'background 0.15s,border-color 0.15s', opacity:done?0.78:1 }}
      >
        <div style={{ padding:'11px 13px', display:'flex', gap:0, alignItems:'stretch' }}>
          <DragHandle {...dragProps} />
          <div style={{ flex:1, minWidth:0 }}>
            {/* Title row */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, flexWrap:'wrap' }}>
              <span style={{ fontSize:14, fontWeight:600, flex:1, minWidth:0, lineHeight:1.4,
                color:done?C.muted:C.text, textDecoration:done?'line-through':'none' }}>
                {step.title}
                {saving && <span style={{ fontSize:11, color:'#60a5fa', marginLeft:8, fontWeight:400 }}>guardando…</span>}
              </span>
              <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
                {confirm
                  ? <ConfirmDel label="¿Eliminar?" onConfirm={handleDelete} onCancel={() => setConfirm(false)} />
                  : hover && <><IBtn onClick={() => setEditing(true)} title="Editar">✏️</IBtn>
                               <IBtn onClick={() => setConfirm(true)} danger>🗑</IBtn></>
                }
                <select value={step.status} onChange={e => changeStatus(e.target.value)}
                  style={{ background:C.bg, color:C.text, border:`1px solid ${C.border}`, padding:'4px 8px', borderRadius:5, fontSize:12, cursor:'pointer', outline:'none', flexShrink:0 }}>
                  <option value="pendiente">Pendiente</option>
                  <option value="progreso">En Progreso</option>
                  <option value="completado">Completado</option>
                </select>
              </div>
            </div>

            {step.description && (
              <p style={{ fontSize:13, color:C.muted, margin:'6px 0 0', lineHeight:1.55 }}>{step.description}</p>
            )}

            {/* Badges + toggles */}
            {(step.badges?.length > 0 || hasImage || hasNotes) && (
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8, flexWrap:'wrap', gap:5 }}>
                {step.badges?.length > 0 && (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                    {step.badges.map((b, i) => <Badge key={i} label={b.label} type={b.type} />)}
                  </div>
                )}
                <div style={{ display:'flex', gap:5, marginLeft:'auto' }}>
                  {hasImage && <ToggleBtn active={imgOpen}   onClick={() => setImgOpen(o=>!o)}>📸 Imagen {imgOpen?'▴':'▾'}</ToggleBtn>}
                  {hasNotes && <ToggleBtn active={notesOpen} onClick={() => setNotesOpen(o=>!o)}>📝 Notas {notesOpen?'▴':'▾'}</ToggleBtn>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Image panel */}
        {imgOpen && hasImage && (
          <div style={{ borderTop:`1px solid ${C.border}`, padding:'10px 14px', background:'rgba(0,0,0,0.2)' }}>
            <div style={{ position:'relative', cursor:'zoom-in' }} onClick={() => setLightbox(true)}>
              <img src={step.image_url} alt={step.title}
                style={{ width:'100%', maxHeight:200, objectFit:'cover', borderRadius:6, display:'block' }} />
              <div style={{ position:'absolute', bottom:7, right:9, fontSize:10, color:'rgba(255,255,255,0.5)',
                background:'rgba(0,0,0,0.4)', padding:'1px 6px', borderRadius:3 }}>🔍 ampliar</div>
            </div>
          </div>
        )}

        {/* Notes panel */}
        {notesOpen && hasNotes && (
          <div style={{ borderTop:`1px solid ${C.border}`, padding:'12px 14px 14px', background:'rgba(0,0,0,0.2)' }}>
            <MarkdownRenderer content={step.notes} />
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(false)}
          style={{ position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,0.92)',
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'zoom-out', padding:20 }}>
          <img src={step.image_url} alt={step.title}
            style={{ maxWidth:'90vw', maxHeight:'88vh', objectFit:'contain', borderRadius:8,
              boxShadow:'0 0 80px rgba(0,0,0,0.8)' }} />
          <div style={{ position:'absolute', top:16, right:20, color:'rgba(255,255,255,0.5)', fontSize:13 }}>
            click para cerrar
          </div>
        </div>
      )}

      {editing && <StepModal step={step} onSave={handleEdit} onClose={() => setEditing(false)} />}
    </>
  )
}

/* ── Sortable step wrapper ── */
function SortableStep({ step, ...props }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id })
  return (
    <div ref={setNodeRef} style={{ transform:CSS.Transform.toString(transform), transition,
      opacity:isDragging?0.4:1, zIndex:isDragging?10:undefined }}>
      <StepCard step={step} dragProps={{ listeners, attributes }} {...props} />
    </div>
  )
}

/* ── Phase Section ── */
function PhaseSection({ phase, dragProps, isDragging,
  onPhaseUpdated, onPhaseDeleted, onAddStep, onUpdateStep, onDeleteStep, onStepsReordered }) {

  const [collapsed,  setCollapsed]  = useState(false)
  const [hover,      setHover]      = useState(false)
  const [editing,    setEditing]    = useState(false)
  const [addStep,    setAddStep]    = useState(false)
  const [confirm,    setConfirm]    = useState(false)
  const [notesOpen,  setNotesOpen]  = useState(false)

  const steps    = phase.steps || []
  const total    = steps.length
  const done     = steps.filter(s => s.status === 'completado').length
  const pct      = total > 0 ? Math.round(done / total * 100) : 0
  const hasNotes = !!phase.notes?.trim()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint:{ distance:8 } }),
    useSensor(KeyboardSensor, { coordinateGetter:sortableKeyboardCoordinates })
  )

  function handleStepDragEnd({ active, over }) {
    if (!over || active.id === over.id) return
    const oldIdx = steps.findIndex(s => s.id === active.id)
    const newIdx = steps.findIndex(s => s.id === over.id)
    if (oldIdx === -1 || newIdx === -1) return
    const reordered = arrayMove(steps, oldIdx, newIdx)
    onStepsReordered(phase.id, reordered)
    db.steps.reorder(reordered)
  }

  async function handleEditPhase(fields) {
    const { data } = await db.phases.update(phase.id, fields)
    if (data) onPhaseUpdated({ ...phase, ...data })
  }
  async function handleDeletePhase() {
    await db.phases.delete(phase.id)
    onPhaseDeleted(phase.id)
  }
  async function handleAddStep(fields) {
    const { data } = await db.steps.insert({ ...fields, phase_id:phase.id, status:'pendiente', order_index:steps.length })
    if (data) onAddStep(phase.id, data)
  }

  return (
    <>
      <div style={{ background:C.panel, border:`1px solid ${isDragging?'#3b82f640':C.border}`,
        borderTop:`3px solid ${phase.color}`, borderRadius:10, marginBottom:18, overflow:'hidden',
        boxShadow: isDragging ? '0 8px 32px rgba(0,0,0,0.4)' : undefined,
        transition:'box-shadow 0.2s' }}>

        {/* Phase header */}
        <div onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setConfirm(false) }}
          style={{ padding:'10px 12px 10px 6px', display:'flex', alignItems:'center', gap:6, userSelect:'none' }}>
          <DragHandle {...dragProps} />
          <button onClick={() => setCollapsed(c => !c)}
            style={{ background:'none', border:'none', color:phase.color, fontSize:12, cursor:'pointer', padding:'0 4px', flexShrink:0 }}>
            {collapsed ? '▶' : '▼'}
          </button>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
              <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{phase.name}</span>
              <span style={{ fontSize:11, color:C.muted, background:C.bg, padding:'1px 6px', borderRadius:3 }}>
                {done}/{total} · {pct}%
              </span>
              {hasNotes && (
                <ToggleBtn active={notesOpen} onClick={() => setNotesOpen(o=>!o)}>
                  📝 {notesOpen?'▴':'▾'}
                </ToggleBtn>
              )}
            </div>
            <div style={{ minWidth:80, flex:1, maxWidth:260 }}><ProgBar pct={pct} color={phase.color} /></div>
          </div>
          <div style={{ display:'flex', gap:2, flexShrink:0 }} onClick={e => e.stopPropagation()}>
            {confirm
              ? <ConfirmDel label="¿Eliminar fase?" onConfirm={handleDeletePhase} onCancel={() => setConfirm(false)} />
              : hover && (
                  <>
                    <IBtn onClick={() => setAddStep(true)}  title="Agregar paso">➕</IBtn>
                    <IBtn onClick={() => setEditing(true)}  title="Editar fase">✏️</IBtn>
                    <IBtn onClick={() => setConfirm(true)}  danger>🗑</IBtn>
                  </>
                )
            }
          </div>
        </div>

        {/* Phase notes panel */}
        {notesOpen && hasNotes && (
          <div style={{ borderTop:`1px solid ${C.border}`, padding:'12px 16px', background:'rgba(0,0,0,0.15)' }}>
            <MarkdownRenderer content={phase.notes} />
          </div>
        )}

        {/* Steps */}
        {!collapsed && (
          <div style={{ padding:'2px 15px 14px' }}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleStepDragEnd}>
              <SortableContext items={steps.map(s => s.id)} strategy={verticalListSortingStrategy}>
                {steps.map(s => (
                  <SortableStep key={s.id} step={s}
                    onUpdated={updated => onUpdateStep(phase.id, updated)}
                    onDeleted={sid    => onDeleteStep(phase.id, sid)} />
                ))}
              </SortableContext>
            </DndContext>
            {steps.length === 0 && (
              <div style={{ textAlign:'center', padding:'18px', color:C.muted, fontSize:13,
                border:`1px dashed ${C.border}`, borderRadius:8, marginBottom:8 }}>
                Sin pasos.{' '}
                <button onClick={() => setAddStep(true)}
                  style={{ background:'none', border:'none', color:'#60a5fa', cursor:'pointer', fontSize:13, textDecoration:'underline', padding:0 }}>
                  Agrega el primero →
                </button>
              </div>
            )}
            <button onClick={() => setAddStep(true)}
              style={{ width:'100%', padding:'7px', background:'none', border:`1px dashed ${C.border}`,
                borderRadius:6, color:C.muted, fontSize:12, cursor:'pointer', transition:'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=phase.color; e.currentTarget.style.color=phase.color }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=C.border;   e.currentTarget.style.color=C.muted }}>
              + Agregar paso
            </button>
          </div>
        )}
      </div>
      {editing && <PhaseModal phase={phase} onSave={handleEditPhase} onClose={() => setEditing(false)} />}
      {addStep  && <StepModal onSave={handleAddStep}                 onClose={() => setAddStep(false)} />}
    </>
  )
}

/* ── Sortable phase wrapper ── */
function SortablePhase({ phase, ...props }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: phase.id })
  return (
    <div ref={setNodeRef} style={{ transform:CSS.Transform.toString(transform), transition, zIndex:isDragging?20:undefined }}>
      <PhaseSection phase={phase} dragProps={{ listeners, attributes }} isDragging={isDragging} {...props} />
    </div>
  )
}

/* ── RoadmapView root ── */
export default function RoadmapView({ phases, projectId, onPhasesChange }) {
  const [addPhase, setAddPhase] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint:{ distance:8 } }),
    useSensor(KeyboardSensor, { coordinateGetter:sortableKeyboardCoordinates })
  )

  function handlePhaseDragEnd({ active, over }) {
    if (!over || active.id === over.id) return
    const oldIdx = phases.findIndex(p => p.id === active.id)
    const newIdx = phases.findIndex(p => p.id === over.id)
    if (oldIdx === -1 || newIdx === -1) return
    const reordered = arrayMove(phases, oldIdx, newIdx)
    onPhasesChange(reordered)
    db.phases.reorder(reordered)
  }

  async function handleAddPhase(fields) {
    const { data } = await db.phases.insert({ ...fields, project_id:projectId, order_index:phases.length })
    if (data) onPhasesChange([...phases, { ...data, steps:[] }])
  }

  function updatePhase(updated) {
    onPhasesChange(phases.map(p => p.id === updated.id ? { ...p, ...updated } : p))
  }
  function deletePhase(phaseId) {
    onPhasesChange(phases.filter(p => p.id !== phaseId))
  }
  function updateStep(phaseId, updated) {
    onPhasesChange(phases.map(p => p.id === phaseId
      ? { ...p, steps: p.steps.map(s => s.id === updated.id ? updated : s) } : p))
  }
  function deleteStep(phaseId, stepId) {
    onPhasesChange(phases.map(p => p.id === phaseId
      ? { ...p, steps: p.steps.filter(s => s.id !== stepId) } : p))
  }
  function addStep(phaseId, step) {
    onPhasesChange(phases.map(p => p.id === phaseId
      ? { ...p, steps: [...(p.steps || []), step] } : p))
  }
  function reorderSteps(phaseId, reordered) {
    onPhasesChange(phases.map(p => p.id === phaseId ? { ...p, steps: reordered } : p))
  }

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePhaseDragEnd}>
        <SortableContext items={phases.map(p => p.id)} strategy={verticalListSortingStrategy}>
          {phases.map(phase => (
            <SortablePhase key={phase.id} phase={phase}
              onPhaseUpdated={updatePhase}
              onPhaseDeleted={deletePhase}
              onAddStep={addStep}
              onUpdateStep={updateStep}
              onDeleteStep={deleteStep}
              onStepsReordered={reorderSteps} />
          ))}
        </SortableContext>
      </DndContext>

      {phases.length === 0 && (
        <div style={{ textAlign:'center', padding:'48px 20px', color:C.muted,
          border:`1px dashed ${C.border}`, borderRadius:12, marginBottom:16 }}>
          <div style={{ fontSize:36, marginBottom:8 }}>🗂️</div>
          <div style={{ marginBottom:10 }}>Sin fases todavía</div>
          <button onClick={() => setAddPhase(true)}
            style={{ background:'#1d4ed8', color:'#fff', border:'none', borderRadius:6,
              padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            Crear primera fase
          </button>
        </div>
      )}

      <button onClick={() => setAddPhase(true)}
        style={{ width:'100%', padding:'11px', background:'none', border:`2px dashed ${C.border}`,
          borderRadius:10, color:C.muted, fontSize:13, cursor:'pointer', transition:'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor='#3b82f6'; e.currentTarget.style.color='#60a5fa' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor=C.border;  e.currentTarget.style.color=C.muted }}>
        + Agregar Fase
      </button>

      {addPhase && <PhaseModal onSave={handleAddPhase} onClose={() => setAddPhase(false)} />}
    </div>
  )
}
