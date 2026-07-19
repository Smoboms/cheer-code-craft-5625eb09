import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePlatformStatus } from '@/hooks/usePlatformStatus';
import { toast } from 'sonner';
import { Globe, Lock } from 'lucide-react';

/**
 * Card do ADM para ligar/desligar a Área Pública da plataforma.
 * Persistido em `system_settings.public_platform_enabled` (jsonb boolean).
 * Cache do hook usePlatformStatus é invalidado após a alteração.
 */
export function PublicPlatformSwitchCard() {
  const { enabled, isLoading } = usePlatformStatus();
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  const toggle = async () => {
    const next = !enabled;
    setSaving(true);
    const { error } = await supabase
      .from('system_settings')
      .upsert({ key: 'public_platform_enabled', value: next as any, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) {
      toast.error('Não foi possível alterar. Verifique se você é administrador.');
      return;
    }
    await qc.invalidateQueries({ queryKey: ['system_settings', 'public_platform_enabled'] });
    toast.success(next ? 'Área Pública ativada' : 'Área Pública desativada');
  };

  return (
    <div className="bg-[#070c19] border border-white/10 rounded p-4 mb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {enabled ? <Globe size={16} className="text-green-500" /> : <Lock size={16} className="text-yellow-500" />}
            <div className="text-sm text-white font-medium">Área Pública da Plataforma</div>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Controla se a vitrine pública está acessível. Quando desativada, exibe a tela
            "Em Breve" para todos — visitantes, associados e empresas.
            Apenas os administradores (rarquesmatriz / imobiliario454) continuam navegando.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <button
            type="button"
            onClick={toggle}
            disabled={isLoading || saving}
            aria-pressed={enabled}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${enabled ? 'bg-green-500' : 'bg-gray-600'} disabled:opacity-50`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
          <span className={`text-[10px] uppercase tracking-widest ${enabled ? 'text-green-400' : 'text-yellow-400'}`}>
            {enabled ? '● Ativada' : '○ Desativada'}
          </span>
        </div>
      </div>
    </div>
  );
}
