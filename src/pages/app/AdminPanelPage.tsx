import { ArrowLeft, Construction } from 'lucide-react';

interface AdminPanelPageProps {
  onBack: () => void;
  accessToken: string;
}

export function AdminPanelPage({ onBack }: AdminPanelPageProps) {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-md mx-auto min-h-screen bg-black">
        <div className="bg-black p-4 border-b border-gray-800 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-10 h-10 bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Painel Administrativo</h1>
              <p className="text-sm text-gray-400">RARQUES ASSOCIATION</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center p-8 pt-24 text-center">
          <Construction className="text-gray-500 mb-4" size={64} />
          <h2 className="text-xl font-bold text-white mb-2">Em Desenvolvimento</h2>
          <p className="text-gray-400 text-sm">
            O painel administrativo estará disponível em breve com integração ao banco de dados.
          </p>
        </div>
      </div>
    </div>
  );
}
