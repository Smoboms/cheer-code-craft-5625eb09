// Global replacement of window.alert with sonner toast to preserve
// existing admin/UX behavior without touching component logic.
import { toast } from 'sonner';

if (typeof window !== 'undefined' && !(window as any).__alertPatched) {
  (window as any).__alertPatched = true;
  window.alert = (message?: unknown) => {
    const text = message == null ? '' : String(message);
    const isError = /erro|error|falha|inválid|obrigat/i.test(text);
    if (isError) toast.error(text || 'Erro');
    else toast(text);
  };
}
