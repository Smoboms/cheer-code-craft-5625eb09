import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Btn, Card, EmptyState, Input, Label, Modal, PageHeader, Select } from './ui';
import { useAsync } from './hooks';
import { Pencil, Trash2, UserCheck, UserX } from 'lucide-react';

export default function AdminAssociados() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [editing, setEditing] = useState<any | null>(null);
  const [cardsFor, setCardsFor] = useState<any | null>(null);

  const [accountType, setAccountType] = useState<'all' | 'client' | 'company'>('all');
  const { data, loading, reload } = useAsync(async () => {
    // Fetch profiles and coupons separately — coupons.user_id has FK to auth.users, not profiles,
    // so PostgREST embedded resource selection was returning an error and no rows.
    let q = supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (status === 'active') q = q.eq('is_active', true);
    if (status === 'inactive') q = q.eq('is_active', false);
    if (accountType !== 'all') q = q.eq('account_type', accountType);
    const [{ data: profs, error: profErr }, { data: coups, error: coupErr }] = await Promise.all([
      q,
      supabase.from('coupons').select('user_id, savings, created_at'),
    ]);
    if (profErr) console.error('profiles fetch', profErr);
    if (coupErr) console.error('coupons fetch', coupErr);
    const byUser = new Map<string, any[]>();
    (coups || []).forEach((c: any) => {
      const arr = byUser.get(c.user_id) || [];
      arr.push(c);
      byUser.set(c.user_id, arr);
    });
    const merged = (profs || []).map((p: any) => ({ ...p, coupons: byUser.get(p.user_id) || [] }));
    return merged.filter((p: any) => !search || (p.name || '').toLowerCase().includes(search.toLowerCase()) || (p.email || '').toLowerCase().includes(search.toLowerCase()));
  }, [search, status, accountType]);

  const toggleActive = async (p: any) => {
    await supabase.from('profiles').update({ is_active: !p.is_active }).eq('id', p.id);
    reload();
  };

  return (
    <>
      <PageHeader title="Associados" subtitle="Gestão de membros da Rarques" />
      <Card className="p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Input placeholder="Buscar por nome ou e-mail…" value={search} onChange={e=>setSearch(e.target.value)} />
          <Select value={status} onChange={e=>setStatus(e.target.value as any)}>
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </Select>
          <Select value={accountType} onChange={e=>setAccountType(e.target.value as any)}>
            <option value="all">Todos os tipos</option>
            <option value="client">Cliente</option>
            <option value="company">Empresa</option>
          </Select>
        </div>
      </Card>
      {loading ? <EmptyState>Carregando…</EmptyState> :
       !data?.length ? <EmptyState>Nenhum associado.</EmptyState> : (
        <div className="space-y-2">
          {data.map((p: any) => {
            const totalSavings = (p.coupons || []).reduce((s: number, c: any) => s + Number(c.savings || 0), 0);
            const nCup = (p.coupons || []).length;
            const lastAct = (p.coupons || []).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.created_at;
            return (
              <Card key={p.id} className="p-3">
                <div className="flex flex-wrap justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-white font-medium">{p.name || '(sem nome)'}</div>
                      <span className="text-[10px] border border-white/20 text-gray-300 px-1.5 py-0.5 uppercase">
                        {p.account_type === 'company' ? 'Empresa' : 'Cliente'}
                      </span>
                      {!p.is_active && <span className="text-[10px] border border-red-500 text-red-400 px-1.5 py-0.5">INATIVO</span>}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{p.email} · {p.company || '—'}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Entrou em {new Date(p.created_at).toLocaleDateString()} · {nCup} cupons ·
                      <span className="text-green-400"> R$ {totalSavings.toFixed(2)} economizados</span>
                      {lastAct && <> · Última atividade {new Date(lastAct).toLocaleDateString()}</>}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    <Btn variant="ghost" onClick={() => setCardsFor(p)}>Cartões</Btn>
                    <Btn variant="ghost" onClick={() => setEditing(p)}><Pencil size={12} /></Btn>
                    <Btn variant={p.is_active ? 'ghost' : 'primary'} onClick={() => toggleActive(p)}>
                      {p.is_active ? <><UserX size={12} className="inline" /> Desativar</> : <><UserCheck size={12} className="inline" /> Ativar</>}
                    </Btn>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {editing && <EditProfile profile={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
      {cardsFor && <AdditionalCards profile={cardsFor} onClose={() => setCardsFor(null)} />}
    </>
  );
}

function EditProfile({ profile, onClose, onSaved }: any) {
  const [f, setF] = useState({ name: profile.name || '', company: profile.company || '', phone: profile.phone || '', bio: profile.bio || '' });
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    await supabase.from('profiles').update(f).eq('id', profile.id);
    setSaving(false); onSaved();
  };
  return (
    <Modal open onClose={onClose} title="Editar associado"
      footer={<><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn onClick={save} disabled={saving}>{saving?'Salvando…':'Salvar'}</Btn></>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div><Label>Nome</Label><Input value={f.name} onChange={e=>setF({...f, name: e.target.value})} /></div>
        <div><Label>Empresa</Label><Input value={f.company} onChange={e=>setF({...f, company: e.target.value})} /></div>
        <div><Label>Telefone</Label><Input value={f.phone} onChange={e=>setF({...f, phone: e.target.value})} /></div>
        <div className="md:col-span-2"><Label>Bio</Label><Input value={f.bio} onChange={e=>setF({...f, bio: e.target.value})} /></div>
      </div>
    </Modal>
  );
}

function AdditionalCards({ profile, onClose }: any) {
  const [holder, setHolder] = useState('');
  const [rel, setRel] = useState('');
  const { data, reload } = useAsync(async () => (await supabase.from('additional_cards').select('*').eq('owner_user_id', profile.user_id).order('created_at')).data || [], [profile.user_id]);
  const gen = () => Array.from({length:16}, () => Math.floor(Math.random()*10)).join('');
  const add = async () => {
    if (!holder.trim()) return;
    await supabase.from('additional_cards').insert({ owner_user_id: profile.user_id, holder_name: holder.trim(), relationship: rel, card_number: gen() });
    setHolder(''); setRel(''); reload();
  };
  const toggle = async (c: any) => { await supabase.from('additional_cards').update({ is_active: !c.is_active }).eq('id', c.id); reload(); };
  const del = async (c: any) => { if (confirm('Excluir cartão?')) { await supabase.from('additional_cards').delete().eq('id', c.id); reload(); } };
  return (
    <Modal open onClose={onClose} title={`Cartões adicionais — ${profile.name || profile.email}`}
      footer={<Btn variant="ghost" onClick={onClose}>Fechar</Btn>}>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Input placeholder="Nome do portador" value={holder} onChange={e=>setHolder(e.target.value)} />
        <Input placeholder="Relação (ex: cônjuge)" value={rel} onChange={e=>setRel(e.target.value)} />
        <Btn onClick={add}>+ Adicionar</Btn>
      </div>
      {(!data?.length) ? <div className="text-gray-400 text-sm">Nenhum cartão adicional.</div> :
        <div className="space-y-1">
          {data.map((c: any) => (
            <div key={c.id} className="flex justify-between items-center bg-[#0a0f1e] px-3 py-2 border border-white/10">
              <div>
                <div className="text-white text-sm">{c.holder_name} <span className="text-gray-500">— {c.relationship || 'sem relação'}</span></div>
                <div className="text-xs text-gray-400 font-mono">{c.card_number.match(/.{1,4}/g)?.join(' ')}</div>
              </div>
              <div className="flex gap-1">
                <Btn variant="ghost" onClick={() => toggle(c)}>{c.is_active ? 'Desativar' : 'Ativar'}</Btn>
                <Btn variant="danger" onClick={() => del(c)}><Trash2 size={12} /></Btn>
              </div>
            </div>
          ))}
        </div>
      }
    </Modal>
  );
}
