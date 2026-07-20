import { useEffect, useState } from 'react';
import { ArrowLeft, Ticket, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Props { onBack: () => void; }

interface Stats {
  totalCoupons: number;
  totalRevenue: number;
  totalSavings: number;
  monthCoupons: number;
  monthRevenue: number;
}

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function MinhaEmpresaDashboard({ onBack }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [partnerName, setPartnerName] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const { data: partner } = await supabase
          .from('partners')
          .select('id, name')
          .eq('created_by', user.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!partner) {
          setStats({ totalCoupons: 0, totalRevenue: 0, totalSavings: 0, monthCoupons: 0, monthRevenue: 0 });
          setLoading(false);
          return;
        }
        setPartnerName(partner.name || '');

        const { data: coupons } = await supabase
          .from('coupons')
          .select('purchase_amount, savings, created_at')
          .eq('partner_id', partner.id);

        const list = coupons || [];
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        let totalRevenue = 0, totalSavings = 0, monthCoupons = 0, monthRevenue = 0;
        for (const c of list) {
          const amt = Number(c.purchase_amount) || 0;
          const sav = Number(c.savings) || 0;
          totalRevenue += amt;
          totalSavings += sav;
          if (new Date(c.created_at as any).getTime() >= monthStart) {
            monthCoupons += 1;
            monthRevenue += amt;
          }
        }
        setStats({
          totalCoupons: list.length,
          totalRevenue,
          totalSavings,
          monthCoupons,
          monthRevenue,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  return (
    <div className="animate-fadeUp pb-4">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-300 mb-4 hover:text-white">
        <ArrowLeft size={18} /> Voltar
      </button>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-1">Dashboard</h2>
        <p className="text-gray-400 text-sm">
          {partnerName ? `Resultados de ${partnerName}` : 'Resultados da sua empresa'}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-10 justify-center">
          <Loader2 size={16} className="animate-spin" /> Carregando…
        </div>
      ) : !stats ? (
        <p className="text-gray-400 text-sm">Sem dados.</p>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <StatCard
              icon={Ticket}
              iconClass="text-yellow-400"
              label="Cupons gerados"
              value={String(stats.totalCoupons)}
              hint={`${stats.monthCoupons} este mês`}
            />
            <StatCard
              icon={DollarSign}
              iconClass="text-green-400"
              label="Faturamento total"
              value={brl(stats.totalRevenue)}
              hint={`${brl(stats.monthRevenue)} este mês`}
            />
          </div>
          <StatCard
            icon={TrendingUp}
            iconClass="text-white"
            label="Descontos concedidos"
            value={brl(stats.totalSavings)}
            hint="Total em economia entregue aos membros"
            wide
          />

          <div className="bg-gray-900 border border-gray-800 p-4 text-xs text-gray-400 leading-relaxed">
            <p>
              <span className="text-white font-semibold">Como lemos estes números:</span> cada cupom emitido soma o valor
              da compra ao faturamento. Os descontos são o total repassado como economia aos membros da Rarques.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon, iconClass, label, value, hint, wide,
}: {
  icon: any; iconClass: string; label: string; value: string; hint?: string; wide?: boolean;
}) {
  return (
    <div className={`bg-gray-900 border border-gray-800 p-3 ${wide ? '' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className={iconClass} />
        <span className="text-[11px] uppercase tracking-wider text-gray-400">{label}</span>
      </div>
      <p className="text-white font-bold text-xl leading-tight">{value}</p>
      {hint && <p className="text-gray-500 text-[11px] mt-1">{hint}</p>}
    </div>
  );
}
