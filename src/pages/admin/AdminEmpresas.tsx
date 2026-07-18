import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Btn, Card, Input, Label, Modal, PageHeader, Select, Textarea, EmptyState } from './ui';
import { useAsync } from './hooks';
import { Pencil, Trash2, Check, X, Star } from 'lucide-react';

type Partner = any;

export default function AdminEmpresas() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [status, setStatus] = useState<'all' | 'approved' | 'pending_curation' | 'rejected'>('all');
  const [extraFilter, setExtraFilter] = useState<'none' | 'no_photo' | 'incomplete'>('none');
  const [editing, setEditing] = useState<Partner | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const s = params.get('status');
    if (s === 'approved' || s === 'pending_curation' || s === 'rejected') setStatus(s);
    const f = params.get('filter');
    if (f === 'no_photo' || f === 'incomplete') setExtraFilter(f);
  }, [params]);

  const clearFilter = () => { setExtraFilter('none'); setStatus('all'); setParams({}); };

  const { data, loading, reload } = useAsync(async () => {
    let q = supabase.from('partners').select('*, coupons(purchase_amount)').order('created_at', { ascending: false });
    if (status !== 'all') q = q.eq('status', status);
    const { data, error } = await q;
    if (error) throw error;
    return (data || []).filter((p: any) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (city && !(p.city || '').toLowerCase().includes(city.toLowerCase())) return false;
      if (extraFilter === 'no_photo' && (p.logo_url || p.profile_image_url || p.banner_url)) return false;
      if (extraFilter === 'incomplete') {
        const hasContact = !!(p.whatsapp || p.phone || p.email);
        const complete = !!p.name && hasContact && !!p.description;
        if (complete) return false;
      }
      return true;
    });
  }, [search, city, status, extraFilter]);

  const cats = useAsync(async () => {
    const { data } = await supabase.from('partner_categories').select('*').order('name');
    return data || [];
  });

  const toggleMember = async (p: Partner) => {
    await supabase.from('partners').update({ is_member: !p.is_member }).eq('id', p.id);
    reload();
  };
  const toggleCashbackUnlock = async (p: Partner) => {
    const { error } = await supabase.from('partners').update({ cashback_feature_unlocked: !p.cashback_feature_unlocked }).eq('id', p.id);
    if (error) { alert('Erro ao liberar Cashback: ' + error.message); return; }
    await reload();
  };
  const toggleProductsUnlock = async (p: Partner) => {
    const { error } = await supabase.from('partners').update({ products_feature_unlocked: !p.products_feature_unlocked }).eq('id', p.id);
    if (error) { alert('Erro ao liberar Vitrine: ' + error.message); return; }
    await reload();
  };
  const setStatusOf = async (p: Partner, s: string) => {
    await supabase.from('partners').update({ status: s }).eq('id', p.id);
    reload();
  };
  const remove = async (p: Partner) => {
    if (!confirm(`Excluir ${p.name}?`)) return;
    await supabase.from('partners').delete().eq('id', p.id);
    reload();
  };

  return (
    <>
      <PageHeader title="Empresas" subtitle="Gestão de parceiros e fila de curadoria"
        actions={<Btn onClick={() => setCreating(true)}>+ Adicionar</Btn>} />
      <Card className="p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <Input placeholder="Buscar por nome…" value={search} onChange={e => setSearch(e.target.value)} />
          <Input placeholder="Cidade…" value={city} onChange={e => setCity(e.target.value)} />
          <Select value={status} onChange={e => setStatus(e.target.value as any)}>
            <option value="all">Todos os status</option>
            <option value="approved">Aprovadas</option>
            <option value="pending_curation">Pendentes de curadoria</option>
            <option value="rejected">Recusadas</option>
          </Select>
          <Select value={extraFilter} onChange={e => setExtraFilter(e.target.value as any)}>
            <option value="none">Sem filtro extra</option>
            <option value="no_photo">Sem foto cadastrada</option>
            <option value="incomplete">Cadastro incompleto</option>
          </Select>
        </div>
        {(extraFilter !== 'none' || status !== 'all') && (
          <div className="mt-2 text-xs text-gray-400">
            Filtros ativos <button onClick={clearFilter} className="ml-2 underline text-yellow-400">limpar</button>
          </div>
        )}
      </Card>

      {loading ? <EmptyState>Carregando…</EmptyState> :
       !data?.length ? <EmptyState>Nenhuma empresa encontrada.</EmptyState> : (
        <div className="space-y-2">
          {data.map((p: any) => {
            const totalTx = (p.coupons || []).reduce((s: number, c: any) => s + Number(c.purchase_amount || 0), 0);
            const nCup = (p.coupons || []).length;
            return (
              <Card key={p.id} className="p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-white font-medium">{p.name}</div>
                      {p.is_member && <span className="text-[10px] bg-yellow-500 text-black px-1.5 py-0.5">EMPRESA MEMBRO</span>}
                      {p.status === 'pending_curation' && <span className="text-[10px] border border-yellow-500 text-yellow-400 px-1.5 py-0.5">PENDENTE</span>}
                      {p.status === 'rejected' && <span className="text-[10px] border border-red-500 text-red-400 px-1.5 py-0.5">RECUSADA</span>}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{p.category} · {p.city || '—'} · Desconto {p.discount}</div>
                    <div className="text-xs text-gray-400 mt-1">{nCup} cupons · R$ {totalTx.toFixed(2)} transacionado</div>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {p.status === 'pending_curation' && (
                      <>
                        <Btn variant="primary" onClick={() => setStatusOf(p, 'approved')}><Check size={12} className="inline" /> Aprovar</Btn>
                        <Btn variant="ghost" onClick={() => setStatusOf(p, 'rejected')}><X size={12} className="inline" /> Recusar</Btn>
                      </>
                    )}
                    <Btn variant="ghost" onClick={() => toggleMember(p)}><Star size={12} className="inline" /> {p.is_member ? 'Remover' : 'Membro'}</Btn>
                    <Btn
                      variant={p.cashback_feature_unlocked ? 'primary' : 'ghost'}
                      onClick={() => toggleCashbackUnlock(p)}

                    >
                      💸 {p.cashback_feature_unlocked ? 'Cashback ON' : 'Liberar Cashback'}
                    </Btn>
                    <Btn
                      variant={p.products_feature_unlocked ? 'primary' : 'ghost'}
                      onClick={() => toggleProductsUnlock(p)}

                    >
                      🛍️ {p.products_feature_unlocked ? 'Vitrine ON' : 'Liberar Vitrine'}
                    </Btn>
                    <Btn variant="ghost" onClick={() => setEditing(p)}><Pencil size={12} /></Btn>
                    <Btn variant="danger" onClick={() => remove(p)}><Trash2 size={12} /></Btn>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {(editing || creating) && (
        <PartnerForm
          partner={editing}
          categories={cats.data || []}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { setEditing(null); setCreating(false); reload(); }}
        />
      )}
    </>
  );
}

function PartnerForm({ partner, categories, onClose, onSaved }: { partner: any | null; categories: any[]; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    name: partner?.name || '',
    category: partner?.category || (categories[0]?.name || ''),
    city: partner?.city || '',
    discount: partner?.discount || '',
    description: partner?.description || '',
    whatsapp: partner?.whatsapp || '',
    instagram: partner?.instagram || '',
    website: partner?.website || '',
    opening_hours: partner?.opening_hours || '',
    logo_url: partner?.logo_url || '',
    banner_url: partner?.banner_url || '',
    is_member: partner?.is_member || false,
    status: partner?.status || 'approved',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      if (partner) await supabase.from('partners').update(f).eq('id', partner.id);
      else await supabase.from('partners').insert(f);
      onSaved();
    } catch (e: any) {
      alert(e.message);
    } finally { setSaving(false); }
  };

  return (
    <Modal open onClose={onClose} title={partner ? 'Editar empresa' : 'Nova empresa'}
      footer={<>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn onClick={save} disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</Btn>
      </>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div><Label>Nome</Label><Input value={f.name} onChange={e=>setF({...f, name: e.target.value})} /></div>
        <div><Label>Categoria</Label><Select value={f.category} onChange={e=>setF({...f, category: e.target.value})}>
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </Select></div>
        <div><Label>Cidade</Label><Input value={f.city} onChange={e=>setF({...f, city: e.target.value})} /></div>
        <div><Label>Desconto</Label><Input value={f.discount} onChange={e=>setF({...f, discount: e.target.value})} placeholder="Ex: 15%" /></div>
        <div><Label>WhatsApp</Label><Input value={f.whatsapp} onChange={e=>setF({...f, whatsapp: e.target.value})} /></div>
        <div><Label>Instagram</Label><Input value={f.instagram} onChange={e=>setF({...f, instagram: e.target.value})} /></div>
        <div><Label>Site</Label><Input value={f.website} onChange={e=>setF({...f, website: e.target.value})} /></div>
        <div><Label>Horário</Label><Input value={f.opening_hours} onChange={e=>setF({...f, opening_hours: e.target.value})} /></div>
        <div><Label>Logo URL</Label><Input value={f.logo_url} onChange={e=>setF({...f, logo_url: e.target.value})} /></div>
        <div><Label>Banner URL</Label><Input value={f.banner_url} onChange={e=>setF({...f, banner_url: e.target.value})} /></div>
        <div className="md:col-span-2"><Label>Descrição</Label><Textarea rows={3} value={f.description} onChange={e=>setF({...f, description: e.target.value})} /></div>
        <div><Label>Status</Label><Select value={f.status} onChange={e=>setF({...f, status: e.target.value})}>
          <option value="approved">Aprovada</option>
          <option value="pending_curation">Pendente</option>
          <option value="rejected">Recusada</option>
        </Select></div>
        <label className="flex items-center gap-2 text-sm text-gray-300 mt-6">
          <input type="checkbox" checked={f.is_member} onChange={e=>setF({...f, is_member: e.target.checked})} />
          Empresa Membro
        </label>
      </div>
    </Modal>
  );
}
