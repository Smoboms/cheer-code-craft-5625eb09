import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState<'client' | 'company'>('client');
  const [fullName, setFullName] = useState('');
  const [documento, setDocumento] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [signupDone, setSignupDone] = useState<{ email: string; isCompany: boolean } | null>(null);
  const [resetLoading, setResetLoading] = useState(false);


  const handleForgotPassword = async () => {
    setError('');
    setInfo('');
    if (!email) {
      setError('Digite seu e-mail acima para receber o link de recuperação.');
      return;
    }
    setResetLoading(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (err) throw err;
      setInfo('Enviamos um link de recuperação para o seu e-mail.');
    } catch (err: any) {
      setError(err.message || 'Não foi possível enviar o e-mail de recuperação.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isRegistering) {
      if (password !== confirmPassword) {
        setError('As senhas não coincidem');
        return;
      }
      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres');
        return;
      }
    }
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        if (!fullName.trim()) { setError('Informe seu nome completo'); setLoading(false); return; }
        if (accountType === 'client' && !documento.trim()) { setError('Informe seu CPF'); setLoading(false); return; }
        if (accountType === 'company' && (!documento.trim() || !companyName.trim())) {
          setError('Informe CNPJ e nome da empresa'); setLoading(false); return;
        }
        await signUp(email, password, {
          full_name: fullName.trim(),
          account_type: accountType,
          cpf: accountType === 'client' ? documento.replace(/\D/g, '') : null,
          cnpj: accountType === 'company' ? documento.replace(/\D/g, '') : null,
          company_name: accountType === 'company' ? companyName.trim() : null,
        });
        setSignupDone({ email: email.trim(), isCompany: accountType === 'company' });
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials'
        ? 'E-mail ou senha incorretos'
        : err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };


  if (signupDone) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4"
        style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 40%, #0d0d0d 100%)' }}>
        <div className="max-w-md w-full text-center rounded-sm p-8 border border-white/10"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', backdropFilter: 'blur(20px)' }}>
          <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-white/20 flex items-center justify-center">
            <Mail className="text-white/80" size={28} />
          </div>
          <h1 className="text-3xl text-white mb-3 tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif", fontWeight: 300 }}>
            Confirme seu e-mail
          </h1>
          <p className="text-white/70 text-sm mb-2">
            Enviamos um link de confirmação para
          </p>
          <p className="text-white font-medium text-sm mb-6 break-all">{signupDone.email}</p>
          <p className="text-white/50 text-xs mb-6 leading-relaxed">
            Abra sua caixa de entrada (ou spam) e clique no link para ativar sua conta.
            {signupDone.isCompany && ' Após confirmar, sua empresa passará por curadoria.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSignupDone(null);
              setIsRegistering(false);
              setPassword('');
              setConfirmPassword('');
            }}
            className="w-full py-3 rounded-sm font-medium text-sm tracking-widest uppercase border border-white/20 text-white hover:bg-white/10 transition-all"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Voltar ao login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 40%, #0d0d0d 100%)' }}>
      
      {/* Textured dark overlay */}
      <div className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(ellipse at 50% 0%, rgba(40,40,40,0.8) 0%, transparent 60%),
                           radial-gradient(ellipse at 50% 100%, rgba(20,20,20,0.6) 0%, transparent 50%)`,
        }}
      />
      
      {/* Subtle vignette */}
      <div className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* Decorative line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent" />

      <div className="max-w-md w-full relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-10">
          <h1 
            className="text-5xl text-white mb-1 tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif", fontWeight: 300 }}
          >
            <span className="italic">R</span>arques
          </h1>
          <h2
            className="text-lg tracking-[0.35em] text-white/80 uppercase"
            style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif", fontWeight: 400 }}
          >
            Association
          </h2>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/30" />
            <span className="text-white/40 text-xs tracking-[0.3em] uppercase" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Estratégia · Autoridade · Domínio
            </span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/30" />
          </div>
          <p className="text-white/40 text-sm mt-5" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {isRegistering ? 'Crie sua conta e entre para o círculo' : 'Acesse sua conta'}
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-sm p-6 border border-white/10"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', backdropFilter: 'blur(20px)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="border border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3 rounded-sm text-sm">
                {error}
              </div>
            )}
            {info && (
              <div className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 px-4 py-3 rounded-sm text-sm">
                {info}
              </div>
            )}

            {isRegistering && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {(['client','company'] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setAccountType(t)}
                      className={`py-2 text-xs tracking-widest uppercase border transition-all rounded-sm ${
                        accountType === t ? 'border-white/60 bg-white/10 text-white' : 'border-white/10 text-white/50 hover:text-white/80'
                      }`}
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {t === 'client' ? 'Sou Cliente' : 'Sou Empresa'}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-2 tracking-widest uppercase">Nome completo</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome" required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 text-sm" />
                </div>
                {accountType === 'company' && (
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-2 tracking-widest uppercase">Nome da empresa</label>
                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Razão social ou fantasia" required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 text-sm" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-2 tracking-widest uppercase">
                    {accountType === 'client' ? 'CPF' : 'CNPJ'}
                  </label>
                  <input type="text" value={documento} onChange={(e) => setDocumento(e.target.value)}
                    placeholder={accountType === 'client' ? '000.000.000-00' : '00.000.000/0000-00'}
                    required inputMode="numeric"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 text-sm" />
                </div>
              </>
            )}



            <div>
              <label htmlFor="email" className="block text-xs font-medium text-white/50 mb-2 tracking-widest uppercase">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input
                  id="email" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-white/50 mb-2 tracking-widest uppercase">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input
                  id="password" type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegistering ? 'Mínimo 6 caracteres' : '••••••••'}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all text-sm"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isRegistering && (
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-medium text-white/50 mb-2 tracking-widest uppercase">Confirmar senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input
                    id="confirmPassword" type={showPassword ? 'text' : 'password'} value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all text-sm"
                    required
                  />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-sm font-medium text-sm tracking-widest uppercase transition-all disabled:opacity-50 border border-white/20 text-white hover:bg-white/10 active:scale-[0.98]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {loading ? 'Aguarde...' : isRegistering ? 'Criar conta' : 'Entrar'}
            </button>

            {!isRegistering && (
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading}
                className="w-full text-center text-xs text-white/50 hover:text-white/80 underline underline-offset-4 transition-colors disabled:opacity-50"
              >
                {resetLoading ? 'Enviando…' : 'Esqueci minha senha'}
              </button>
            )}
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => { setIsRegistering(!isRegistering); setConfirmPassword(''); setError(''); }}
              className="text-sm text-white/40 hover:text-white/70 transition-colors">
              {isRegistering ? (
                <>Já tem uma conta? <span className="text-white/70 underline underline-offset-4">Entrar</span></>
              ) : (
                <>Não tem uma conta? <span className="text-white/70 underline underline-offset-4">Criar conta</span></>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-8" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade
        </p>

        {/* Bottom decorative line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-t from-transparent via-white/10 to-transparent" />
      </div>
    </div>
  );
}
