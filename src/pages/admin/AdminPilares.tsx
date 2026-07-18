import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Btn, Card, EmptyState, Input, Label, Modal, PageHeader, Select, Textarea } from './ui';
import { useAsync } from './hooks';
import { Pencil, Trash2, Eye, EyeOff, Settings } from 'lucide-react';

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
  banner_url: string | null;
  data_evento: string | null;
  local: string | null;
  link: string | null;
  ordem: number;
  ativo: boolean;
  publicado: boolean;
};

const empty: Row = {
  pilar: 'nexus', tipo: 'evento', titulo: '', subtitulo: '', descricao: '',
  imagem_url: '', banner_url: '', data_evento: null, local: '', link: '',
  ordem: 0, ativo: true, publicado: true,
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
  const [detailsFor, setDetailsFor] = useState<any | null>(null);

  const rows = (data || []).filter((r: any) =>
    (fPilar === 'all' || r.pilar === fPilar) && (fTipo === 'all' || r.tipo === fTipo)
  );

  const openNew = () => { setF({ ...empty, ordem: data?.length || 0 }); setOpen(true); };
  const openEdit = (r: any) => {
    setF({
      ...empty,
      ...r,
      data_evento: r.data_evento ? r.data_evento.slice(0, 16) : null,
    });
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
      banner_url: f.banner_url || null,
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
    if (!confirm(`Excluir "${r.titulo}"? Todos os detalhes (palestrantes, galeria, cronograma) também serão removidos.`)) return;
    await supabase.from('pilar_conteudos').delete().eq('id', r.id);
    reload();
  };

  const toggleAtivo = async (r: any) => {
    await supabase.from('pilar_conteudos').update({ ativo: !r.ativo }).eq('id', r.id);
    reload();
  };
  const togglePublicado = async (r: any) => {
    await supabase.from('pilar_conteudos').update({ publicado: !r.publicado }).eq('id', r.id);
    reload();
  };

  return (
    <>
      <PageHeader
        title="Pilares"
        subtitle="NEXUS, ELAS e MAGNA — eventos, premiações e conteúdos"
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
                  {r.ativo && !r.publicado && <span className="text-orange-400 text-xs">rascunho</span>}
                </div>
                <div className="text-white text-sm font-medium mt-1 truncate">{r.titulo}</div>
                {r.subtitulo && <div className="text-xs text-gray-400 truncate">{r.subtitulo}</div>}
                {r.data_evento && <div className="text-xs text-gray-500 mt-0.5">{new Date(r.data_evento).toLocaleString('pt-BR')}</div>}
              </div>
              <div className="flex gap-1 shrink-0 flex-wrap justify-end">
                <Btn variant="ghost" onClick={() => setDetailsFor(r)}><Settings size={12} /> Detalhes</Btn>
                <Btn variant="ghost" onClick={() => togglePublicado(r)}>{r.publicado ? <><EyeOff size={12} /> Despublicar</> : <><Eye size={12} /> Publicar</>}</Btn>
                <Btn variant="ghost" onClick={() => toggleAtivo(r)}>{r.ativo ? 'Desativar' : 'Ativar'}</Btn>
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
          <div><Label>Imagem principal (URL)</Label><Input value={f.imagem_url ?? ''} onChange={e => setF({ ...f, imagem_url: e.target.value })} /></div>
          <div><Label>Banner do pilar (URL)</Label><Input value={f.banner_url ?? ''} onChange={e => setF({ ...f, banner_url: e.target.value })} /></div>
          <div><Label>Link</Label><Input value={f.link ?? ''} onChange={e => setF({ ...f, link: e.target.value })} /></div>
          <div><Label>Data/Hora do evento</Label><Input type="datetime-local" value={f.data_evento ?? ''} onChange={e => setF({ ...f, data_evento: e.target.value || null })} /></div>
          <div><Label>Local</Label><Input value={f.local ?? ''} onChange={e => setF({ ...f, local: e.target.value })} /></div>
          <div><Label>Ordem</Label><Input type="number" value={f.ordem} onChange={e => setF({ ...f, ordem: Number(e.target.value) })} /></div>
          <label className="flex items-end gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={f.ativo} onChange={e => setF({ ...f, ativo: e.target.checked })} /> Ativo
          </label>
          <label className="flex items-end gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={f.publicado} onChange={e => setF({ ...f, publicado: e.target.checked })} /> Publicado
          </label>
        </div>
      </Modal>

      {detailsFor && (
        <PilarDetailsModal item={detailsFor} onClose={() => setDetailsFor(null)} />
      )}
    </>
  );
}

// ============ Details Modal (Palestrantes / Empresas / Galeria / Cronograma) ============
type Tab = 'palestrantes' | 'empresas' | 'galeria' | 'cronograma';

