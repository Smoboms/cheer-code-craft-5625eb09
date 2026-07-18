import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Btn, Card, Input, Label, PageHeader } from './ui';
import { toast } from 'sonner';

type AgroQuote = {
  id?: string;
  boi_gordo_avista: number | null;
  boi_gordo_aprazo: number | null;
  vaca_gorda_avista: number | null;
  boi_source: string | null;
  boi_updated_at: string | null;
  soja_min: number | null;
  soja_max: number | null;
  soja_source: string | null;
  soja_updated_at: string | null;
};

const empty: AgroQuote = {
  boi_gordo_avista: null,
  boi_gordo_aprazo: null,
  vaca_gorda_avista: null,
  boi_source: '',
  boi_updated_at: null,
  soja_min: null,
  soja_max: null,
  soja_source: '',
  soja_updated_at: null,
};

function numOrNull(v: string): number | null {
  if (v === '' || v == null) return null;
  const n = Number(String(v).replace(',', '.'));
  return isFinite(n) ? n : null;
}

export default function AdminAgro() {
  const [f, setF] = useState<AgroQuote>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from('agro_quotes')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) setF(data as any);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    const payload = { ...f };
    const { error } = f.id
      ? await (supabase as any).from('agro_quotes').update(payload).eq('id', f.id)
      : await (supabase as any).from('agro_quotes').insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success('Cotações atualizadas');
    load();
  };

  const [syncing, setSyncing] = useState(false);
  const syncCepea = async () => {
    setSyncing(true);
    const { data, error } = await supabase.functions.invoke('sync-agro-cepea', { body: {} });
    setSyncing(false);
    if (error) return toast.error('Falha ao sincronizar: ' + error.message);
    const anyRes = data as any;
    if (anyRes?.ok === false && Array.isArray(anyRes?.errors) && anyRes.errors.length) {
      toast.error('Sincronização parcial: ' + anyRes.errors.join(' · '));
    } else {
      toast.success('Cotações CEPEA/ESALQ sincronizadas');
    }
    load();
  };

  return (
    <>
      <PageHeader
        title="Cotações Agro"
        subtitle="Valores-base do Indicador CEPEA/ESALQ sincronizados automaticamente. Você pode complementar manualmente (ex.: Vaca Gorda regional, ágio local)."
        actions={
          <div className="flex gap-2">
            <Btn onClick={syncCepea} disabled={syncing || loading}>{syncing ? 'Sincronizando…' : 'Sincronizar CEPEA/ESALQ'}</Btn>
            <Btn onClick={save} disabled={saving || loading}>{saving ? 'Salvando…' : 'Salvar alterações'}</Btn>
          </div>
        }
      />

      {loading ? (
        <Card className="p-6 text-gray-400 text-sm">Carregando…</Card>
      ) : (
        <div className="space-y-5">
          {/* Boi Gordo */}
          <Card className="p-5">
            <h2 className="text-white font-semibold text-sm tracking-wide mb-4">BOI GORDO · Valores em R$ / arroba (@)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Boi Gordo — À vista</Label>
                <Input
                  type="number" step="0.01"
                  value={f.boi_gordo_avista ?? ''}
                  onChange={e => setF({ ...f, boi_gordo_avista: numOrNull(e.target.value) })}
                />
              </div>
              <div>
                <Label>Boi Gordo — A prazo (30d)</Label>
                <Input
                  type="number" step="0.01"
                  value={f.boi_gordo_aprazo ?? ''}
                  onChange={e => setF({ ...f, boi_gordo_aprazo: numOrNull(e.target.value) })}
                />
              </div>
              <div>
                <Label>Vaca Gorda — À vista</Label>
                <Input
                  type="number" step="0.01"
                  value={f.vaca_gorda_avista ?? ''}
                  onChange={e => setF({ ...f, vaca_gorda_avista: numOrNull(e.target.value) })}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Fonte (texto exibido no bloco)</Label>
                <Input
                  value={f.boi_source ?? ''}
                  onChange={e => setF({ ...f, boi_source: e.target.value })}
                  placeholder="Ex.: Notícias Agrícolas"
                />
              </div>
              <div>
                <Label>Data da última atualização</Label>
                <Input
                  type="date"
                  value={f.boi_updated_at ?? ''}
                  onChange={e => setF({ ...f, boi_updated_at: e.target.value || null })}
                />
              </div>
            </div>
          </Card>

          {/* Soja */}
          <Card className="p-5">
            <h2 className="text-white font-semibold text-sm tracking-wide mb-4">SOJA · Faixa de preço — R$ / saca 60kg</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Soja — Mínimo</Label>
                <Input
                  type="number" step="0.01"
                  value={f.soja_min ?? ''}
                  onChange={e => setF({ ...f, soja_min: numOrNull(e.target.value) })}
                />
              </div>
              <div>
                <Label>Soja — Máximo</Label>
                <Input
                  type="number" step="0.01"
                  value={f.soja_max ?? ''}
                  onChange={e => setF({ ...f, soja_max: numOrNull(e.target.value) })}
                />
              </div>
              <div>
                <Label>Data da última atualização</Label>
                <Input
                  type="date"
                  value={f.soja_updated_at ?? ''}
                  onChange={e => setF({ ...f, soja_updated_at: e.target.value || null })}
                />
              </div>
              <div className="md:col-span-3">
                <Label>Fonte (texto exibido no bloco)</Label>
                <Input
                  value={f.soja_source ?? ''}
                  onChange={e => setF({ ...f, soja_source: e.target.value })}
                  placeholder="Ex.: CEPEA/ESALQ"
                />
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
