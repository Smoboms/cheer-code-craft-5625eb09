import { ArrowLeft, Trophy, Award, ShoppingCart, Crown, Lock, Unlock } from 'lucide-react';

interface AchievementsPageProps {
  onBack: () => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'bronze' | 'silver' | 'gold' | 'crown';
  unlocked: boolean;
  progress?: {
    current: number;
    total: number;
    unit: string;
  };
}

export function AchievementsPage({ onBack }: AchievementsPageProps) {
  // Mock achievements data
  const achievements: Achievement[] = [
    {
      id: 'first-savings',
      title: 'Primeira Economia',
      description: 'Você registrou sua primeira economia dentro da Rarques Association.',
      icon: 'bronze',
      unlocked: true,
    },
    {
      id: 'r100-saved',
      title: 'R$ 100 Economizados',
      description: 'Você já acumulou R$ 100 em benefícios.',
      icon: 'silver',
      unlocked: false,
      progress: {
        current: 68,
        total: 100,
        unit: 'R$',
      },
    },
    {
      id: '10-purchases',
      title: '10 Compras Registradas',
      description: 'Você usou a rede 10 vezes.',
      icon: 'gold',
      unlocked: false,
      progress: {
        current: 6,
        total: 10,
        unit: 'compras',
      },
    },
    {
      id: 'loyal-customer',
      title: 'Cliente Fiel',
      description: 'Você utiliza a Rarques Association com constância.',
      icon: 'crown',
      unlocked: false,
      progress: {
        current: 2,
        total: 5,
        unit: 'compras em 30 dias',
      },
    },
  ];

  const getIcon = (type: Achievement['icon'], unlocked: boolean) => {
    const iconClass = unlocked ? 'text-yellow-500' : 'text-gray-300';
    const size = 28;

    switch (type) {
      case 'bronze':
        return <Award className={iconClass} size={size} />;
      case 'silver':
        return <Award className={iconClass} size={size} />;
      case 'gold':
        return <ShoppingCart className={iconClass} size={size} />;
      case 'crown':
        return <Crown className={iconClass} size={size} />;
      default:
        return <Trophy className={iconClass} size={size} />;
    }
  };

  const getMedalEmoji = (type: Achievement['icon']) => {
    switch (type) {
      case 'bronze':
        return '🥉';
      case 'silver':
        return '🥈';
      case 'gold':
        return '🥇';
      case 'crown':
        return '👑';
      default:
        return '🏆';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-black text-white sticky top-0 z-10">
          <div className="flex items-center p-4">
            <button
              onClick={onBack}
              className="mr-3 p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold">Suas Conquistas</h1>
            </div>
            <Trophy className="text-yellow-500" size={24} />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Hero Text */}
          <div className="text-center py-4">
            <p className="text-gray-600 text-sm leading-relaxed">
              Cada acesso gera valor.
              <br />
              Cada uso constrói vantagem.
            </p>
          </div>

          {/* Achievements List */}
          <div className="space-y-4">
            {achievements.map((achievement) => {
              const progressPercentage = achievement.progress
                ? (achievement.progress.current / achievement.progress.total) * 100
                : 0;

              return (
                <div
                  key={achievement.id}
                  className={`bg-white rounded-xl p-5 border-2 transition-all ${
                    achievement.unlocked
                      ? 'border-green-500 shadow-md'
                      : 'border-gray-200 shadow-sm'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          achievement.unlocked
                            ? 'bg-gradient-to-br from-yellow-400 to-yellow-500'
                            : 'bg-gray-100'
                        }`}
                      >
                        <span className="text-2xl">{getMedalEmoji(achievement.icon)}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-base">
                          {achievement.title}
                        </h3>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {achievement.unlocked ? (
                        <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-lg">
                          <Unlock size={14} />
                          <span className="text-xs font-medium">Desbloqueado</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">
                          <Lock size={14} />
                          <span className="text-xs font-medium">Bloqueado</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                    {achievement.description}
                  </p>

                  {/* Progress */}
                  {achievement.progress && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">Progresso</span>
                        <span className="font-semibold text-gray-900">
                          {achievement.progress.unit === 'R$' && 'R$ '}
                          {achievement.progress.current} / {achievement.progress.unit === 'R$' && 'R$ '}
                          {achievement.progress.total}
                          {achievement.progress.unit !== 'R$' && ` ${achievement.progress.unit}`}
                        </span>
                      </div>
                      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <div className="flex justify-end">
                        <span className="text-xs font-medium text-green-600">
                          {progressPercentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Rule Info */}
                  {!achievement.unlocked && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        {achievement.id === 'first-savings' && '➡️ Desbloqueia ao registrar a 1ª compra'}
                        {achievement.id === 'r100-saved' && '➡️ Soma automática do "valor economizado"'}
                        {achievement.id === '10-purchases' && '➡️ Desbloqueia após 10 compras registradas'}
                        {achievement.id === 'loyal-customer' &&
                          '➡️ Desbloqueia com 5 compras em 30 dias ou 3 parceiros diferentes utilizados'}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary Footer */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-5 text-white mt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm mb-1">Conquistas desbloqueadas</p>
                <p className="text-2xl font-bold">
                  {achievements.filter((a) => a.unlocked).length} / {achievements.length}
                </p>
              </div>
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                <Trophy className="text-yellow-500" size={32} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}