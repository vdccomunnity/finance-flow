'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { DollarSign, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getCurrentUser, hasActiveSubscription } from '@/lib/auth';

export default function AcessoPage() {
  useEffect(() => {
    // Se não estiver autenticado, redirecionar para login
    const user = getCurrentUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    // Se já tem assinatura ativa, redirecionar para dashboard
    if (hasActiveSubscription()) {
      window.location.href = '/dashboard';
    }
  }, []);

  const handleSelectPlan = (url: string) => {
    // Apenas redirecionar para o link de pagamento em nova aba
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#1a0b2e] to-[#0A0A0F] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
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

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-5xl mx-auto">
            {/* Título */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                Escolha um plano para continuar
              </h1>
              <p className="text-white/60 text-lg">
                Selecione o plano ideal para você e comece a transformar suas finanças
              </p>
            </div>

            {/* Cards de Planos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Plano Mensal */}
              <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/20 rounded-3xl p-12 text-center hover:scale-105 transition-all">
                <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-400/50 mb-6">
                  <span className="text-sm text-blue-300">Plano Mensal</span>
                </div>

                <div className="flex items-baseline justify-center gap-2 mb-6">
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    R$19,90
                  </span>
                  <span className="text-white/60 text-lg">/mês</span>
                </div>

                <p className="text-white/60 mb-8 max-w-md mx-auto">
                  Cancele quando quiser. Sem taxas ocultas. Sem compromisso.
                </p>

                <Button 
                  onClick={() => handleSelectPlan('https://pay.cakto.com.br/4jopwnh')}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-6 text-lg rounded-2xl shadow-2xl shadow-blue-500/25 transition-all hover:scale-105 w-full"
                >
                  Assinar agora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <div className="mt-8 space-y-3">
                  {[
                    'Acesso completo a todas as funcionalidades',
                    'Relatórios em PDF ilimitados',
                    'Backup automático dos seus dados',
                    'Suporte prioritário',
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center justify-center gap-3 text-white/80">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plano Trimestral */}
              <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-yellow-400/50 rounded-3xl p-12 text-center hover:scale-105 transition-all relative">
                {/* Selo "Melhor Oferta" */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="px-6 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold text-sm shadow-lg">
                    ⭐ Melhor Oferta
                  </div>
                </div>

                <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-400/50 mb-6">
                  <span className="text-sm text-blue-300">Plano Trimestral</span>
                </div>

                <div className="flex items-baseline justify-center gap-2 mb-6">
                  <span className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    R$49,90
                  </span>
                  <span className="text-white/60 text-lg">/3 meses</span>
                </div>

                <p className="text-white/60 mb-8 max-w-md mx-auto">
                  Cancele quando quiser. Sem taxas ocultas. Sem compromisso.
                </p>

                <Button 
                  onClick={() => handleSelectPlan('https://pay.cakto.com.br/mq6e7q5')}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-6 text-lg rounded-2xl shadow-2xl shadow-blue-500/25 transition-all hover:scale-105 w-full"
                >
                  Assinar agora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <div className="mt-8 space-y-3">
                  {[
                    'Acesso completo a todas as funcionalidades',
                    'Relatórios em PDF ilimitados',
                    'Backup automático dos seus dados',
                    'Suporte prioritário',
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center justify-center gap-3 text-white/80">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Nota sobre pagamento */}
            <div className="mt-12 text-center">
              <p className="text-white/40 text-sm">
                Ao clicar em "Assinar agora", você será redirecionado para a página de pagamento seguro.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
