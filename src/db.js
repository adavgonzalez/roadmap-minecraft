import { supabase } from './supabase'

export const db = {
  projects: {
    list:   ()       => supabase.from('projects').select('*').order('created_at'),
    insert: (p)      => supabase.from('projects').insert(p).select().single(),
    update: (id, p)  => supabase.from('projects').update(p).eq('id', id).select().single(),
    delete: (id)     => supabase.from('projects').delete().eq('id', id),
  },
  phases: {
    list:    (pid)   => supabase.from('phases').select('*, steps(*)').eq('project_id', pid)
                          .order('order_index').order('order_index', { foreignTable: 'steps' }),
    insert:  (p)     => supabase.from('phases').insert(p).select().single(),
    update:  (id, p) => supabase.from('phases').update(p).eq('id', id).select().single(),
    delete:  (id)    => supabase.from('phases').delete().eq('id', id),
    reorder: (items) => Promise.all(
      items.map((p, i) => supabase.from('phases').update({ order_index: i }).eq('id', p.id))
    ),
  },
  steps: {
    insert:  (s)     => supabase.from('steps').insert(s).select().single(),
    update:  (id, s) => supabase.from('steps').update({ ...s, updated_at: new Date().toISOString() }).eq('id', id).select().single(),
    delete:  (id)    => supabase.from('steps').delete().eq('id', id),
    reorder: (items) => Promise.all(
      items.map((s, i) => supabase.from('steps').update({ order_index: i }).eq('id', s.id))
    ),
  },
  builds: {
    list:   (pid)    => supabase.from('builds').select('*').eq('project_id', pid).order('created_at'),
    insert: (b)      => supabase.from('builds').insert(b).select().single(),
    update: (id, b)  => supabase.from('builds').update(b).eq('id', id).select().single(),
    delete: (id)     => supabase.from('builds').delete().eq('id', id),
  },
  storage: {
    upload: async (file) => {
      const ext  = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2,7)}.${ext}`
      const { data, error } = await supabase.storage
        .from('builds-images')
        .upload(path, file, { cacheControl: '3600', upsert: false })
      if (error) return { error }
      const { data: { publicUrl } } = supabase.storage
        .from('builds-images')
        .getPublicUrl(data.path)
      return { url: publicUrl }
    },
    remove: async (url) => {
      if (!url) return
      const path = url.split('/builds-images/')[1]
      if (path) await supabase.storage.from('builds-images').remove([path])
    },
  },
}
