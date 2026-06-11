import { supabase } from './supabase'

export const db = {
  projects: {
    list:   ()       => supabase.from('projects').select('*').order('created_at'),
    insert: (p)      => supabase.from('projects').insert(p).select().single(),
    update: (id, p)  => supabase.from('projects').update(p).eq('id', id).select().single(),
    delete: (id)     => supabase.from('projects').delete().eq('id', id),
  },
  phases: {
    list:   (pid)    => supabase.from('phases').select('*, steps(*)').eq('project_id', pid)
                          .order('order_index').order('order_index', { foreignTable: 'steps' }),
    insert: (p)      => supabase.from('phases').insert(p).select().single(),
    update: (id, p)  => supabase.from('phases').update(p).eq('id', id).select().single(),
    delete: (id)     => supabase.from('phases').delete().eq('id', id),
  },
  steps: {
    insert: (s)      => supabase.from('steps').insert(s).select().single(),
    update: (id, s)  => supabase.from('steps').update({ ...s, updated_at: new Date().toISOString() }).eq('id', id).select().single(),
    delete: (id)     => supabase.from('steps').delete().eq('id', id),
  },
  builds: {
    list:   (pid)    => supabase.from('builds').select('*').eq('project_id', pid).order('created_at'),
    insert: (b)      => supabase.from('builds').insert(b).select().single(),
    update: (id, b)  => supabase.from('builds').update(b).eq('id', id).select().single(),
    delete: (id)     => supabase.from('builds').delete().eq('id', id),
  },
}
