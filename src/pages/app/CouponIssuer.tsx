import { useMemo, useState } from 'react';
import { Search, Loader2, CheckCircle2, Ticket } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatBRL } from '@/lib/utils';

type Client = {
  user_id: string;
  name: string | null;
  email: string | null;
  card_number: string | null;
  cpf: string | null;
  is_active: boolean | null;
};

interface Props {
  partnerId: string;
  discountPercent: number;
  cashbackEnabled: boolean;
  cashbackPercent: number;
  cashbackFeatureUnlocked?: boolean;
}

const onlyDigits = (v: string) => v.replace(/\D/g, '');

function generateCode() {
  return 'RQ-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function CouponIssuer({ partnerId, discountPercent, cashbackEnabled, cashbackPercent, cashbackFeatureUnlocked = false }: Props) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [client, setClient] = useState<Client | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [purchase, setPurchase] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [issued, setIssued] = useState<{ code: string; discount: number; cashback: number } | null>(null);

  const purchaseValue = Number(purchase.replace(',', '.')) || 0;
  const discountAmount = useMemo(() => +(purchaseValue * (discountPercent / 100)).toFixed(2), [purchaseValue, discountPercent]);
  const cashbackActive = cashbackFeatureUnlocked && cashbackEnabled;
  const cashbackAmount = useMemo(
    () => (cashbackActive ? +(purchaseValue * (cashbackPercent / 100)).toFixed(2) : 0),
    [purchaseValue, cashbackActive, cashbackPercent],
  );
  const finalPrice = +(purchaseValue - discountAmount).toFixed(2);

  const findClient = async () => {
    setNotFound(false); setClient(null); setIssued(null); setMsg(null);
    const raw = query.trim();
    if (!raw) return;
    setSearching(true);
    try {
      const { data, error } = await supabase.rpc('lookup_client_for_partner', { _query: raw });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) { setNotFound(true); return; }
      setClient(row as Client);
    } catch (err: any) {
      setMsg(err.message || 'Erro na busca');
    } finally {
      setSearching(false);
    }
  };

  const emit = async () => {
    if (!client || purchaseValue <= 0) return;
    if (client.is_active === false) { setMsg('Membro Inativo — pagamento pendente.'); return; }
    setSubmitting(true); setMsg(null);
    try {
      const code = generateCode();
      const { data, error } = await supabase.rpc('issue_coupon', {
        _partner_id: partnerId,
        _client_user_id: client.user_id,
        _purchase_amount: purchaseValue,
        _discount_amount: discountAmount,
        _cashback_amount: cashbackAmount,
        _code: code,
      });
      if (error) throw error;
      setIssued({ code, discount: discountAmount, cashback: cashbackAmount });
      setPurchase('');
    } catch (err: any) {
      setMsg(err.message || 'Erro ao emitir cupom');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-4 space-y-4">
      <div className="flex items-center gap-2 text-white">
        <Ticket size={18} />
        <h3 className="font-semibold">Emitir cupom</h3>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Buscar cliente (CPF, cartão ou e-mail)</label>
        <div className="flex gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite para localizar"
            className="flex-1 bg-black border border-gray-700 text-white px-3 py-2 text-sm outline-none focus:border-white" />
          <button onClick={findClient} disabled={searching || !query.trim()}
            className="bg-white text-black px-3 py-2 text-sm font-semibold flex items-center gap-1 disabled:opacity-60">
            {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Buscar
          </button>
        </div>
        {notFound && <p className="text-xs text-yellow-400 mt-2">Nenhum cliente encontrado.</p>}
      </div>

      {client && (
        <div className="border border-gray-700 p-3 bg-black/40">
          <p className="text-white text-sm font-semibold">{client.name || client.email}</p>
          <p className="text-xs text-gray-400">Cartão: {client.card_number}</p>
          <p className={`text-xs mt-1 ${client.is_active === false ? 'text-red-400' : 'text-green-400'}`}>
            {client.is_active === false ? '● Membro Inativo' : '● Membro Ativo'}
          </p>
        </div>
      )}

      {client && client.is_active !== false && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Valor da compra (R$)</label>
            <input value={purchase} onChange={(e) => setPurchase(e.target.value)}
              inputMode="decimal" placeholder="0,00"
              className="w-full bg-black border border-gray-700 text-white px-3 py-2 text-sm outline-none focus:border-white" />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="border border-gray-700 p-2">
              <p className="text-[10px] text-gray-500 uppercase">Desconto {discountPercent}%</p>
              <p className="text-white text-sm font-semibold mt-1">{formatBRL(discountAmount)}</p>
            </div>
            <div className="border border-gray-700 p-2">
              <p className="text-[10px] text-gray-500 uppercase">Cashback {cashbackEnabled ? `${cashbackPercent}%` : 'off'}</p>
              <p className="text-white text-sm font-semibold mt-1">{formatBRL(cashbackAmount)}</p>
            </div>
            <div className="border border-yellow-500/40 bg-yellow-500/5 p-2">
              <p className="text-[10px] text-yellow-400 uppercase">A pagar</p>
              <p className="text-white text-sm font-semibold mt-1">{formatBRL(finalPrice)}</p>
            </div>
          </div>

          <button onClick={emit} disabled={submitting || purchaseValue <= 0}
            className="w-full bg-white text-black font-semibold py-3 hover:bg-gray-100 flex items-center justify-center gap-2 disabled:opacity-60">
            {submitting && <Loader2 size={16} className="animate-spin" />} Emitir cupom
          </button>
        </>
      )}

      {msg && <p className="text-sm text-red-400 text-center">{msg}</p>}

      {issued && (
        <div className="border border-green-500/40 bg-green-500/10 p-3 flex items-start gap-3">
          <CheckCircle2 size={20} className="text-green-400 mt-0.5" />
          <div className="text-sm">
            <p className="text-green-300 font-semibold">Cupom emitido</p>
            <p className="text-gray-300">Código: <span className="font-mono text-white">{issued.code}</span></p>
            <p className="text-gray-400 text-xs mt-1">Desconto {formatBRL(issued.discount)} · Cashback {formatBRL(issued.cashback)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
