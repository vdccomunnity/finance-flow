'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { DollarSign, Mail, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { login, hasActiveSubscription } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, login: setAuthUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ✅ NOVO: Verificar se usuário já está logado com assinatura ativa
  useEffect(() => {
    if (user && hasActiveSubscription(user)) {
      // Usuário já está logado com assinatura ativa, redirecionar para dashboard
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Validação básica
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      setIsLoading(false);
      return;
    }
    
    try {
      // Fazer login com Supabase
      const loggedUser = await login(email, password);
      
      if (loggedUser) {
        // Atualizar contexto de autenticação
        setAuthUser(loggedUser);
        
        // ✅ AJUSTADO: Verificar se tem assinatura ativa usando a helper
        if (hasActiveSubscription(loggedUser)) {
          // Redirecionar para dashboard
          router.push('/dashboard');
        } else {
          // Sem assinatura ativa - redirecionar para página de acesso/planos
          router.push('/acesso');
        }
      } else {
        setError('E-mail ou senha incorretos');
        setIsLoading(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login. Tente novamente.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a1a] to-[#0a0a0f] relative overflow-hidden">
      {/* Background Effects - Mesmos do dashboard */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/3 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header discreto */}
        <header className="container mx-auto px-4 py-6">
          <Link href="/" className="flex items-center gap-3 w-fit">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/80 to-purple-600/80 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              FinanceFlow
            </span>
          </Link>
        </header>

        {/* Card de Login Centralizado */}
        <main className="container mx-auto px-4 py-12 md:py-20 flex items-center justify-center min-h-[calc(100vh-120px)]">
          <div className="w-full max-w-md">
            {/* Card principal */}
            <div className="backdrop-blur-xl bg-[#1a1a24]/60 border border-purple-500/20 rounded-2xl p-8 shadow-2xl shadow-purple-500/10 hover:border-purple-500/30 transition-all">
              {/* Ícone opcional no topo */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-purple-400" />
                </div>
              </div>

              {/* Título */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Acessar sua conta
                </h1>
                <p className="text-gray-400 text-sm">
                  Entre para continuar gerenciando suas finanças
                </p>
              </div>

              {/* Formulário */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Campo Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-300 block">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full bg-[#0f0f17]/80 border border-white/10 rounded-xl px-11 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Campo Senha */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-300 block">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#0f0f17]/80 border border-white/10 rounded-xl px-11 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Link Esqueci minha senha */}
                <div className="flex justify-end">
                  <Link 
                    href="/recuperar-senha"
                    className="text-sm text-purple-400 hover:text-purple-300 transition-all hover:scale-105 inline-block"
                  >
                    Esqueci minha senha
                  </Link>
                </div>

                {/* Mensagem de erro */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                {/* Botão Entrar */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-6 rounded-xl font-semibold shadow-lg transition-all ${
                    isLoading
                      ? 'bg-gray-600 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-purple-500/25 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/30'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Entrando...
                    </span>
                  ) : (
                    <>
                      Entrar
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>

              {/* Separador */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#1a1a24] text-gray-400">ou</span>
                </div>
              </div>

              {/* Botão Criar Conta */}
              <Link href="/criar-conta">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-2 border-purple-500/30 bg-transparent hover:bg-purple-500/10 text-white py-6 rounded-xl font-semibold transition-all hover:scale-[1.02] hover:border-purple-500/50"
                >
                  Criar Conta
                </Button>
              </Link>

              {/* Rodapé do card */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  Painel de{' '}
                  <Link 
                    href="/admin"
                    className="text-purple-400 hover:text-purple-300 font-medium transition-all hover:scale-105 inline-block"
                  >
                    Admin
                  </Link>
                </p>
              </div>
            </div>

            {/* Texto adicional abaixo do card */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Ao continuar, você concorda com nossos{' '}
                <Link href="/termos" className="text-purple-400 hover:text-purple-300 transition-colors">
                  Termos de Uso
                </Link>
                {' '}e{' '}
                <Link href="/privacidade" className="text-purple-400 hover:text-purple-300 transition-colors">
                  Política de Privacidade
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
