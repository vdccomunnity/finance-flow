'use client';

import { useEffect, useState } from 'react';
import { DollarSign, ArrowRight, CheckCircle2, AlertCircle, Crown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getCurrentUser, hasAccess } from '@/lib/auth';

export default function UpgradePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    setMounted(true);
    
    // Verificar se usuário está logado
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    setUserName(user.nome);

    // Se usuário tem acesso (premium ou teste ativo), redirecionar para dashboard
    if (hasAccess()) {
      router.push('/dashboard');
    }
  }, [router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a1a] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a1a] to-[#0a0a0f] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/3 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header discreto */}
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/80 to-purple-600/80 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              FinanceFlow
            </span>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-120px)]">
          <div className="w-full max-w-5xl">
            {/* Banner de Alerta */}
            <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-2xl p-8 mb-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Seu teste gratuito terminou
              </h1>
              <p className="text-lg text-red-300/80 max-w-2xl mx-auto">
                {userName}, para continuar usando o FinanceFlow e ter acesso a todas as suas transações, 
                metas e relatórios, escolha um dos planos abaixo.
              </p>
            </div>

            {/* Título dos Planos */}
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Escolha seu plano
              </h2>
              <p className="text-gray-400">
                Cancele quando quiser. Sem taxas ocultas.
              </p>
            </div>

            {/* Cards de Planos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plano Mensal */}
              <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/20 rounded-2xl p-8 hover:scale-105 transition-all">
                <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-400/50 mb-6">
                  <span className="text-sm text-blue-300">Plano Mensal</span>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      R$ 19,90
                    </span>
                    <span className="text-gray-400">/mês</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Cobrança mensal recorrente
                  </p>
                </div>

                <Link href="https://pay.cakto.com.br/4jopwnh" target="_blank">
                  <Button 
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-2xl shadow-blue-500/25 transition-all hover:scale-105"
                  >
                    Assinar Plano Mensal
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>

                <div className="mt-6 space-y-3">
                  {[
                    'Acesso completo ao app',
                    'Transações ilimitadas',
                    'Relatórios em PDF',
                    'Backup automático',
                    'Suporte prioritário',
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3 text-white/80">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plano Trimestral */}
              <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-yellow-400/50 rounded-2xl p-8 hover:scale-105 transition-all relative">
                {/* Selo "Melhor Oferta" */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="px-6 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold text-sm shadow-lg flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    Melhor Oferta
                  </div>
                </div>

                <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-400/50 mb-6">
                  <span className="text-sm text-blue-300">Plano Trimestral</span>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      R$ 49,90
                    </span>
                    <span className="text-gray-400">/3 meses</span>
                  </div>
                  <p className="text-sm text-green-400 font-medium">
                    Economize R$ 9,80 (16% de desconto)
                  </p>
                </div>

                <Link href="https://pay.cakto.com.br/mq6e7q5" target="_blank">
                  <Button 
                    size="lg"
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold px-8 py-6 text-lg rounded-xl shadow-2xl shadow-yellow-500/25 transition-all hover:scale-105"
                  >
                    Assinar Plano Trimestral
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>

                <div className="mt-6 space-y-3">
                  {[
                    'Acesso completo ao app',
                    'Transações ilimitadas',
                    'Relatórios em PDF',
                    'Backup automático',
                    'Suporte prioritário',
                    '✨ Economia de 16%',
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3 text-white/80">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="mt-8 text-center">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 max-w-2xl mx-auto">
                <p className="text-sm text-gray-400 leading-relaxed">
                  <strong className="text-white">Importante:</strong> Após a confirmação do pagamento, 
                  seu acesso será liberado automaticamente. Você poderá cancelar sua assinatura a qualquer momento 
                  sem taxas adicionais.
                </p>
              </div>
            </div>

            {/* Link para voltar */}
            <div className="mt-6 text-center">
              <Link 
                href="/login"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Voltar para o login
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