function PilarDetailsModal({ item, onClose }: { item: any; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('palestrantes');

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0f1830] border border-white/15 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-yellow-400">{PILAR_LABEL[item.pilar as Pilar]} • {TIPO_LABEL[item.tipo as Tipo]}</div>
            <h2 className="text-white font-semibold truncate">{item.titulo}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="flex border-b border-white/10 overflow-x-auto">
          {(['palestrantes', 'empresas', 'galeria', 'cronograma'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-xs uppercase tracking-wider whitespace-nowrap ${tab === t ? 'text-yellow-400 border-b-2 border-yellow-500' : 'text-gray-400'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="p-5">
          {tab === 'palestrantes' && <PalestrantesTab conteudoId={item.id} />}
          {tab === 'empresas' && <EmpresasTab conteudoId={item.id} />}
          {tab === 'galeria' && <GaleriaTab conteudoId={item.id} />}
          {tab === 'cronograma' && <CronogramaTab conteudoId={item.id} />}
        </div>
      </div>
    </div>
  );
}

function useList<T>(table: string, conteudoId: string) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from(table).select('*').eq('pilar_conteudo_id', conteudoId).order('ordem', { ascending: true });
    setRows((data || []) as T[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, [conteudoId]);
  return { rows, loading, reload: load };
}

function PalestrantesTab({ conteudoId }: { conteudoId: string }) {
  const { rows, loading, reload } = useList<any>('pilar_palestrantes', conteudoId);
  const [f, setF] = useState({ nome: '', cargo: '', bio: '', foto_url: '', ordem: 0 });
  const add = async () => {
    if (!f.nome.trim()) return;
    await (supabase as any).from('pilar_palestrantes').insert({ ...f, pilar_conteudo_id: conteudoId, cargo: f.cargo || null, bio: f.bio || null, foto_url: f.foto_url || null });
    setF({ nome: '', cargo: '', bio: '', foto_url: '', ordem: 0 }); reload();
  };
  const del = async (id: string) => { await (supabase as any).from('pilar_palestrantes').delete().eq('id', id); reload(); };
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        <Input placeholder="Nome" value={f.nome} onChange={e => setF({ ...f, nome: e.target.value })} />
        <Input placeholder="Cargo" value={f.cargo} onChange={e => setF({ ...f, cargo: e.target.value })} />
        <Input placeholder="Foto (URL)" value={f.foto_url} onChange={e => setF({ ...f, foto_url: e.target.value })} />
        <Input type="number" placeholder="Ordem" value={f.ordem} onChange={e => setF({ ...f, ordem: Number(e.target.value) })} />
        <Textarea className="md:col-span-2" placeholder="Bio" rows={2} value={f.bio} onChange={e => setF({ ...f, bio: e.target.value })} />
      </div>
      <Btn onClick={add}>+ Adicionar palestrante</Btn>
      <div className="mt-4 space-y-2">
        {loading ? <div className="text-gray-400 text-sm">Carregando…</div>
          : !rows.length ? <div className="text-gray-500 text-sm">Nenhum palestrante.</div>
          : rows.map(r => (
            <Card key={r.id} className="p-2 flex justify-between items-center">
              <div className="text-sm text-white">{r.nome} {r.cargo && <span className="text-gray-400 text-xs">— {r.cargo}</span>}</div>
              <Btn variant="danger" onClick={() => del(r.id)}><Trash2 size={12} /></Btn>
            </Card>
          ))}
      </div>
    </>
  );
}

function EmpresasTab({ conteudoId }: { conteudoId: string }) {
  const { rows, loading, reload } = useList<any>('pilar_empresas', conteudoId);
  const [partners, setPartners] = useState<{ id: string; name: string }[]>([]);
  const [f, setF] = useState({ partner_id: '', nome: '', logo_url: '', ordem: 0 });
  useEffect(() => {
    supabase.from('partners').select('id,name').eq('is_active', true).order('name').then(({ data }) => setPartners((data as any) || []));
  }, []);
  const add = async () => {
    const nome = f.partner_id ? (partners.find(p => p.id === f.partner_id)?.name || f.nome) : f.nome;
    if (!nome.trim()) return;
    await (supabase as any).from('pilar_empresas').insert({
      pilar_conteudo_id: conteudoId,
      partner_id: f.partner_id || null,
      nome,
      logo_url: f.logo_url || null,
      ordem: f.ordem,
    });
    setF({ partner_id: '', nome: '', logo_url: '', ordem: 0 }); reload();
  };
  const del = async (id: string) => { await (supabase as any).from('pilar_empresas').delete().eq('id', id); reload(); };
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        <Select value={f.partner_id} onChange={e => setF({ ...f, partner_id: e.target.value })}>
          <option value="">— Empresa parceira (opcional) —</option>
          {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
        <Input placeholder="Nome (ou sobrescrever)" value={f.nome} onChange={e => setF({ ...f, nome: e.target.value })} />
        <Input placeholder="Logo (URL)" value={f.logo_url} onChange={e => setF({ ...f, logo_url: e.target.value })} />
        <Input type="number" placeholder="Ordem" value={f.ordem} onChange={e => setF({ ...f, ordem: Number(e.target.value) })} />
      </div>
      <Btn onClick={add}>+ Adicionar empresa</Btn>
      <div className="mt-4 space-y-2">
        {loading ? <div className="text-gray-400 text-sm">Carregando…</div>
          : !rows.length ? <div className="text-gray-500 text-sm">Nenhuma empresa.</div>
          : rows.map(r => (
            <Card key={r.id} className="p-2 flex justify-between items-center">
              <div className="text-sm text-white">{r.nome}</div>
              <Btn variant="danger" onClick={() => del(r.id)}><Trash2 size={12} /></Btn>
            </Card>
          ))}
      </div>
    </>
  );
}

function GaleriaTab({ conteudoId }: { conteudoId: string }) {
  const { rows, loading, reload } = useList<any>('pilar_galeria', conteudoId);
  const [f, setF] = useState({ imagem_url: '', legenda: '', ordem: 0 });
  const add = async () => {
    if (!f.imagem_url.trim()) return;
    await (supabase as any).from('pilar_galeria').insert({ ...f, pilar_conteudo_id: conteudoId, legenda: f.legenda || null });
    setF({ imagem_url: '', legenda: '', ordem: 0 }); reload();
  };
  const del = async (id: string) => { await (supabase as any).from('pilar_galeria').delete().eq('id', id); reload(); };
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        <Input className="md:col-span-2" placeholder="Imagem (URL)" value={f.imagem_url} onChange={e => setF({ ...f, imagem_url: e.target.value })} />
        <Input placeholder="Legenda" value={f.legenda} onChange={e => setF({ ...f, legenda: e.target.value })} />
        <Input type="number" placeholder="Ordem" value={f.ordem} onChange={e => setF({ ...f, ordem: Number(e.target.value) })} />
      </div>
      <Btn onClick={add}>+ Adicionar imagem</Btn>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
        {loading ? <div className="text-gray-400 text-sm">Carregando…</div>
          : !rows.length ? <div className="text-gray-500 text-sm">Galeria vazia.</div>
          : rows.map(r => (
            <div key={r.id} className="relative border border-white/10">
              <img src={r.imagem_url} alt={r.legenda ?? ''} className="w-full aspect-video object-cover" loading="lazy" decoding="async" />
              <button onClick={() => del(r.id)} className="absolute top-1 right-1 bg-red-600 text-white p-1"><Trash2 size={12} /></button>
              {r.legenda && <div className="p-1 text-[10px] text-gray-300 truncate">{r.legenda}</div>}
            </div>
          ))}
      </div>
    </>
  );
}

function CronogramaTab({ conteudoId }: { conteudoId: string }) {
  const { rows, loading, reload } = useList<any>('pilar_cronograma', conteudoId);
  const [f, setF] = useState({ horario: '', titulo: '', descricao: '', ordem: 0 });
  const add = async () => {
    if (!f.horario.trim() || !f.titulo.trim()) return;
    await (supabase as any).from('pilar_cronograma').insert({ ...f, pilar_conteudo_id: conteudoId, descricao: f.descricao || null });
    setF({ horario: '', titulo: '', descricao: '', ordem: 0 }); reload();
  };
  const del = async (id: string) => { await (supabase as any).from('pilar_cronograma').delete().eq('id', id); reload(); };
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        <Input placeholder="Horário (ex: 19h00)" value={f.horario} onChange={e => setF({ ...f, horario: e.target.value })} />
        <Input placeholder="Título" value={f.titulo} onChange={e => setF({ ...f, titulo: e.target.value })} />
        <Textarea className="md:col-span-2" rows={2} placeholder="Descrição" value={f.descricao} onChange={e => setF({ ...f, descricao: e.target.value })} />
        <Input type="number" placeholder="Ordem" value={f.ordem} onChange={e => setF({ ...f, ordem: Number(e.target.value) })} />
      </div>
      <Btn onClick={add}>+ Adicionar item</Btn>
      <div className="mt-4 space-y-2">
        {loading ? <div className="text-gray-400 text-sm">Carregando…</div>
          : !rows.length ? <div className="text-gray-500 text-sm">Sem cronograma.</div>
          : rows.map(r => (
            <Card key={r.id} className="p-2 flex justify-between items-center">
              <div className="text-sm"><span className="text-yellow-400 mr-2">{r.horario}</span><span className="text-white">{r.titulo}</span></div>
              <Btn variant="danger" onClick={() => del(r.id)}><Trash2 size={12} /></Btn>
            </Card>
          ))}
      </div>
    </>
  );
}
