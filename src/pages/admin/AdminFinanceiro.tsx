import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader, Card, Btn, Input, Select, Label, Modal, EmptyState } from './ui';
import { PeriodPicker, useAsync, useDateRange } from './hooks';
import { toast } from 'sonner';

type Stream = {
  id: string;
  name: string;
  billing_type: string;
  default_amount: number | null;
  status: 'ativo' | 'em_definicao';
  sort_order: number;
};

type Payment = {
  id: string;
  revenue_stream_id: string;
  partner_id: string | null;
  amount: number;
  payment_date: string;
  next_due_date: string | null;
  status: 'pago' | 'pendente' | 'atrasado';
  notes: string | null;
};

const brl = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0);

export default function AdminFinanceiro() {
  const dr = useDateRange('30d');
  const [reloadTick, setReloadTick] = useState(0);
  const bump = () => setReloadTick(t => t + 1);

  const streams = useAsync(async () => {
    const { data } = await (supabase as any).from('revenue_streams').select('*').order('sort_order');
    return (data ?? []) as Stream[];
  }, [reloadTick]);

  const allPayments = useAsync(async () => {
    const { data } = await (supabase as any)
      .from('payments')
      .select('*')
      .order('payment_date', { ascending: false });
    return (data ?? []) as Payment[];
  }, [reloadTick]);

  const payments = useMemo(() => {
    const from = dr.range.from.slice(0, 10);
    const to = dr.range.to.slice(0, 10);
    return (allPayments.data ?? []).filter(p => p.payment_date >= from && p.payment_date <= to);
  }, [allPayments.data, dr.range.from, dr.range.to]);

  const partners = useAsync(async () => {
    const { data } = await supabase.from('partners').select('id, name').order('name');
    return (data ?? []) as { id: string; name: string }[];
  }, []);

  // aggregates per stream (lifetime — independentes do filtro de período)
  const agg = useMemo(() => {
    const m = new Map<string, { total: number; payers: Set<string>; overdue: number }>();
    (allPayments.data ?? []).forEach(p => {
      const cur = m.get(p.revenue_stream_id) ?? { total: 0, payers: new Set<string>(), overdue: 0 };
      if (p.status === 'pago') {
        cur.total += Number(p.amount);
        if (p.partner_id) cur.payers.add(p.partner_id);
      }
      if (p.status === 'atrasado') cur.overdue += 1;
      m.set(p.revenue_stream_id, cur);
    });
    return m;
  }, [allPayments.data]);



  const grandTotal = useMemo(() =>
    (streams.data ?? []).filter(s => s.status === 'ativo')
      .reduce((s, st) => s + (agg.get(st.id)?.total ?? 0), 0)
  , [streams.data, agg]);

  const [openStream, setOpenStream] = useState<Stream | null>(null);
  const [editStream, setEditStream] = useState<Stream | null>(null);

  return (
    <>
      <PageHeader title="Financeiro" subtitle="Fluxos de receita e pagamentos" />

      <PeriodPicker {...dr} />

      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-gray-400">Total geral (fluxos ativos)</div>
            <div className="text-2xl font-semibold text-green-400 mt-1">{brl(grandTotal)}</div>
          </div>
          <div className="text-xs text-gray-400">
            {payments.filter(p => p.status === 'pago').length} pagamentos no período
          </div>
        </div>
      </Card>

      {streams.loading ? <EmptyState>Carregando…</EmptyState> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(streams.data ?? []).map(st => {
            const a = agg.get(st.id) ?? { total: 0, payers: new Set(), overdue: 0 };
            const isActive = st.status === 'ativo';
            return (
              <Card key={st.id} className={`p-4 ${isActive ? '' : 'opacity-60'}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="text-white font-semibold">{st.name}</div>
                    <div className="text-[11px] uppercase tracking-widest text-gray-400 mt-0.5">
                      {st.billing_type} · {st.default_amount != null ? brl(Number(st.default_amount)) : '—'}
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 border ${isActive ? 'border-green-500/60 text-green-400' : 'border-white/20 text-gray-400'}`}>
                    {isActive ? 'Ativo' : 'Em definição'}
                  </span>
                </div>

                {isActive ? (
                  <>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <Metric label="Arrecadado" value={brl(a.total)} accent />
                      <Metric label="Pagantes" value={String(a.payers.size)} />
                      <Metric label="Atrasados" value={String(a.overdue)} danger={a.overdue > 0} />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Btn variant="primary" onClick={() => setOpenStream(st)}>Lançar pagamento</Btn>
                      <Btn variant="ghost" onClick={() => setEditStream(st)}>Editar fluxo</Btn>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-xs text-gray-400 mt-3">Aguardando definição de valor e ativação</div>
                    <div className="mt-3"><Btn variant="ghost" onClick={() => setEditStream(st)}>Definir valor e ativar</Btn></div>
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <PaymentsTable payments={payments} streams={streams.data ?? []} partners={partners.data ?? []} onChanged={bump} />

      {openStream && (
        <PaymentModal
          stream={openStream}
          partners={partners.data ?? []}
          onClose={() => setOpenStream(null)}
          onSaved={() => { setOpenStream(null); bump(); }}
        />
      )}
      {editStream && (
        <StreamEditModal
          stream={editStream}
          onClose={() => setEditStream(null)}
          onSaved={() => { setEditStream(null); bump(); }}
        />
      )}
    </>
  );
}

function Metric({ label, value, accent, danger }: { label: string; value: string; accent?: boolean; danger?: boolean }) {
  return (
    <div className="bg-[#0a0f1e] border border-white/10 p-2">
      <div className="text-[10px] uppercase tracking-widest text-gray-400">{label}</div>
      <div className={`text-sm font-semibold mt-0.5 ${danger ? 'text-red-400' : accent ? 'text-green-400' : 'text-white'}`}>{value}</div>
    </div>
  );
}

function PaymentsTable({ payments, streams, partners, onChanged }: {
  payments: Payment[]; streams: Stream[]; partners: { id: string; name: string }[]; onChanged: () => void;
}) {
  if (!payments.length) return <div className="mt-6 text-xs text-gray-500">Nenhum pagamento no período.</div>;
  const sName = (id: string) => streams.find(s => s.id === id)?.name ?? '—';
  const pName = (id: string | null) => partners.find(p => p.id === id)?.name ?? '—';
  const del = async (id: string) => {
    if (!confirm('Excluir pagamento?')) return;
    const { error } = await (supabase as any).from('payments').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Pagamento excluído'); onChanged(); }
  };
  return (
    <Card className="mt-6 p-4">
      <div className="text-sm text-gray-300 mb-3">Pagamentos no período</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-400 text-[11px] uppercase tracking-widest">
            <tr><th className="text-left py-2">Data</th><th className="text-left">Fluxo</th><th className="text-left">Pagante</th><th className="text-right">Valor</th><th className="text-left">Próx. venc.</th><th className="text-left">Status</th><th /></tr>
          </thead>
          <tbody className="text-white">
            {payments.map(p => (
              <tr key={p.id} className="border-t border-white/5">
                <td className="py-2">{p.payment_date}</td>
                <td>{sName(p.revenue_stream_id)}</td>
                <td>{pName(p.partner_id)}</td>
                <td className="text-right">{brl(Number(p.amount))}</td>
                <td>{p.next_due_date ?? '—'}</td>
                <td className="capitalize">{p.status}</td>
                <td className="text-right"><button onClick={() => del(p.id)} className="text-xs text-red-400 hover:text-red-300">Excluir</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function PaymentModal({ stream, partners, onClose, onSaved }: {
  stream: Stream; partners: { id: string; name: string }[]; onClose: () => void; onSaved: () => void;
}) {
  const [partnerId, setPartnerId] = useState('');
  const [amount, setAmount] = useState(stream.default_amount ? String(stream.default_amount) : '');
  const today = new Date().toISOString().slice(0, 10);
  const [paymentDate, setPaymentDate] = useState(today);
  const [nextDue, setNextDue] = useState(() => {
    const d = new Date(); if (stream.billing_type === 'mensal') d.setMonth(d.getMonth() + 1); else d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [status, setStatus] = useState<'pago' | 'pendente' | 'atrasado'>('pago');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!partnerId) return toast.error('Selecione a empresa');
    const a = Number(amount);
    if (!(a > 0)) return toast.error('Valor inválido');
    setSaving(true);
    const { error } = await (supabase as any).from('payments').insert({
      revenue_stream_id: stream.id,
      partner_id: partnerId,
      amount: a,
      payment_date: paymentDate,
      next_due_date: nextDue || null,
      status,
      notes: notes || null,
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success('Pagamento registrado'); onSaved(); }
  };

  return (
    <Modal open onClose={onClose} title={`Lançar pagamento — ${stream.name}`}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn variant="primary" onClick={save} disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</Btn></>}>
      <div className="space-y-3">
        <div>
          <Label>Empresa</Label>
          <Select value={partnerId} onChange={e => setPartnerId(e.target.value)}>
            <option value="">Selecione…</option>
            {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Valor (R$)</Label><Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} /></div>
          <div><Label>Status</Label>
            <Select value={status} onChange={e => setStatus(e.target.value as any)}>
              <option value="pago">Pago</option><option value="pendente">Pendente</option><option value="atrasado">Atrasado</option>
            </Select>
          </div>
          <div><Label>Data do pagamento</Label><Input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} /></div>
          <div><Label>Próximo vencimento</Label><Input type="date" value={nextDue} onChange={e => setNextDue(e.target.value)} /></div>
        </div>
        <div><Label>Observações</Label><Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Opcional" /></div>
      </div>
    </Modal>
  );
}

function StreamEditModal({ stream, onClose, onSaved }: { stream: Stream; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(stream.name);
  const [billing, setBilling] = useState(stream.billing_type);
  const [amount, setAmount] = useState(stream.default_amount != null ? String(stream.default_amount) : '');
  const [status, setStatus] = useState(stream.status);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const payload: any = {
      name, billing_type: billing,
      default_amount: amount === '' ? null : Number(amount),
      status,
    };
    const { error } = await (supabase as any).from('revenue_streams').update(payload).eq('id', stream.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success('Fluxo atualizado'); onSaved(); }
  };

  return (
    <Modal open onClose={onClose} title={`Editar fluxo — ${stream.name}`}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn variant="primary" onClick={save} disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</Btn></>}>
      <div className="space-y-3">
        <div><Label>Nome</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Tipo de cobrança</Label>
            <Select value={billing} onChange={e => setBilling(e.target.value)}>
              <option value="anual">Anual</option><option value="mensal">Mensal</option><option value="unico">Único</option>
            </Select>
          </div>
          <div><Label>Valor padrão (R$)</Label><Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Deixe vazio se ainda não definido" /></div>
          <div><Label>Status</Label>
            <Select value={status} onChange={e => setStatus(e.target.value as any)}>
              <option value="em_definicao">Em definição</option><option value="ativo">Ativo</option>
            </Select>
          </div>
        </div>
      </div>
    </Modal>
  );
}
