import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Btn, Card, EmptyState, Input, Label, Modal, PageHeader, Select, Textarea } from './ui';
import { useAsync } from './hooks';
import { Pencil, Trash2 } from 'lucide-react';

type Pilar = 'nexus' | 'elas' | 'magna';
type Tipo = 'evento' | 'premiacao' | 'conteudo';

type Row = {
  id?: string;
  pilar: Pilar;
  tipo: Tipo;
  titulo: string;
  subtitulo: string | null;
  descricao: string | null;
  imagem_url: string | null;
  data_evento: string | null;
  local: string | null;
  link: string | null;
  ordem: number;
  ativo: boolean;
};

const empty: Row = {
  pilar: 'nexus', tipo: 'evento', titulo: '', subtitulo: '', descricao: '',
  imagem_url: '', data_evento: null, local: '', link: '', ordem: 0, ativo: true,
};

const PILAR_LABEL: Record<Pilar, string> = { nexus: 'NEXUS', elas: 'ELAS', magna: 'MAGNA' };
const TIPO_LABEL: Record<Tipo, string> = { evento: 'Evento', premiacao: 'Premiação', conteudo: 'Conteúdo' };

export default function AdminPilares() {
  const { data, loading, reload } = useAsync(async () =>
    (await supabase.from('pilar_conteudos').select('*').order('pilar').order('ordem')).data || []
  );
  const [fPilar, setFPilar] = useState<'all' | Pilar>('all');
  const [fTipo, setFTipo] = useState<'all' | Tipo>('all');
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<Row>(empty);
  const [saving, setSaving] = useState(false);

  const rows = (data || []).filter((r: any) =>
    (fPilar === 'all' || r.pilar === fPilar) && (fTipo === 'all' || r.tipo === fTipo)
  );

  const openNew = () => { setF({ ...empty, ordem: data?.length || 0 }); setOpen(true); };
  const openEdit = (r: any) => {
    setF({ ...r, data_evento: r.data_evento ? r.data_evento.slice(0, 16) : null });
    setOpen(true);
  };

  const save = async () => {
    if (!f.titulo.trim()) return alert('Título obrigatório');
    setSaving(true);
    const payload: any = {
      ...f,
      subtitulo: f.subtitulo || null,
      descricao: f.descricao || null,
      imagem_url: f.imagem_url || null,
      local: f.local || null,
      link: f.link || null,
      data_evento: f.data_evento ? new Date(f.data_evento).toISOString() : null,
    };
    const { error } = f.id
      ? await supabase.from('pilar_conteudos').update(payload).eq('id', f.id)
      : await supabase.from('pilar_conteudos').insert(payload);
    setSaving(false);
    if (error) return alert(error.message);
    setOpen(false); reload();
  };

  const del = async (r: any) => {
    if (!confirm(`Excluir "${r.titulo}"?`)) return;
    await supabase.from('pilar_conteudos').delete().eq('id', r.id);
    reload();
  };

  const toggle = async (r: any) => {
    await supabase.from('pilar_conteudos').update({ ativo: !r.ativo }).eq('id', r.id);
    reload();
  };

  return (
    <>
      <PageHeader
        title="Pilares"
        subtitle="Eventos, premiações e conteúdos de NEXUS, ELAS e MAGNA"
        actions={<Btn onClick={openNew}>+ Novo</Btn>}
      />

      <Card className="p-3 mb-4 grid grid-cols-1 md:grid-cols-2 gap-2">
        <div><Label>Pilar</Label><Select value={fPilar} onChange={e => setFPilar(e.target.value as any)}>
          <option value="all">Todos</option>
          <option value="nexus">NEXUS</option>
          <option value="elas">ELAS</option>
          <option value="magna">MAGNA</option>
        </Select></div>
        <div><Label>Tipo</Label><Select value={fTipo} onChange={e => setFTipo(e.target.value as any)}>
          <option value="all">Todos</option>
          <option value="evento">Evento</option>
          <option value="premiacao">Premiação</option>
          <option value="conteudo">Conteúdo</option>
        </Select></div>
      </Card>

      {loading ? <Card className="p-6 text-gray-400 text-sm">Carregando…</Card>
       : !rows.length ? <EmptyState>Nenhum conteúdo.</EmptyState> : (
        <div className="space-y-2">
          {rows.map((r: any) => (
            <Card key={r.id} className="p-3 flex justify-between items-start gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-300 uppercase tracking-wider">{PILAR_LABEL[r.pilar as Pilar]}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-white/10 text-gray-300 uppercase">{TIPO_LABEL[r.tipo as Tipo]}</span>
                  {!r.ativo && <span className="text-red-400 text-xs">inativo</span>}
                </div>
                <div className="text-white text-sm font-medium mt-1 truncate">{r.titulo}</div>
                {r.subtitulo && <div className="text-xs text-gray-400 truncate">{r.subtitulo}</div>}
                {r.data_evento && <div className="text-xs text-gray-500 mt-0.5">{new Date(r.data_evento).toLocaleString('pt-BR')}</div>}
              </div>
              <div className="flex gap-1 shrink-0">
                <Btn variant="ghost" onClick={() => toggle(r)}>{r.ativo ? 'Desativar' : 'Ativar'}</Btn>
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
        title={f.id ? 'Editar conteúdo' : 'Novo conteúdo'}
        footer={<>
          <Btn variant="ghost" onClick={() => setOpen(false)}>Cancelar</Btn>
          <Btn onClick={save} disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</Btn>
        </>}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div><Label>Pilar</Label><Select value={f.pilar} onChange={e => setF({ ...f, pilar: e.target.value as Pilar })}>
            <option value="nexus">NEXUS</option>
            <option value="elas">ELAS</option>
            <option value="magna">MAGNA</option>
          </Select></div>
          <div><Label>Tipo</Label><Select value={f.tipo} onChange={e => setF({ ...f, tipo: e.target.value as Tipo })}>
            <option value="evento">Evento</option>
            <option value="premiacao">Premiação</option>
            <option value="conteudo">Conteúdo</option>
          </Select></div>
          <div className="md:col-span-2"><Label>Título</Label><Input value={f.titulo} onChange={e => setF({ ...f, titulo: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Subtítulo</Label><Input value={f.subtitulo ?? ''} onChange={e => setF({ ...f, subtitulo: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Descrição</Label><Textarea rows={3} value={f.descricao ?? ''} onChange={e => setF({ ...f, descricao: e.target.value })} /></div>
          <div><Label>Imagem (URL)</Label><Input value={f.imagem_url ?? ''} onChange={e => setF({ ...f, imagem_url: e.target.value })} /></div>
          <div><Label>Link</Label><Input value={f.link ?? ''} onChange={e => setF({ ...f, link: e.target.value })} /></div>
          <div><Label>Data/Hora do evento</Label><Input type="datetime-local" value={f.data_evento ?? ''} onChange={e => setF({ ...f, data_evento: e.target.value || null })} /></div>
          <div><Label>Local</Label><Input value={f.local ?? ''} onChange={e => setF({ ...f, local: e.target.value })} /></div>
          <div><Label>Ordem</Label><Input type="number" value={f.ordem} onChange={e => setF({ ...f, ordem: Number(e.target.value) })} /></div>
          <label className="flex items-end gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={f.ativo} onChange={e => setF({ ...f, ativo: e.target.checked })} /> Ativo
          </label>
        </div>
      </Modal>
    </>
  );
}
