/**
 * Fase 6 · T1 — Logger centralizado.
 *
 * Comportamento:
 *  - Em desenvolvimento: mantém o mesmo output que `console.*`.
 *  - Em produção: silencia `debug`/`info`/`warn` mas preserva `error`
 *    (crítico para triagem e futura integração com Sentry/LogRocket).
 *
 * Assinatura compatível com console — troca drop-in.
 */

type LogArgs = unknown[];

const isProd = import.meta.env.PROD;

function emitError(args: LogArgs) {
  // Sempre preservado — ponto único para plugar observabilidade externa.
  // eslint-disable-next-line no-console
  console.error(...args);
}

export const logger = {
  debug: (...args: LogArgs) => {
    if (isProd) return;
    // eslint-disable-next-line no-console
    console.log(...args);
  },
  info: (...args: LogArgs) => {
    if (isProd) return;
    // eslint-disable-next-line no-console
    console.log(...args);
  },
  log: (...args: LogArgs) => {
    if (isProd) return;
    // eslint-disable-next-line no-console
    console.log(...args);
  },
  warn: (...args: LogArgs) => {
    if (isProd) return;
    // eslint-disable-next-line no-console
    console.warn(...args);
  },
  error: (...args: LogArgs) => {
    emitError(args);
  },
};

export default logger;
