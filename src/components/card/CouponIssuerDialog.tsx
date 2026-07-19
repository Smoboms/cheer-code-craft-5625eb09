import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, Ticket, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatBRL } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: {
    id: string;
    name: string;
    discount_percent: number;
    cashback_enabled: boolean;
    cashback_percent: number;
    cashback_feature_unlocked: boolean;
  };
  client: { user_id: string; name: string; card_code: string };
}

function generateCode() {
  return 'RQ-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function CouponIssuerDialog({ open, onOpenChange, partner, client }: Props) {
  const [purchase, setPurchase] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [issued, setIssued] = useState<{ code: string; discount: number; cashback: number } | null>(null);

  const purchaseValue = Number(purchase.replace(',', '.')) || 0;
  const discountAmount = useMemo(
    () => +(purchaseValue * (partner.discount_percent / 100)).toFixed(2),
    [purchaseValue, partner.discount_percent],
  );
  const cashbackActive = partner.cashback_feature_unlocked && partner.cashback_enabled;
  const cashbackAmount = useMemo(
    () => (cashbackActive ? +(purchaseValue * (partner.cashback_percent / 100)).toFixed(2) : 0),
    [purchaseValue, cashbackActive, partner.cashback_percent],
  );
  const finalPrice = +(purchaseValue - discountAmount).toFixed(2);

  useEffect(() => {
    if (!open) {
      setPurchase('');
      setMsg(null);
      setIssued(null);
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const emit = async () => {
    if (purchaseValue <= 0) return;
    setSubmitting(true);
    setMsg(null);
    try {
      const code = generateCode();
      const { data, error } = await supabase.rpc('issue_coupon', {
        _partner_id: partner.id,
        _client_user_id: client.user_id,
        _purchase_amount: purchaseValue,
        _discount_amount: discountAmount,
        _cashback_amount: cashbackAmount,
        _code: code,
      });
      if (error) throw error;
      setIssued({ code, discount: discountAmount, cashback: cashbackAmount });
      void data;
    } catch (err: any) {
      setMsg(err.message || 'Erro ao emitir cupom');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-md bg-gray-900 border border-gray-800 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Ticket size={18} />
            <h3 className="font-semibold text-sm tracking-wide">Emitir cupom</h3>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-white"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="border border-gray-700 p-3 bg-black/40">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Cliente</p>
            <p className="text-sm font-semibold mt-1">{client.name}</p>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{client.card_code}</p>
          </div>

          {!issued && (
            <>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
                  Valor da compra (R$)
                </label>
                <input
                  autoFocus
                  value={purchase}
                  onChange={(e) => setPurchase(e.target.value)}
                  inputMode="decimal"
                  placeholder="0,00"
                  className="w-full bg-black border border-gray-700 text-white px-3 py-2 text-sm outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="border border-gray-700 p-2">
                  <p className="text-[10px] text-gray-500 uppercase">Desconto {partner.discount_percent}%</p>
                  <p className="text-white text-sm font-semibold mt-1">{formatBRL(discountAmount)}</p>
                </div>
                <div
                  className={`border p-2 ${
                    partner.cashback_feature_unlocked
                      ? 'border-gray-700'
                      : 'border-gray-800 opacity-50 pointer-events-none select-none'
                  }`}
                >
                  <p className="text-[10px] text-gray-500 uppercase leading-tight">
                    {partner.cashback_feature_unlocked
                      ? `Cashback ${partner.cashback_enabled ? `${partner.cashback_percent}%` : 'off'}`
                      : 'Cashback (EM BREVE)'}
                  </p>
                  <p className="text-white text-sm font-semibold mt-1">
                    {formatBRL(partner.cashback_feature_unlocked ? cashbackAmount : 0)}
                  </p>
                </div>
                <div className="border border-yellow-500/40 bg-yellow-500/5 p-2">
                  <p className="text-[10px] text-yellow-400 uppercase">A pagar</p>
                  <p className="text-white text-sm font-semibold mt-1">{formatBRL(finalPrice)}</p>
                </div>
              </div>

              <button
                onClick={emit}
                disabled={submitting || purchaseValue <= 0}
                className="w-full bg-white text-black font-semibold py-3 hover:bg-gray-100 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />} Emitir cupom
              </button>

              {msg && <p className="text-sm text-red-400 text-center">{msg}</p>}
            </>
          )}

          {issued && (
            <div className="space-y-3">
              <div className="border border-green-500/40 bg-green-500/10 p-3 flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-400 mt-0.5" />
                <div className="text-sm">
                  <p className="text-green-300 font-semibold">Cupom emitido</p>
                  <p className="text-gray-300">
                    Código: <span className="font-mono text-white">{issued.code}</span>
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Desconto {formatBRL(issued.discount)} · Cashback {formatBRL(issued.cashback)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="w-full bg-white text-black font-semibold py-3 hover:bg-gray-100"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
