'use client';

export const dynamic = 'force-dynamic';

import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank, 
  AlertCircle,
  Tag,
  AlertTriangle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getUserTransactions, 
  calculateTotals,
  calculateGastosPorCategoria,
  type Transaction 
} from '@/lib/user-data';
import AppNavbar from '@/components/custom/app-navbar';

export default function DashboardPage() {
  const { user: currentUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Carregar transações do usuário
    if (currentUser) {
      const userTransactions = getUserTransactions(currentUser.id);
      setTransactions(userTransactions);
    }
  }, [currentUser]);

  // Calcula mês/ano atual
  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();

  // Calcula totais do mês atual - SEMPRE baseado em dados reais
  const totais = calculateTotals(transactions, mesAtual, anoAtual);
  const hasData = transactions.length > 0;

  // Calcula taxa de economia
  const taxaEconomia = totais.receitas > 0 
    ? ((totais.saldo / totais.receitas) * 100).toFixed(0)
    : '0';

  // Calcula gastos por categoria
  const gastosPorCategoria = calculateGastosPorCategoria(transactions, mesAtual, anoAtual);
  const categoriasArray = Object.entries(gastosPorCategoria).map(([nome, valor]) => ({
    name: nome,
    value: valor,
    color: '#6366f1', // Cor padrão
    percentage: totais.despesas > 0 ? (valor / totais.despesas) * 100 : 0
  }));

  // Alertas inteligentes - APENAS se houver dados
  const alerts = hasData ? [
    {
      text: "Seus insights aparecerão aqui quando você registrar transações e categorias.",
      type: "info"
    }
  ] : [
    {
      text: "Seus insights aparecerão aqui quando você registrar transações e categorias.",
      type: "info"
    }
  ];

  // Cards principais - SEMPRE mostram dados reais ou R$ 0,00
  const mainCards = [
    {
      title: "Saldo Total do Mês",
      value: `R$ ${totais.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      comparison: hasData ? "Receitas - Despesas" : "Adicione sua primeira transação",
      trend: totais.saldo >= 0 ? "up" : "down",
      icon: DollarSign,
      accentColor: "from-blue-500/30 to-purple-500/30"
    },
    {
      title: "Receitas",
      value: `R$ ${totais.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      comparison: hasData ? `${totais.quantidade} transações` : "Nenhuma receita registrada",
      trend: "up",
      icon: TrendingUp,
      accentColor: "from-blue-400/30 to-cyan-400/30"
    },
    {
      title: "Despesas",
      value: `R$ ${totais.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      comparison: hasData ? `${totais.quantidade} transações` : "Nenhuma despesa registrada",
      trend: "down",
      icon: TrendingDown,
      accentColor: "from-purple-400/30 to-pink-400/30"
    },
    {
      title: "Taxa de Economia",
      value: `${taxaEconomia}%`,
      comparison: hasData ? "Do total de receitas" : "Comece a economizar hoje",
      trend: "neutral",
      icon: PiggyBank,
      accentColor: "from-indigo-400/30 to-purple-400/30"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a1a] to-[#0a0a0f] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/3 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <AppNavbar />

      {/* Content */}
      <div className="relative z-10">
        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Alertas Inteligentes */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-purple-400" />
              Alertas Inteligentes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`backdrop-blur-xl rounded-2xl p-6 transition-all ${
                    alert.type === 'warning'
                      ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-[#e7c56c]/20 hover:border-[#e7c56c]/40 hover:shadow-lg hover:shadow-yellow-500/10'
                      : 'bg-[#1a1a24]/60 border border-purple-500/20 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {alert.type === 'warning' && (
                      <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-gray-300 text-sm leading-relaxed">{alert.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Cards Principais */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all relative overflow-hidden group"
                >
                  {/* Accent gradient no topo */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.accentColor}`} />
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-400">{card.title}</span>
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${card.accentColor}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{card.value}</div>
                  <div className={`text-sm flex items-center gap-1 text-gray-400`}>
                    {card.trend === 'up' && <TrendingUp className="w-4 h-4 text-blue-400" />}
                    {card.trend === 'down' && <TrendingDown className="w-4 h-4 text-purple-400" />}
                    {card.comparison}
                  </div>
                </div>
              );
            })}
          </section>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gráfico de Pizza - Gastos por Categoria */}
            <section className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6 hover:border-purple-500/20 transition-all">
              <h3 className="text-xl font-bold text-white mb-6">Gastos por Categoria</h3>
              
              {hasData && categoriasArray.length > 0 ? (
                <>
                  {/* Pizza Chart Visual */}
                  <div className="flex items-center justify-center mb-8">
                    <div className="relative w-48 h-48">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        {categoriasArray.map((category, index) => {
                          const previousPercentage = categoriasArray
                            .slice(0, index)
                            .reduce((sum, cat) => sum + cat.percentage, 0);
                          const strokeDasharray = `${category.percentage} ${100 - category.percentage}`;
                          const strokeDashoffset = -previousPercentage;
                          
                          return (
                            <circle
                              key={index}
                              cx="50"
                              cy="50"
                              r="15.9155"
                              fill="transparent"
                              stroke={category.color}
                              strokeWidth="31.831"
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                              opacity="0.9"
                            />
                          );
                        })}
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">100%</div>
                          <div className="text-xs text-gray-400">Total</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Legenda */}
                  <div className="space-y-3">
                    {categoriasArray.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm text-gray-300">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-400">{category.percentage.toFixed(1)}%</span>
                          <span className="text-sm font-semibold text-white">
                            R$ {category.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Tag className="w-16 h-16 text-gray-600 mb-4" />
                  <p className="text-gray-400 text-sm">
                    Nenhum gasto registrado ainda.
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    Adicione sua primeira transação para ver seus gastos por categoria.
                  </p>
                </div>
              )}
            </section>

            {/* Fluxo de Caixa Mensal - Placeholder */}
            <section className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6 hover:border-purple-500/20 transition-all">
              <h3 className="text-xl font-bold text-white mb-6">Fluxo de Caixa Mensal</h3>
              {hasData ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <TrendingUp className="w-16 h-16 text-gray-600 mb-4" />
                  <p className="text-gray-400 text-sm">
                    Gráfico de fluxo mensal em desenvolvimento.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <TrendingUp className="w-16 h-16 text-gray-600 mb-4" />
                  <p className="text-gray-400 text-sm">
                    Adicione sua primeira transação para ver seu fluxo mensal.
                  </p>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
