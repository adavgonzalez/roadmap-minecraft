import { db } from './db'

const MC = {
  project: { name: 'Roadmap Técnico Minecraft', emoji: '🛠️', color: '#10b981', description: 'Plan de progresión industrial y automatización global.' },
  phases: [
    { name: 'FASE 1 — El Impulso Inicial y Vuelo Exprés', color: '#3b82f6', order_index: 0, steps: [
      { title: 'Granja de Cobblestone',                 description: 'Bloques para puentes en el Nether, tapar lava y navegar el End.',                                       badges: [],                                                                       order_index: 0 },
      { title: 'Criadero de Aldeanos y Trading Hall',   description: 'Herramientas de diamante. Librero con Mending + Unbreaking III para las Élitras.',                       badges: [],                                                                       order_index: 1 },
      { title: '⚔️ Trial Chambers',                    description: 'Consigue Botellas Siniestras (Ominous Bottles) para activar la mini-granja de raids en Fase 2.',         badges: [{ label: 'Clave 1.21', type: 'important' }],                              order_index: 2 },
      { title: '⛏️ El Nether Exprés',                  description: 'Varas de Blaze en una fortaleza. Perlas en Warped Forest con techo de 2 bloques para protegerte.',       badges: [{ label: 'Nether', type: 'location' }],                                   order_index: 3 },
      { title: '🚀 HITO: Viaje al End',                description: 'Derrota al dragón, consigue Élitras y 10–20 Shulker Boxes en End Cities.',                              badges: [{ label: 'Hito Principal', type: 'important' }, { label: 'El End', type: 'location' }], order_index: 4 },
    ]},
    { name: 'FASE 2 — Cimientos de la Red Industrial (Post-End)', color: '#ef4444', order_index: 1, steps: [
      { title: '🔴 Mini-Granja de Raids (Ianxofour)',  description: 'Ominous Bottle en el océano = Redstone infinita, esmeraldas y tótems de inmortalidad.',                  badges: [{ label: 'Océano', type: 'location' }],                                   order_index: 0 },
      { title: 'Granja de Slime',                      description: 'Vacía un Slime Chunk. Pegamento para máquinas voladoras y pistones pegajosos.',                          badges: [],                                                                       order_index: 1 },
      { title: 'Granja de Polvo de Hueso + Caña y Bambú', description: 'Musgo de Lush Cave + dispensadores = polvo de hueso infinito. Caña para cohetes de Élitras.',        badges: [],                                                                       order_index: 2 },
      { title: 'Granja de Miel Automática',            description: 'Conecta tolvas a un Crafter para empaquetar botellas de miel en bloques automáticamente.',              badges: [{ label: 'Crafter', type: 'default' }],                                   order_index: 3 },
      { title: 'Granja de Gallinas, Cactus y Tortugas', description: 'Gallinas: plumas/comida. Cactus: papelera anti-lag. Tortugas: cebo para monstruos.',                   badges: [],                                                                       order_index: 4 },
      { title: 'Granja de Oro + Trueque Piglin',       description: 'Techo del Nether. Primer Item Sorter Nivel 1. Oro sobrante a Piglins por obsidiana y cuarzo.',           badges: [{ label: 'Techo Nether', type: 'location' }, { label: 'Sorter Nv.1', type: 'default' }], order_index: 5 },
    ]},
    { name: 'FASE 3 — Logística Global y Confort Técnico', color: '#f59e0b', order_index: 2, steps: [
      { title: 'Granja de Hielo → Nether Hub Central', description: 'Ice Roads en el techo del Nether para viajar a 70+ bloques/segundo entre portales.',                    badges: [{ label: 'Nether Hub', type: 'location' }],                               order_index: 0 },
      { title: 'Granja de Madera Masiva + Creepers',   description: 'Chunks dedicados. Sorters Nivel 2 (Shulker Box Loaders) para el volumen de producción.',                 badges: [{ label: 'Sorter Nv.2', type: 'default' }, { label: 'Chunk Loaders', type: 'default' }], order_index: 1 },
      { title: 'Granja de Wither Skeletons (Faros)',   description: 'Soul Sand Valley. Haste II obligatorio para aplanar terrenos de las mega-granjas de Fase 4.',             badges: [{ label: 'Nether Fortaleza', type: 'location' }],                         order_index: 2 },
      { title: 'Granja de Hoglins + Ovejas 16 Colores', description: 'Chuletas cocinadas, cuero para librerías y lana de todos los colores.',                                badges: [],                                                                       order_index: 3 },
      { title: 'Barro, Arcilla + Granja de Calamares', description: 'Terracota y ladrillos infinitos. Tinta luminosa para carteles brillantes en el almacén.',                badges: [],                                                                       order_index: 4 },
    ]},
    { name: '🌌 FASE 4 — El Olimpo Técnico', color: '#a855f7', order_index: 3, steps: [
      { title: 'Granja de Cobre / Ahogados',           description: 'Hierro + cobre = decenas de Crafters para automatizar masivamente todos los crafteos.',                   badges: [{ label: 'Crafters Masivos', type: 'default' }],                          order_index: 0 },
      { title: 'Granja de Guardianes + Ranabombillas', description: 'Linternas del Mar y luces de colores. Iluminación definitiva para mega-construcciones.',                 badges: [],                                                                       order_index: 1 },
      { title: 'Granja de Shulkers Automática',        description: 'Cajas de Shulker infinitas por duplicación de proyectil. La logística deja de ser problema.',            badges: [{ label: 'Logística ∞', type: 'important' }],                             order_index: 2 },
      { title: 'Duplicador de Bloques de Gravedad',    description: 'Portal del End. Duplica arena y grava para miles de bloques de concreto.',                               badges: [{ label: 'End Portal', type: 'location' }],                               order_index: 3 },
      { title: 'El Mob Switch (Interruptor del Mundo)', description: '70 Aldeanos Zombi llenan el Mobcap → spawn natural apagado. Construye a oscuras.',                     badges: [{ label: 'Mobcap', type: 'important' }],                                  order_index: 4 },
      { title: '🏛️ MEGA ALMACÉN CENTRAL (MIS Nv.3)',  description: 'Deja Shulkers en la tolva de entrada y la Redstone clasifica y ordena todos los ítems.',                  badges: [{ label: 'MIS Nivel 3', type: 'important' }],                             order_index: 5 },
      { title: 'Stacking Raid Farm Masiva',            description: 'Megaestructura oceánica. Esmeraldas y Redstone a velocidad máxima para cualquier proyecto futuro.',      badges: [{ label: 'Océano Profundo', type: 'location' }],                          order_index: 6 },
    ]},
  ],
}

export async function seedIfEmpty() {
  const { data: existing } = await db.projects.list()
  if (existing && existing.length > 0) return

  const { data: project, error } = await db.projects.insert(MC.project)
  if (error || !project) { console.error('seed project error', error); return }

  for (const { steps, ...phaseFields } of MC.phases) {
    const { data: phase, error: phErr } = await db.phases.insert({ ...phaseFields, project_id: project.id })
    if (phErr || !phase) continue
    for (const step of steps) {
      await db.steps.insert({ ...step, phase_id: phase.id, status: 'pendiente' })
    }
  }
}
