import { useState } from 'react';
import { AlertCircle, CheckCircle2, TrendingUp, MessageCircle } from 'lucide-react';

interface Answer {
  question: number;
  answer: 'A' | 'B' | 'C' | 'D';
}

interface DiagnosisResult {
  score: number;
  classification: string;
  impactMessage: string;
  strengths: string[];
  weaknesses: string[];
  quickWin: string;
  mainProblem: string;
}

export function CrescerPage() {
  const [currentStep, setCurrentStep] = useState<'quiz' | 'result' | 'form'>('quiz');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [formData, setFormData] = useState({
    company: '',
    whatsapp: '',
    time: '',
  });

  const questions = [
    {
      id: 1,
      text: 'Onde seu negócio está sangrando dinheiro agora?',
      options: [
        { key: 'A', text: 'Não entram clientes suficientes pela porta', points: 0, problem: 'atração' },
        { key: 'B', text: 'Entram clientes mas vão embora sem comprar', points: 10, problem: 'conversão' },
        { key: 'C', text: 'Compram uma vez e nunca mais voltam', points: 15, problem: 'fidelização' },
        { key: 'D', text: 'Vendo bastante mas não sobra nada no bolso', points: 5, problem: 'margem' },
      ],
    },
    {
      id: 2,
      text: 'Se eu te perguntar quanto você vendeu semana passada — você sabe responder na hora?',
      options: [
        { key: 'A', text: 'Sei exatamente — acompanho todo dia', points: 30 },
        { key: 'B', text: 'Tenho uma ideia mas não tenho certeza', points: 15 },
        { key: 'C', text: 'Teria que perguntar para alguém', points: 5 },
        { key: 'D', text: 'Honestamente não sei', points: 0 },
      ],
    },
    {
      id: 3,
      text: 'Se você sair de férias amanhã — suas vendas continuam ou param?',
      options: [
        { key: 'A', text: 'Continuam — minha equipe tem processo claro', points: 30 },
        { key: 'B', text: 'Continuam mais ou menos — mas perco negócios', points: 15 },
        { key: 'C', text: 'Param — as vendas dependem de mim', points: 0 },
        { key: 'D', text: 'Nunca me ausentei porque tenho medo de parar', points: 0 },
      ],
    },
    {
      id: 4,
      text: 'Você sabe qual produto ou serviço faz seu negócio lucrar de verdade — ou está trabalhando duro no que te dá menos?',
      options: [
        { key: 'A', text: 'Sei exatamente — foco no que dá mais margem', points: 25 },
        { key: 'B', text: 'Tenho uma ideia mas nunca parei para calcular', points: 10 },
        { key: 'C', text: 'Vendo de tudo igual e espero sobrar algo', points: 0 },
        { key: 'D', text: 'Nunca pensei nisso antes', points: 0 },
      ],
    },
    {
      id: 5,
      text: 'Quanto dinheiro você acha que está deixando na mesa todo mês por falta de processo comercial?',
      options: [
        { key: 'A', text: 'Pouco — minha operação é bem estruturada', points: 25 },
        { key: 'B', text: 'Alguma coisa — mas não sei quanto exatamente', points: 10 },
        { key: 'C', text: 'Muito — sinto que poderia vender o dobro', points: 5 },
        { key: 'D', text: 'Não faço ideia — e isso me preocupa', points: 0 },
      ],
    },
  ];

  const handleAnswer = (questionId: number, optionKey: 'A' | 'B' | 'C' | 'D') => {
    const newAnswers = [...answers, { question: questionId, answer: optionKey }];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateDiagnosis(newAnswers);
      setCurrentStep('result');
    }
  };

  const calculateDiagnosis = (userAnswers: Answer[]) => {
    let totalScore = 0;

    userAnswers.forEach((answer) => {
      const question = questions.find((q) => q.id === answer.question);
      const option = question?.options.find((o) => o.key === answer.answer);
      if (option) {
        totalScore += option.points;
      }
    });

    // Normalize score to 0-100
    const maxPossibleScore = 110;
    const normalizedScore = Math.round((totalScore / maxPossibleScore) * 100);

    let classification = '';
    let impactMessage = '';

    if (normalizedScore <= 30) {
      classification = 'Negócio em risco';
      impactMessage = 'Seu negócio está funcionando no improviso. Cada dia sem estrutura é dinheiro sendo desperdiçado.';
    } else if (normalizedScore <= 60) {
      classification = 'Potencial represado';
      impactMessage = 'Você tem um negócio com potencial real — mas algo está travando o crescimento. A boa notícia: dá para resolver.';
    } else if (normalizedScore <= 80) {
      classification = 'Em crescimento';
      impactMessage = 'Seu negócio está crescendo mas ainda tem gargalos que estão limitando o quanto você pode ganhar.';
    } else {
      classification = 'Operação madura';
      impactMessage = 'Você construiu uma base sólida. Agora é hora de escalar sem quebrar o que já funciona.';
    }

    // Get main problem from first question
    const firstAnswer = userAnswers[0];
    const firstQuestion = questions[0];
    const firstOption: any = firstQuestion.options.find((o) => o.key === firstAnswer.answer);
    const mainProblem = firstOption?.problem || 'processo';

    // Problem-specific message
    let problemMessage = '';
    if (mainProblem === 'atração') {
      problemMessage = 'Seu maior gargalo está na atração. Você pode ter o melhor produto da cidade — mas se as pessoas certas não chegam até você, isso não importa.';
    } else if (mainProblem === 'conversão') {
      problemMessage = 'Você está pagando para trazer clientes e perdendo eles na hora mais importante — na venda. Cada cliente que foi embora sem comprar custou dinheiro para chegar até você.';
    } else if (mainProblem === 'fidelização') {
      problemMessage = 'Você está no modo corrida de hamster — corre para trazer cliente novo toda semana porque o anterior não voltou. Fidelizar custa 7 vezes menos do que conquistar.';
    } else if (mainProblem === 'margem') {
      problemMessage = 'Faturamento não é lucro. Você pode estar trabalhando mais para ganhar menos. Esse é o erro mais silencioso e mais perigoso do empreendedor.';
    }

    // Identify strengths and weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    userAnswers.forEach((answer, index) => {
      const question = questions[index];
      const option = question.options.find((o) => o.key === answer.answer);
      
      if (option) {
        const maxPoints = Math.max(...question.options.map((o) => o.points));
        if (option.points === maxPoints && option.points > 0) {
          if (index === 1) strengths.push('Controle financeiro e acompanhamento de resultados');
          if (index === 2) strengths.push('Processo comercial estruturado e independente');
          if (index === 3) strengths.push('Clareza sobre produtos mais lucrativos');
          if (index === 4) strengths.push('Operação comercial bem estruturada');
        } else if (option.points === 0 || option.points < maxPoints / 2) {
          if (index === 1) weaknesses.push('Falta de controle sobre números e indicadores de vendas');
          if (index === 2) weaknesses.push('Processo de vendas centralizado e dependente do dono');
          if (index === 3) weaknesses.push('Desconhecimento da margem real dos produtos/serviços');
          if (index === 4) weaknesses.push('Falta de processos comerciais estruturados');
        }
      }
    });

    // Quick win recommendation
    let quickWin = 'Implementar um processo básico de vendas e acompanhamento de indicadores';
    if (mainProblem === 'atração') {
      quickWin = 'Criar uma estratégia de atração de clientes qualificados para seu negócio';
    } else if (mainProblem === 'conversão') {
      quickWin = 'Implementar técnicas de fechamento e processo de qualificação de leads';
    } else if (mainProblem === 'fidelização') {
      quickWin = 'Criar um sistema de pós-venda e programa de fidelização de clientes';
    } else if (mainProblem === 'margem') {
      quickWin = 'Reorganizar precificação e identificar produtos/serviços mais rentáveis';
    }

    setDiagnosis({
      score: normalizedScore,
      classification,
      impactMessage: problemMessage || impactMessage,
      strengths: strengths.length > 0 ? strengths : ['Disposição para melhorar o negócio'],
      weaknesses: weaknesses.length > 0 ? weaknesses : ['Processos comerciais a estruturar'],
      quickWin,
      mainProblem: firstOption?.text || 'estruturação comercial',
    });
  };

  const getScoreColor = (score: number) => {
    if (score <= 30) return 'text-red-500';
    if (score <= 60) return 'text-yellow-500';
    if (score <= 80) return 'text-blue-400';
    return 'text-green-400';
  };

  const getScoreBorderColor = (score: number) => {
    if (score <= 30) return 'border-red-500';
    if (score <= 60) return 'border-yellow-500';
    if (score <= 80) return 'border-blue-400';
    return 'border-green-400';
  };

  const handleRequestDiagnosis = () => {
    setCurrentStep('form');
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!diagnosis) return;
    
    const message = `Oi, fiz o Termômetro do Negócio aqui no app da Rarques e tirei ${diagnosis.score} pontos — classificação: ${diagnosis.classification}. Me identificou bastante na parte de "${diagnosis.mainProblem}". Quero entender o que estou perdendo e como resolver. Posso conversar ${formData.time}.`;

    const whatsappUrl = `https://wa.me/5562992803369?text=${encodeURIComponent(message)}`;

    // Usar clique de âncora para evitar bloqueio de pop-up (comum em iframes/mobile)
    const link = document.createElement('a');
    link.href = whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetQuiz = () => {
    setCurrentStep('quiz');
    setCurrentQuestion(0);
    setAnswers([]);
    setDiagnosis(null);
    setFormData({ company: '', whatsapp: '', time: '' });
  };

  if (currentStep === 'quiz') {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion) / questions.length) * 100;

    return (
      <div className="animate-fadeUp">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Crescer</h2>
          <p className="text-gray-400 text-sm">Descubra onde seu negócio está sangrando dinheiro</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white text-sm font-medium">Termômetro do Negócio</p>
            <p className="text-gray-400 text-sm">{currentQuestion + 1} de {questions.length}</p>
          </div>
          <div className="w-full bg-gray-800 h-2">
            <div
              className="bg-gradient-to-r from-[#FFFFFF] to-[#E0E0E0] h-2 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-gray-900 border border-gray-700 p-6 mb-6">
          <h3 className="text-white text-lg font-bold mb-6 leading-relaxed">{question.text}</h3>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option.key}
                onClick={() => handleAnswer(question.id, option.key as 'A' | 'B' | 'C' | 'D')}
                className="w-full bg-black hover:bg-gray-950 border border-gray-700 hover:border-white text-left p-4 transition-all text-white group"
              >
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 bg-gray-800 border border-gray-600 group-hover:bg-white group-hover:text-black flex items-center justify-center text-white font-bold flex-shrink-0 transition-colors">
                    {option.key}
                  </span>
                  <span className="flex-1">{option.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'result' && diagnosis) {
    return (
      <div className="animate-fadeUp">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Seu Resultado</h2>
          <p className="text-gray-400 text-sm">Termômetro do Negócio</p>
        </div>

        {/* Score Dashboard with Circular Progress */}
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-700 p-8 mb-6">
          <div className="text-center mb-6">
            {/* Circular Progress */}
            <div className="relative inline-flex items-center justify-center mb-4">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-800"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - diagnosis.score / 100)}`}
                  className={`${getScoreColor(diagnosis.score)} transition-all duration-1000`}
                  strokeLinecap="square"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-6xl font-bold ${getScoreColor(diagnosis.score)}`} style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  {diagnosis.score}
                </span>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm mb-4">de 100 pontos</p>
            <div className={`inline-block bg-black px-6 py-3 border-2 ${getScoreBorderColor(diagnosis.score)}`}>
              <p className={`font-bold text-lg ${getScoreColor(diagnosis.score)}`}>
                {diagnosis.classification.toUpperCase()}
              </p>
            </div>
          </div>
          
          <p className="text-white text-center text-base leading-relaxed">
            {diagnosis.impactMessage}
          </p>
        </div>

        {/* Three Analysis Cards */}
        <div className="space-y-4 mb-8">
          {/* Strengths */}
          <div className="bg-gray-900 border-l-4 border-green-500 p-6">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle2 className="text-green-500 flex-shrink-0 mt-1" size={20} />
              <h3 className="text-white font-bold text-lg">Onde você está bem</h3>
            </div>
            <ul className="space-y-2">
              {diagnosis.strengths.map((strength, index) => (
                <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="bg-gray-900 border-l-4 border-red-500 p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-1" size={20} />
              <h3 className="text-white font-bold text-lg">Onde está perdendo dinheiro</h3>
            </div>
            <ul className="space-y-2">
              {diagnosis.weaknesses.map((weakness, index) => (
                <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Win */}
          <div className="bg-gray-900 border-l-4 border-yellow-500 p-6">
            <div className="flex items-start gap-3 mb-4">
              <TrendingUp className="text-yellow-500 flex-shrink-0 mt-1" size={20} />
              <h3 className="text-white font-bold text-lg">O que resolve mais rápido</h3>
            </div>
            <p className="text-gray-300 text-base">{diagnosis.quickWin}</p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleRequestDiagnosis}
          className="w-full bg-black hover:bg-gray-950 border-2 border-[#FFFFFF] text-[#FFFFFF] font-bold py-5 text-lg mb-2 transition-colors"
        >
          Quero descobrir quanto estou perdendo todo mês
        </button>
        <p className="text-center text-gray-400 text-xs mb-6">
          Análise gratuita com especialista da Rarques — 30 minutos que podem mudar seu negócio
        </p>

        {/* Secondary Button */}
        <button
          onClick={resetQuiz}
          className="w-full text-gray-400 hover:text-white font-medium py-3 text-sm transition-colors"
        >
          Refazer o teste
        </button>

        {/* Score Saved Message */}
        <p className="text-center text-gray-500 text-xs mt-4">
          Seu score foi salvo. Refaça o teste em 30 dias para medir sua evolução.
        </p>
      </div>
    );
  }

  if (currentStep === 'form') {
    return (
      <div className="animate-fadeUp">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Análise Gratuita</h2>
          <p className="text-gray-400 text-sm">Descubra quanto você está perdendo todo mês</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmitForm} className="space-y-6">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Nome da Empresa
            </label>
            <input
              type="text"
              required
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 focus:outline-none focus:border-white transition-colors"
              placeholder="Digite o nome da sua empresa"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              WhatsApp para Contato
            </label>
            <input
              type="tel"
              required
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 focus:outline-none focus:border-white transition-colors"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Melhor Horário para Conversar
            </label>
            <select
              required
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 focus:outline-none focus:border-white transition-colors"
            >
              <option value="">Selecione um horário</option>
              <option value="Manhã (8h às 12h)">Manhã (8h às 12h)</option>
              <option value="Tarde (12h às 18h)">Tarde (12h às 18h)</option>
              <option value="Noite (18h às 21h)">Noite (18h às 21h)</option>
            </select>
          </div>

          {/* Info Box */}
          <div className="bg-gray-900 border border-gray-700 p-4">
            <div className="flex items-start gap-3">
              <MessageCircle className="text-green-400 flex-shrink-0" size={20} />
              <p className="text-gray-300 text-sm">
                Ao enviar, você será direcionado para o WhatsApp com sua mensagem pré-formatada incluindo seu score e problema identificado.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-5 text-lg transition-colors flex items-center justify-center gap-3"
          >
            <MessageCircle size={22} />
            Enviar via WhatsApp
          </button>

          <button
            type="button"
            onClick={() => setCurrentStep('result')}
            className="w-full text-gray-400 hover:text-white font-medium py-3 text-sm transition-colors"
          >
            Voltar ao Resultado
          </button>
        </form>
      </div>
    );
  }

  return null;
}
