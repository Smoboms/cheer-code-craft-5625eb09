import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Btn, Card, EmptyState, Input, Label, Modal, PageHeader, Select, Textarea } from './ui';
import { useAsync } from './hooks';
import { Pencil, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { optimizeImage } from '@/lib/imageOptimizer';

type Status = 'draft' | 'published';

type Row = {
  id?: string;
  titulo: string;
  resumo: string | null;
  conteudo: string | null;
  imagem_url: string | null;
  data_publicacao: string | null;
  status: Status;
  ordem: number;
};

const empty: Row = {
  titulo: '', resumo: '', conteudo: '', imagem_url: '',
  data_publicacao: new Date().toISOString().slice(0, 16), status: 'draft', ordem: 0,
};

export default function AdminPanorama() {
  const { data, loading, reload } = useAsync(async () =>
    (await supabase.from('panorama_publicacoes').select('*').order('ordem').order('data_publicacao', { ascending: false })).data || []
  );
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<Row>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const openNew = () => { setF({ ...empty, ordem: data?.length || 0 }); setOpen(true); };
  const openEdit = (r: any) => {
    setF({ ...r, data_publicacao: r.data_publicacao ? r.data_publicacao.slice(0, 16) : null });
    setOpen(true);
  };

  const save = async () => {
    if (!f.titulo.trim()) return alert('Título obrigatório');
    setSaving(true);
    const payload: any = {
      titulo: f.titulo,
      resumo: f.resumo || null,
      conteudo: f.conteudo || null,
      imagem_url: f.imagem_url || null,
      status: f.status,
      ordem: f.ordem,
      data_publicacao: f.data_publicacao ? new Date(f.data_publicacao).toISOString() : new Date().toISOString(),
    };
    const { error } = f.id
      ? await supabase.from('panorama_publicacoes').update(payload).eq('id', f.id)
      : await supabase.from('panorama_publicacoes').insert(payload);
    setSaving(false);
    if (error) return alert(error.message);
    setOpen(false); reload();
  };

  const del = async (r: any) => {
    if (!confirm(`Excluir "${r.titulo}"?`)) return;
    await supabase.from('panorama_publicacoes').delete().eq('id', r.id);
    reload();
  };

  const togglePublish = async (r: any) => {
    const next: Status = r.status === 'published' ? 'draft' : 'published';
    await supabase.from('panorama_publicacoes').update({ status: next }).eq('id', r.id);
    reload();
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const optimized = await optimizeImage(file, { maxDimension: 1600, quality: 0.85 });
      const path = `panorama/${Date.now()}.webp`;
      const up = await supabase.storage.from('partner-images').upload(path, optimized, { upsert: true, contentType: 'image/webp' });
      if (up.error) throw up.error;
      const { data } = supabase.storage.from('partner-images').getPublicUrl(path);
      setF((s) => ({ ...s, imagem_url: data.publicUrl }));
    } catch (e: any) {
      alert(e.message || 'Erro no upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Panorama"
        subtitle="Publicações exibidas para os associados"
        actions={<Btn onClick={openNew}>+ Nova publicação</Btn>}
      />

      {loading ? <Card className="p-6 text-gray-400 text-sm">Carregando…</Card>
       : !data?.length ? <EmptyState>Nenhuma publicação cadastrada.</EmptyState> : (
        <div className="space-y-2">
          {data.map((r: any) => (
            <Card key={r.id} className="p-3 flex justify-between items-start gap-3">
              <div className="flex items-start gap-3 min-w-0">
                {r.imagem_url && <img src={r.imagem_url} alt="" className="w-14 h-14 object-cover border border-white/10 shrink-0" loading="lazy" />}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] px-1.5 py-0.5 uppercase tracking-wider ${r.status === 'published' ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-gray-400'}`}>
                      {r.status === 'published' ? 'PUBLICADO' : 'RASCUNHO'}
                    </span>
                    <span className="text-[10px] text-gray-500">#{r.ordem}</span>
                  </div>
                  <div className="text-white text-sm font-medium mt-1 truncate">{r.titulo}</div>
                  {r.resumo && <div className="text-xs text-gray-400 line-clamp-2">{r.resumo}</div>}
                  {r.data_publicacao && <div className="text-xs text-gray-500 mt-0.5">{new Date(r.data_publicacao).toLocaleString('pt-BR')}</div>}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Btn variant="ghost" onClick={() => togglePublish(r)}>
                  {r.status === 'published' ? <><EyeOff size={12} className="inline" /> Despublicar</> : <><Eye size={12} className="inline" /> Publicar</>}
                </Btn>
                <Btn variant="ghost" onClick={() => openEdit(r)}><Pencil size={12} /></Btn>
                <Btn variant="danger" onClick={() => del(r)}><Trash2 size={12} /></Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={f.id ? 'Editar publicação' : 'Nova publicação'}
        footer={<>
          <Btn variant="ghost" onClick={() => setOpen(false)}>Cancelar</Btn>
          <Btn onClick={save} disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</Btn>
        </>}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2"><Label>Título</Label><Input value={f.titulo} onChange={e => setF({ ...f, titulo: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Resumo</Label><Textarea rows={2} value={f.resumo ?? ''} onChange={e => setF({ ...f, resumo: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Conteúdo</Label><Textarea rows={6} value={f.conteudo ?? ''} onChange={e => setF({ ...f, conteudo: e.target.value })} /></div>
          <div className="md:col-span-2">
            <Label>Imagem</Label>
            <div className="flex items-center gap-3">
              {f.imagem_url && <img src={f.imagem_url} alt="" className="w-16 h-16 object-cover border border-white/10" />}
              <label className={`text-white text-sm underline cursor-pointer ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
                {uploading ? <><Loader2 size={12} className="inline animate-spin" /> Otimizando…</> : 'Enviar (converte para WEBP)'}
                <input type="file" accept="image/*" className="hidden" disabled={uploading}
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
              </label>
              {f.imagem_url && <Btn variant="ghost" onClick={() => setF({ ...f, imagem_url: '' })}>Remover</Btn>}
            </div>
          </div>
          <div><Label>Data</Label><Input type="datetime-local" value={f.data_publicacao ?? ''} onChange={e => setF({ ...f, data_publicacao: e.target.value || null })} /></div>
          <div><Label>Status</Label><Select value={f.status} onChange={e => setF({ ...f, status: e.target.value as Status })}>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
          </Select></div>
          <div><Label>Ordem de exibição</Label><Input type="number" value={f.ordem} onChange={e => setF({ ...f, ordem: Number(e.target.value) })} /></div>
        </div>
      </Modal>
    </>
  );
}
