import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Btn, Card, EmptyState, Input, Label, Modal, PageHeader } from './ui';
import { useAsync } from './hooks';
import { Pencil, Trash2 } from 'lucide-react';

type City = { id?: string; name: string; slug: string; uf: string; is_active: boolean };
const empty: City = { name: '', slug: '', uf: 'GO', is_active: true };

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function AdminCidades() {
  const { data, loading, reload } = useAsync(async () =>
    (await supabase.from('cities').select('*').order('name')).data || []
  );
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<City>(empty);
  const [saving, setSaving] = useState(false);

  const openNew = () => { setF(empty); setOpen(true); };
  const openEdit = (c: any) => { setF({ ...c }); setOpen(true); };

  const save = async () => {
    if (!f.name.trim() || !f.uf.trim()) return alert('Nome e UF obrigatórios');
    setSaving(true);
    const payload = { ...f, slug: f.slug?.trim() || slugify(f.name), uf: f.uf.toUpperCase() };
    const { error } = f.id
      ? await supabase.from('cities').update(payload).eq('id', f.id)
      : await supabase.from('cities').insert(payload);
    setSaving(false);
    if (error) return alert(error.message);
    setOpen(false); reload();
  };

  const toggle = async (c: any) => {
    await supabase.from('cities').update({ is_active: !c.is_active }).eq('id', c.id);
    reload();
  };

  const del = async (c: any) => {
    if (!confirm(`Excluir "${c.name}"?`)) return;
    const { error } = await supabase.from('cities').delete().eq('id', c.id);
    if (error) return alert(error.message);
    reload();
  };

  return (
    <>
      <PageHeader
        title="Cidades"
        subtitle="Estrutura pronta para expansão multi-cidade (sem alterar experiência atual)"
        actions={<Btn onClick={openNew}>+ Nova cidade</Btn>}
      />

      {loading ? <Card className="p-6 text-gray-400 text-sm">Carregando…</Card>
       : !data?.length ? <EmptyState>Nenhuma cidade.</EmptyState> : (
        <div className="space-y-2">
          {data.map((c: any) => (
            <Card key={c.id} className="p-3 flex justify-between items-center gap-3">
              <div>
                <div className="text-white text-sm font-medium">
                  {c.name} <span className="text-gray-500">/ {c.uf}</span>
                  {!c.is_active && <span className="text-red-400 text-xs ml-2">inativa</span>}
                </div>
                <div className="text-xs text-gray-500">slug: {c.slug}</div>
              </div>
              <div className="flex gap-1">
                <Btn variant="ghost" onClick={() => toggle(c)}>{c.is_active ? 'Desativar' : 'Ativar'}</Btn>
                <Btn variant="ghost" onClick={() => openEdit(c)}><Pencil size={12} /></Btn>
                <Btn variant="danger" onClick={() => del(c)}><Trash2 size={12} /></Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={f.id ? 'Editar cidade' : 'Nova cidade'}
        footer={<>
          <Btn variant="ghost" onClick={() => setOpen(false)}>Cancelar</Btn>
          <Btn onClick={save} disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</Btn>
        </>}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2"><Label>Nome</Label>
            <Input value={f.name} onChange={e => setF({ ...f, name: e.target.value, slug: f.slug || slugify(e.target.value) })} />
          </div>
          <div><Label>UF</Label><Input maxLength={2} value={f.uf} onChange={e => setF({ ...f, uf: e.target.value.toUpperCase() })} /></div>
          <div><Label>Slug</Label><Input value={f.slug} onChange={e => setF({ ...f, slug: e.target.value })} /></div>
          <label className="md:col-span-2 flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={f.is_active} onChange={e => setF({ ...f, is_active: e.target.checked })} /> Ativa
          </label>
        </div>
      </Modal>
    </>
  );
}
