import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Btn, Card, EmptyState, Input, Label, Modal, PageHeader, Select, Textarea } from './ui';
import { useAsync } from './hooks';
import { Pencil, Trash2, Star } from 'lucide-react';

export default function AdminJournal() {
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);

  const { data, loading, reload } = useAsync(async () => {
    const [articles, views, paywalls] = await Promise.all([
      supabase.from('journal_articles').select('*').order('published_at', { ascending: false }),
      supabase.from('analytics_events').select('target_id').eq('event_type','article_view'),
      supabase.from('analytics_events').select('target_id').eq('event_type','paywall_hit'),
    ]);
    const viewMap = new Map<string, number>();
    (views.data || []).forEach((r: any) => viewMap.set(r.target_id, (viewMap.get(r.target_id) || 0) + 1));
    const pwMap = new Map<string, number>();
    (paywalls.data || []).forEach((r: any) => pwMap.set(r.target_id, (pwMap.get(r.target_id) || 0) + 1));
    return (articles.data || []).map((a: any) => ({ ...a, views: viewMap.get(a.id) || 0, paywalls: pwMap.get(a.id) || 0 }));
  });

  const cats = useAsync(async () => (await supabase.from('article_categories').select('*').order('name')).data || []);

  const toggleFeatured = async (a: any) => {
    await supabase.from('journal_articles').update({ featured: !a.featured }).eq('id', a.id);
    reload();
  };
  const remove = async (a: any) => {
    if (!confirm(`Excluir "${a.title}"?`)) return;
    await supabase.from('journal_articles').delete().eq('id', a.id);
    reload();
  };

  return (
    <>
      <PageHeader title="R.Journal" subtitle="Gestão de matérias e destaques"
        actions={<Btn onClick={() => setCreating(true)}>+ Nova matéria</Btn>} />
      {loading ? <EmptyState>Carregando…</EmptyState> :
        !data?.length ? <EmptyState>Nenhuma matéria.</EmptyState> : (
        <div className="space-y-2">
          {data.map((a: any) => (
            <Card key={a.id} className="p-3">
              <div className="flex justify-between items-start gap-3">
                <div className="w-20 h-14 flex-shrink-0 bg-[#0a0f1e] border border-white/10 overflow-hidden">
                  {a.cover_url ? (
                    <img
                      src={a.cover_url}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">sem capa</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex gap-2 items-center flex-wrap">
                    <div className="text-white font-medium">{a.title}</div>
                    {a.featured && <span className="text-[10px] bg-yellow-500 text-black px-1.5 py-0.5">DESTAQUE</span>}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{a.category} · {new Date(a.published_at).toLocaleDateString()}</div>
                  <div className="text-xs text-gray-400 mt-1">{a.views} visualizações · {a.paywalls} atingiram paywall</div>
                </div>
                <div className="flex gap-1">
                  <Btn variant="ghost" onClick={() => toggleFeatured(a)}><Star size={12} /></Btn>
                  <Btn variant="ghost" onClick={() => setEditing(a)}><Pencil size={12} /></Btn>
                  <Btn variant="danger" onClick={() => remove(a)}><Trash2 size={12} /></Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {(editing || creating) && (
        <ArticleForm article={editing} categories={cats.data || []} onClose={() => { setEditing(null); setCreating(false); }} onSaved={() => { setEditing(null); setCreating(false); reload(); }} />
      )}
    </>
  );
}

function ArticleForm({ article, categories, onClose, onSaved }: any) {
  const catOptions: string[] = (categories && categories.length ? categories.map((c: any) => c.name) : ['Geral','Economia','Negócios','Cultura','Uruaçu','Nacional']);
  const [f, setF] = useState({
    title: article?.title || '',
    category: article?.category || catOptions[0] || 'Geral',
    cover_url: article?.cover_url || '',
    excerpt: article?.excerpt || '',
    body: article?.body || '',
    featured: article?.featured || false,
    published_at: article?.published_at ? new Date(article.published_at).toISOString().slice(0,10) : new Date().toISOString().slice(0,10),
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const save = async () => {
    setErr(null);
    if (!f.title.trim()) { setErr('Título é obrigatório.'); return; }
    setSaving(true);
    const payload = {
      ...f,
      title: f.title.trim(),
      category: (f.category || 'Geral').trim(),
      published_at: new Date(f.published_at).toISOString(),
    };
    const res = article
      ? await supabase.from('journal_articles').update(payload).eq('id', article.id)
      : await supabase.from('journal_articles').insert(payload);
    setSaving(false);
    if (res.error) { console.error('journal save', res.error); setErr(res.error.message); return; }
    onSaved();
  };
  return (
    <Modal open onClose={onClose} title={article ? 'Editar matéria' : 'Nova matéria'}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn onClick={save} disabled={saving}>{saving?'Salvando…':'Salvar'}</Btn></>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2"><Label>Título</Label><Input value={f.title} onChange={e=>setF({...f, title: e.target.value})} /></div>
        <div><Label>Categoria</Label><Select value={f.category} onChange={e=>setF({...f, category: e.target.value})}>
          {catOptions.map((n: string) => <option key={n} value={n}>{n}</option>)}
        </Select></div>
        <div><Label>Data de publicação</Label><Input type="date" value={f.published_at} onChange={e=>setF({...f, published_at: e.target.value})} /></div>
        <div className="md:col-span-2">
          <Label>Imagem de capa (URL)</Label>
          <Input value={f.cover_url} onChange={e=>setF({...f, cover_url: e.target.value})} placeholder="https://..." />
          {f.cover_url && (
            <div className="mt-2 aspect-[16/9] bg-[#0a0f1e] border border-white/10 overflow-hidden">
              <img
                src={f.cover_url}
                alt="Prévia da capa"
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.2'; }}
              />
            </div>
          )}
        </div>
        <div className="md:col-span-2"><Label>Resumo</Label><Textarea rows={2} value={f.excerpt} onChange={e=>setF({...f, excerpt: e.target.value})} /></div>
        <div className="md:col-span-2"><Label>Corpo do texto</Label><Textarea rows={8} value={f.body} onChange={e=>setF({...f, body: e.target.value})} /></div>
        <label className="flex items-center gap-2 text-sm text-gray-300 md:col-span-2">
          <input type="checkbox" checked={f.featured} onChange={e=>setF({...f, featured: e.target.checked})} /> Destaque (aparece em carrosséis)
        </label>
        {err && <p className="md:col-span-2 text-sm text-red-400">{err}</p>}
      </div>
    </Modal>
  );
}
