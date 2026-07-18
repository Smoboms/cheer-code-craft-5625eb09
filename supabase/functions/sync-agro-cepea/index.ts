// Sincroniza cotações do Indicador CEPEA/ESALQ (Boi Gordo e Soja)
// - Faz scraping das páginas públicas do CEPEA
// - Atualiza a última linha em public.agro_quotes preservando os campos manuais existentes
// - Em caso de falha externa, NÃO sobrescreve valores antigos (fallback natural)
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const BOI_URL = 'https://www.cepea.esalq.usp.br/br/indicador/boi-gordo.aspx';
const SOJA_URL = 'https://www.cepea.esalq.usp.br/br/indicador/soja.aspx';
const CEPEA_SOURCE = 'CEPEA/ESALQ';

type Row = { date: string; value: number };

// Extrai primeira linha do tbody de uma tabela com id específico.
// Retorna { date: "YYYY-MM-DD", value: number } ou null.
function parseFirstRow(html: string, tableId: string): Row | null {
  const tblRe = new RegExp(
    `<table[^>]*id=["']${tableId}["'][\\s\\S]*?<tbody[^>]*>([\\s\\S]*?)</tbody>`,
    'i',
  );
  const tblMatch = html.match(tblRe);
  if (!tblMatch) return null;
  const tbody = tblMatch[1];
  const trMatch = tbody.match(/<tr[^>]*>([\s\S]*?)<\/tr>/i);
  if (!trMatch) return null;
  const tds = [...trMatch[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) =>
    m[1].replace(/<[^>]+>/g, '').trim(),
  );
  if (tds.length < 2) return null;
  const [d, m, y] = tds[0].split('/');
  if (!d || !m || !y) return null;
  const iso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  const num = Number(tds[1].replace(/\./g, '').replace(',', '.'));
  if (!isFinite(num)) return null;
  return { date: iso, value: num };
}

async function fetchHtml(url: string): Promise<string> {
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
    Referer: 'https://www.cepea.esalq.usp.br/br/',
  };

  // 1) Direto no CEPEA
  const direct = await fetch(url, { headers, redirect: 'follow' }).catch(() => null);
  if (direct && direct.ok) {
    const t = await direct.text();
    if (t && t.length > 2000) return t;
  }

  // 2) Fallbacks públicos (r.jina.ai preserva o HTML; allorigins repassa cru)
  const candidates = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://r.jina.ai/${url}`,
  ];
  for (const c of candidates) {
    try {
      const r = await fetch(c, { headers: { 'User-Agent': headers['User-Agent'] } });
      if (r.ok) {
        const t = await r.text();
        if (t && t.length > 2000) return t;
      }
    } catch (_) { /* tenta próximo */ }
  }

  throw new Error(`Falha ao buscar ${url}: fonte inacessível (WAF/bloqueio)`);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const result: Record<string, unknown> = { boi: null, soja: null, errors: [] as string[] };
  const errors = result.errors as string[];

  // Boi Gordo (à vista + a prazo)
  let boiAvista: Row | null = null;
  let boiAprazo: Row | null = null;
  try {
    const html = await fetchHtml(BOI_URL);
    boiAvista = parseFirstRow(html, 'imagenet-indicador1');
    boiAprazo = parseFirstRow(html, 'imagenet-indicador2');
    if (!boiAvista) throw new Error('não localizou tabela boi à vista');
    result.boi = { avista: boiAvista, aprazo: boiAprazo };
  } catch (e) {
    errors.push(`boi: ${(e as Error).message}`);
  }

  // Soja
  let soja: Row | null = null;
  try {
    const html = await fetchHtml(SOJA_URL);
    soja = parseFirstRow(html, 'imagenet-indicador1');
    if (!soja) throw new Error('não localizou tabela soja');
    result.soja = soja;
  } catch (e) {
    errors.push(`soja: ${(e as Error).message}`);
  }

  // Nada extraído com sucesso → não escreve (fallback: mantém último valor)
  if (!boiAvista && !soja) {
    return new Response(JSON.stringify({ ok: false, ...result }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Localiza última linha existente para atualizar (preserva campos manuais não-CEPEA)
  const { data: latest } = await supabase
    .from('agro_quotes')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const patch: Record<string, unknown> = {};
  if (boiAvista) {
    patch.boi_gordo_avista = boiAvista.value;
    patch.boi_source = CEPEA_SOURCE;
    patch.boi_updated_at = boiAvista.date;
  }
  if (boiAprazo) patch.boi_gordo_aprazo = boiAprazo.value;
  if (soja) {
    patch.soja_min = soja.value;
    patch.soja_max = soja.value;
    patch.soja_source = CEPEA_SOURCE;
    patch.soja_updated_at = soja.date;
  }

  let writeError: string | null = null;
  if (latest?.id) {
    const { error } = await supabase.from('agro_quotes').update(patch).eq('id', latest.id);
    if (error) writeError = error.message;
  } else {
    const { error } = await supabase.from('agro_quotes').insert(patch);
    if (error) writeError = error.message;
  }
  if (writeError) errors.push(`db: ${writeError}`);

  return new Response(
    JSON.stringify({ ok: errors.length === 0, ...result }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});
