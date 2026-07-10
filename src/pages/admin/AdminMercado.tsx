import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Btn, Card, EmptyState, Input, Label, PageHeader, Select, Textarea, Modal } from './ui';
import { Star, StarOff, Check, X, Trash2, Edit3 } from 'lucide-react';

type Row = {
  id: string;
  name: string;
  category: string | null;
  price: number | null;
  images: string[];
  status: string;
  is_featured: boolean;
  is_active: boolean;
  partner_id: string;
  description: string | null;
  partners?: { id: string; name: string } | null;
};

export default function AdminMercado() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [fStatus, setFStatus] = useState<string>('all');
  const [fPartner, setFPartner] = useState<string>('');
  const [fCat, setFCat] = useState<string>('');
  const [editing, setEditing] = useState<Row | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data }, { data: parts }, { data: cats }] = await Promise.all([
      supabase.from('marketplace_products').select('*, partners(id,name)').order('created_at', { ascending: false }),
      supabase.from('partners').select('id,name').order('name'),
      supabase.from('partner_categories').select('name').order('name'),
    ]);
    setRows((data as any) || []);
    setPartners((parts as any) || []);
    setCategories((cats || []).map((c: any) => c.name));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const pending = rows.filter((r) => r.status === 'pending_curation');
  const filtered = useMemo(() => rows.filter((r) => {
    if (fStatus !== 'all' && r.status !== fStatus) return false;
    if (fPartner && r.partner_id !== fPartner) return false;
    if (fCat && r.category !== fCat) return false;
    return true;
  }), [rows, fStatus, fPartner, fCat]);

  const approve = async (r: Row) => { await supabase.from('marketplace_products').update({ status: 'approved' }).eq('id', r.id); load(); };
  const reject = async (r: Row) => {
    const reason = prompt('Motivo da recusa (opcional):') || null;
    await supabase.from('marketplace_products').update({ status: 'rejected', rejection_reason: reason }).eq('id', r.id);
    load();
  };
  const toggleFeatured = async (r: Row) => { await supabase.from('marketplace_products').update({ is_featured: !r.is_featured }).eq('id', r.id); load(); };
  const del = async (r: Row) => { if (confirm('Excluir produto?')) { await supabase.from('marketplace_products').delete().eq('id', r.id); load(); } };

  return (
    <>
      <PageHeader title="Mercado Rarques" subtitle="Curadoria de produtos e ofertas em destaque" />

      {pending.length > 0 && (
        <Card className="p-4 mb-4">
          <div className="text-white font-semibold mb-3">Pendentes de Curadoria ({pending.length})</div>
          <div className="space-y-2">
            {pending.map((r) => (
              <div key={r.id} className="flex items-center gap-3 bg-[#0a0f1e] p-3 border border-yellow-500/30">
                {r.images?.[0] && <img src={r.images[0]} alt="" className="w-14 h-14 object-cover bg-black" />}
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-semibold truncate">{r.name}</div>
                  <div className="text-xs text-gray-400 truncate">{r.partners?.name} · {r.category || 'Sem categoria'}</div>
                </div>
                <Btn variant="primary" onClick={() => approve(r)}><Check size={12} /> Aprovar</Btn>
                <Btn variant="danger" onClick={() => reject(r)}><X size={12} /> Recusar</Btn>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-3 mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
        <div><Label>Status</Label><Select value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
          <option value="all">Todos</option>
          <option value="pending_curation">Pendentes</option>
          <option value="approved">Aprovados</option>
          <option value="rejected">Recusados</option>
        </Select></div>
        <div><Label>Empresa</Label><Select value={fPartner} onChange={(e) => setFPartner(e.target.value)}>
          <option value="">Todas</option>
          {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select></div>
        <div><Label>Categoria</Label><Select value={fCat} onChange={(e) => setFCat(e.target.value)}>
          <option value="">Todas</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select></div>
      </Card>

      {loading ? <div className="text-gray-400 text-sm">Carregando…</div> :
       !filtered.length ? <EmptyState>Nenhum produto encontrado.</EmptyState> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((r) => (
            <Card key={r.id} className="p-3 flex gap-3">
              <div className="w-20 h-20 bg-black shrink-0">
                {r.images?.[0] && <img src={r.images[0]} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-white text-sm font-semibold truncate">{r.name}</div>
                    <div className="text-xs text-gray-400 truncate">{r.partners?.name}</div>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 uppercase ${r.status==='approved'?'bg-green-500/20 text-green-300':r.status==='rejected'?'bg-red-500/20 text-red-300':'bg-yellow-500/20 text-yellow-300'}`}>{r.status}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{r.category || '—'} · {r.price != null ? `R$ ${Number(r.price).toFixed(2)}` : 'Sem preço'}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <Btn variant="ghost" onClick={() => toggleFeatured(r)}>
                    {r.is_featured ? <><StarOff size={12} /> Remover destaque</> : <><Star size={12} /> Destacar</>}
                  </Btn>
                  <Btn variant="ghost" onClick={() => setEditing(r)}><Edit3 size={12} /> Editar</Btn>
                  <Btn variant="danger" onClick={() => del(r)}><Trash2 size={12} /></Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && <EditProductModal row={editing} categories={categories} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </>
  );
}

function EditProductModal({ row, categories, onClose, onSaved }: { row: Row; categories: string[]; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ name: row.name, category: row.category || '', description: row.description || '', price: row.price ?? '', is_active: row.is_active, status: row.status });
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('marketplace_products').update({
      name: f.name, category: f.category || null, description: f.description || null,
      price: f.price === '' ? null : Number(f.price), is_active: f.is_active, status: f.status,
    }).eq('id', row.id);
    setSaving(false);
    if (error) alert(error.message); else onSaved();
  };
  return (
    <Modal open onClose={onClose} title="Editar produto" footer={<><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn onClick={save} disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</Btn></>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2"><Label>Nome</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><Label>Categoria</Label><Select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
          <option value="">—</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select></div>
        <div><Label>Preço (R$)</Label><Input type="number" step="0.01" value={f.price as any} onChange={(e) => setF({ ...f, price: e.target.value as any })} /></div>
        <div className="md:col-span-2"><Label>Descrição</Label><Textarea rows={4} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
        <div><Label>Status</Label><Select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
          <option value="pending_curation">Pendente</option>
          <option value="approved">Aprovado</option>
          <option value="rejected">Recusado</option>
        </Select></div>
        <div className="flex items-end"><label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} /> Ativo</label></div>
      </div>
    </Modal>
  );
}
