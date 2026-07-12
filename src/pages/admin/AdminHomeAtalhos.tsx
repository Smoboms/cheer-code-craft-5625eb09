import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Btn, Card, EmptyState, Input, Label, Modal, PageHeader } from './ui';
import { useAsync } from './hooks';
import { Pencil, Trash2 } from 'lucide-react';

type Atalho = {
  id?: string;
  titulo: string;
  icone: string | null;
  link: string;
  ordem: number;
  ativo: boolean;
  categoria: string | null;
};

const empty: Atalho = { titulo: '', icone: '', link: '', ordem: 0, ativo: true, categoria: '' };

const ICONES_PADRAO = ['MapPin', 'Hotel', 'Cloud', 'ShoppingBag', 'Wrench', 'Newspaper', 'Building2', 'Utensils', 'Coffee', 'Car', 'Heart', 'Star', 'Home', 'Briefcase', 'Phone', 'Calendar', 'Camera', 'Users'];
const CATEGORIAS_PADRAO = ['Serviços', 'Turismo', 'Hotelaria', 'Gastronomia', 'Saúde', 'Educação', 'Utilidade Pública', 'Comércio', 'Entretenimento'];

export default function AdminHomeAtalhos() {
  const { data, loading, reload } = useAsync(async () =>
    (await supabase.from('atalhos_da_casa').select('*').order('ordem', { ascending: true })).data || []
  );
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<Atalho>(empty);
  const [saving, setSaving] = useState(false);

  const openNew = () => { setF({ ...empty, ordem: data?.length || 0 }); setOpen(true); };
  const openEdit = (a: any) => { setF({ ...a }); setOpen(true); };

  const save = async () => {
    if (!f.titulo.trim() || !f.link.trim()) return alert('Título e link obrigatórios');
    setSaving(true);
    const { error } = f.id
      ? await supabase.from('atalhos_da_casa').update(f).eq('id', f.id)
      : await supabase.from('atalhos_da_casa').insert(f);
    setSaving(false);
    if (error) return alert(error.message);
    setOpen(false); reload();
  };

  const del = async (a: any) => {
    if (!confirm(`Excluir "${a.titulo}"?`)) return;
    const { error } = await supabase.from('atalhos_da_casa').delete().eq('id', a.id);
    if (error) return alert(error.message);
    reload();
  };

  const toggle = async (a: any) => {
    await supabase.from('atalhos_da_casa').update({ ativo: !a.ativo }).eq('id', a.id);
    reload();
  };

  return (
    <>
      <PageHeader
        title="Atalhos da Home"
        subtitle="Ícones de acesso rápido exibidos na Home pública"
        actions={<Btn onClick={openNew}>+ Novo atalho</Btn>}
      />

      {loading ? (
        <Card className="p-6 text-gray-400 text-sm">Carregando…</Card>
      ) : !data?.length ? (
        <EmptyState>Nenhum atalho.</EmptyState>
      ) : (
        <div className="space-y-2">
          {data.map((a: any) => (
            <Card key={a.id} className="p-3 flex justify-between items-start gap-3">
              <div className="min-w-0">
                <div className="text-white text-sm font-medium truncate">
                  #{a.ordem} · {a.titulo} {!a.ativo && <span className="text-red-400 text-xs">(inativo)</span>}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {a.icone && <span className="mr-2">[{a.icone}]</span>}→ {a.link}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Btn variant="ghost" onClick={() => toggle(a)}>{a.ativo ? 'Desativar' : 'Ativar'}</Btn>
                <Btn variant="ghost" onClick={() => openEdit(a)}><Pencil size={12} /></Btn>
                <Btn variant="danger" onClick={() => del(a)}><Trash2 size={12} /></Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={f.id ? 'Editar atalho' : 'Novo atalho'}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setOpen(false)}>Cancelar</Btn>
            <Btn onClick={save} disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</Btn>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2"><Label>Título</Label>
            <Input value={f.titulo} onChange={e => setF({ ...f, titulo: e.target.value })} />
          </div>
          <div><Label>Ícone (nome lucide)</Label>
            <Input value={f.icone ?? ''} onChange={e => setF({ ...f, icone: e.target.value })} placeholder="MapPin / Hotel / Cloud" />
          </div>
          <div><Label>Ordem</Label>
            <Input type="number" value={f.ordem} onChange={e => setF({ ...f, ordem: Number(e.target.value) })} />
          </div>
          <div className="md:col-span-2"><Label>Link</Label>
            <Input value={f.link} onChange={e => setF({ ...f, link: e.target.value })} placeholder="/empresas ou /buscar?type=local&cat=turismo" />
          </div>
          <label className="md:col-span-2 flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={f.ativo} onChange={e => setF({ ...f, ativo: e.target.checked })} /> Ativo
          </label>
        </div>
      </Modal>
    </>
  );
}
