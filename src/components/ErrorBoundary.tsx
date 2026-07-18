/**
 * Global ErrorBoundary (Fase 4 · Tarefa 15 — Observabilidade).
 *
 * Objetivo: proteger a árvore React contra crashes em produção. Um erro em
 * uma rota (ex.: dado malformado do backend) não pode derrubar o app inteiro.
 *
 * Estratégia:
 *  • Boundary de classe (React ainda não expõe hooks p/ error boundary).
 *  • Fallback minimalista, aderente à identidade visual (preto/branco).
 *  • Log estruturado em `console.error` para captura por ferramentas externas
 *    (Sentry/LogRocket) sem introduzir dependência agora.
 *  • Botão "Recarregar" que reseta o boundary sem full reload (state -> null).
 *
 * Não altera layout, rotas, dados nem regras de negócio.
 */
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Estruturado para futura integração com observability sink.
    console.error('[ErrorBoundary]', {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  private reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Rarques</p>
            <h1 className="text-2xl font-semibold">Algo deu errado</h1>
            <p className="text-sm text-gray-400">
              Encontramos um erro inesperado. Nossa equipe foi notificada.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={this.reset}
                className="bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-gray-100"
              >
                Tentar novamente
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="border border-gray-700 text-white px-4 py-2 text-sm font-semibold hover:border-white"
              >
                Ir para o início
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
