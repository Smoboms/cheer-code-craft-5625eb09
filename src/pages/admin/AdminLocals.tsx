import { CardGridSkeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Btn, Card, EmptyState, Input, Label, Modal, PageHeader, Select, Textarea } from './ui';
import { useAsync } from './hooks';
import { Pencil, Trash2 } from 'lucide-react';

const TIPOS = ['utilidade', 'hotel', 'turismo', 'servico', 'outro'];

type Lugar = {
  id?: string;
  nome: string;
  slug: string;
  tipo: string;
  categoria: string | null;
  descricao: string | null;
  endereco: string | null;
  telefone: string | null;
  whatsapp: string | null;
  site: string | null;
  google_maps_url: string | null;
  horario_funcionamento: string | null;
  foto: string | null;
  ativo: boolean;
};

const empty: Lugar = {
  nome: '', slug: '', tipo: 'utilidade', categoria: '', descricao: '', endereco: '',
  telefone: '', whatsapp: '', site: '', google_maps_url: '',
  horario_funcionamento: '', foto: '', ativo: true,
};

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function AdminLocals() {
  const { data, loading, reload } = useAsync(async () =>
    (await supabase.from('lugares').select('*').order('created_at', { ascending: false })).data || []
  );
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<Lugar>(empty);
  const [saving, setSaving] = useState(false);

  const openNew = () => { setF(empty); setOpen(true); };
  const openEdit = (l: any) => { setF({ ...l }); setOpen(true); };

  const save = async () => {
    if (!f.nome.trim()) return alert('Nome obrigatório');
    setSaving(true);
    const payload = {
      ...f,
      slug: f.slug?.trim() || slugify(f.nome),
      categoria: f.categoria || null,
      google_maps_url: f.google_maps_url || null,
    };
    const { error } = f.id
      ? await supabase.from('lugares').update(payload).eq('id', f.id)
      : await supabase.from('lugares').insert(payload);
    setSaving(false);
    if (error) return alert(error.message);
    setOpen(false); reload();
  };

  const del = async (l: any) => {
    if (!confirm(`Excluir "${l.nome}"?`)) return;
    const { error } = await supabase.from('lugares').delete().eq('id', l.id);
    if (error) return alert(error.message);
    reload();
  };

  const toggle = async (l: any) => {
    await supabase.from('lugares').update({ ativo: !l.ativo }).eq('id', l.id);
    reload();
  };

  return (
    <>
      <PageHeader
        title="Locais"
        subtitle="Lugares de utilidade pública, hotéis, turismo e serviços"
        actions={<Btn onClick={openNew}>+ Novo local</Btn>}
      />

      {loading ? (
        <div className="p-2"><CardGridSkeleton items={3} /></div>
      ) : !data?.length ? (
        <EmptyState>Nenhum local cadastrado.</EmptyState>
      ) : (
        <div className="space-y-2">
          {data.map((l: any) => (
            <Card key={l.id} className="p-3 flex justify-between items-start gap-3">
              <div className="min-w-0">
                <div className="text-white text-sm font-medium truncate">
                  {l.nome} {!l.ativo && <span className="text-red-400 text-xs">(inativo)</span>}
                </div>
                <div className="text-xs text-gray-400">
                  <span className="uppercase tracking-wider">{l.tipo}</span>
                  {l.categoria && <> · {l.categoria}</>}
                  {l.telefone && <> · {l.telefone}</>}
                </div>
                {l.endereco && <div className="text-xs text-gray-500 truncate mt-0.5">{l.endereco}</div>}
              </div>
              <div className="flex gap-1 shrink-0">
                <Btn variant="ghost" onClick={() => toggle(l)}>{l.ativo ? 'Desativar' : 'Ativar'}</Btn>
                <Btn variant="ghost" onClick={() => openEdit(l)}><Pencil size={12} /></Btn>
                <Btn variant="danger" onClick={() => del(l)}><Trash2 size={12} /></Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={f.id ? 'Editar local' : 'Novo local'}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setOpen(false)}>Cancelar</Btn>
            <Btn onClick={save} disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</Btn>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2"><Label>Nome</Label>
            <Input value={f.nome} onChange={e => setF({ ...f, nome: e.target.value, slug: f.slug || slugify(e.target.value) })} />
          </div>
          <div><Label>Slug</Label><Input value={f.slug} onChange={e => setF({ ...f, slug: e.target.value })} /></div>
          <div><Label>Tipo</Label>
            <Select value={f.tipo} onChange={e => setF({ ...f, tipo: e.target.value })}>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
          <div><Label>Categoria</Label><Input value={f.categoria ?? ''} onChange={e => setF({ ...f, categoria: e.target.value })} /></div>
          <div><Label>Foto (URL)</Label><Input value={f.foto ?? ''} onChange={e => setF({ ...f, foto: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Descrição</Label>
            <Textarea rows={2} value={f.descricao ?? ''} onChange={e => setF({ ...f, descricao: e.target.value })} />
          </div>
          <div className="md:col-span-2"><Label>Endereço</Label><Input value={f.endereco ?? ''} onChange={e => setF({ ...f, endereco: e.target.value })} /></div>
          <div><Label>Telefone</Label><Input value={f.telefone ?? ''} onChange={e => setF({ ...f, telefone: e.target.value })} /></div>
          <div><Label>WhatsApp</Label><Input value={f.whatsapp ?? ''} onChange={e => setF({ ...f, whatsapp: e.target.value })} /></div>
          <div><Label>Site</Label><Input value={f.site ?? ''} onChange={e => setF({ ...f, site: e.target.value })} /></div>
          <div><Label>Horário</Label><Input value={f.horario_funcionamento ?? ''} onChange={e => setF({ ...f, horario_funcionamento: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Link Google Maps</Label>
            <Input value={f.google_maps_url ?? ''} onChange={e => setF({ ...f, google_maps_url: e.target.value })} placeholder="https://maps.google.com/?q=..." />
          </div>
          <label className="md:col-span-2 flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={f.ativo} onChange={e => setF({ ...f, ativo: e.target.checked })} /> Ativo
          </label>
        </div>
      </Modal>
    </>
  );
}
