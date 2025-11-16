'use client';

import { ArrowRight, BarChart3, Target, TrendingUp, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
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
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <Image 
                  src="https://yysoqnkftzkhsrxzzmqo.supabase.co/storage/v1/object/public/lasy-images/1747936678766-logo.png"
                  alt="FinanceFlow Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                FinanceFlow
              </span>
            </div>
            <Link href="/login">
              <Button 
                variant="ghost" 
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                Entrar
              </Button>
            </Link>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">

            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Organize sua vida <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">financeira</span> com o <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">FinanceFlow</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto">
              Uma ferramenta elegante e poderosa que transforma o controle financeiro 
              em parte natural do seu dia a dia.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link href="/criar-conta">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-2xl shadow-2xl shadow-blue-500/25 transition-all hover:scale-105"
                >
                  Começar agora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <div className="text-sm text-white/50">
                Apenas R$ 19,90/mês no plano mensal
              </div>
            </div>

            {/* Glass Card Preview */}
            <div className="mt-20 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl" />
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Saldo Card */}
                  <div className="backdrop-blur-sm bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 rounded-2xl p-6">
                    <div className="text-sm text-white/60 mb-2">Saldo do mês</div>
                    <div className="text-3xl font-bold text-white">R$ 2.847,00</div>
                    <div className="text-sm text-green-400 mt-2">+12% vs mês anterior</div>
                  </div>

                  {/* Receitas Card */}
                  <div className="backdrop-blur-sm bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-white/10 rounded-2xl p-6">
                    <div className="text-sm text-white/60 mb-2">Receitas</div>
                    <div className="text-3xl font-bold text-white">R$ 5.200,00</div>
                    <div className="text-sm text-white/50 mt-2">3 transações</div>
                  </div>

                  {/* Despesas Card */}
                  <div className="backdrop-blur-sm bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-white/10 rounded-2xl p-6">
                    <div className="text-sm text-white/60 mb-2">Despesas</div>
                    <div className="text-3xl font-bold text-white">R$ 2.353,00</div>
                    <div className="text-sm text-white/50 mt-2">18 transações</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Tudo que você precisa para
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                transformar suas finanças
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all hover:scale-105">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Dashboard Inteligente</h3>
              <p className="text-white/60">
                Visualize suas finanças em tempo real com gráficos elegantes e insights automáticos.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all hover:scale-105">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Metas Financeiras</h3>
              <p className="text-white/60">
                Defina objetivos e acompanhe seu progresso com indicadores visuais motivadores.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all hover:scale-105">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Insights Personalizados</h3>
              <p className="text-white/60">
                Receba dicas inteligentes sobre como economizar e investir melhor seu dinheiro.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all hover:scale-105">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Controle de Limites</h3>
              <p className="text-white/60">
                Defina limites por categoria e receba alertas quando estiver próximo do teto.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all hover:scale-105">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Design Liquid Glass</h3>
              <p className="text-white/60">
                Interface moderna e sofisticada que torna o controle financeiro uma experiência visual.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all hover:scale-105">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Simples e Intuitivo</h3>
              <p className="text-white/60">
                Registre transações em segundos. Sem complicação, sem curva de aprendizado.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Escolha seu plano
            </h2>
            <p className="text-white/60 text-lg">
              Planos a partir de R$ 19,90/mês
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
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

              <Link href="https://pay.cakto.com.br/4jopwnh" target="_blank">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-6 text-lg rounded-2xl shadow-2xl shadow-blue-500/25 transition-all hover:scale-105 w-full"
                >
                  Assinar plano mensal
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>

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

              <Link href="https://pay.cakto.com.br/mq6e7q5" target="_blank">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-6 text-lg rounded-2xl shadow-2xl shadow-blue-500/25 transition-all hover:scale-105 w-full"
                >
                  Assinar plano trimestral
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>

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
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-12 border-t border-white/10">
          <div className="text-center text-white/40">
            <p>© 2024 FinanceFlow. Transforme sua vida financeira.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
