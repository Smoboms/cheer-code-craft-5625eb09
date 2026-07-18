import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Btn, Card, EmptyState, Input, Label, PageHeader } from './ui';

type Goal = { id: string; key: string; label: string; target: number; sort_order: number };

export default function AdminMetas() {
  const [rows, setRows] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('platform_goals').select('*').order('sort_order');
    setRows((data as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async (g: Goal) => {
    setSaving(g.id);
    await supabase.from('platform_goals').update({ target: Number(g.target) || 0, label: g.label }).eq('id', g.id);
    setSaving(null);
    load();
  };

  return (
    <>
      <PageHeader title="Metas da Plataforma" subtitle="Defina as metas usadas no bloco Crescimento do Dashboard" />
      {loading ? <EmptyState>Carregando…</EmptyState> : (
        <div className="space-y-3">
          {rows.map((g) => (
            <Card key={g.id} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3 items-end">
                <div>
                  <Label>Rótulo</Label>
                  <Input value={g.label} onChange={(e) => setRows(rows.map(r => r.id === g.id ? { ...r, label: e.target.value } : r))} />
                  <div className="text-[10px] text-gray-500 mt-1">Chave: {g.key}</div>
                </div>
                <div>
                  <Label>Meta</Label>
                  <Input type="number" min={0} value={g.target}
                    onChange={(e) => setRows(rows.map(r => r.id === g.id ? { ...r, target: Number(e.target.value) } : r))} />
                </div>
                <Btn onClick={() => save(g)} disabled={saving === g.id}>{saving === g.id ? 'Salvando…' : 'Salvar'}</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
