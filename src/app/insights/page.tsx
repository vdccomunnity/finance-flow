'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Target,
  Lightbulb,
  RefreshCw,
  CheckCircle,
  XCircle,
  PiggyBank,
  TrendingDown,
  Calendar,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase';
import AppNavbar from '@/components/custom/app-navbar';

// Types
interface Insight {
  id: string;
  tipo: 'gastos' | 'metas' | 'orcamento' | 'receitas' | 'habitos';
  prioridade: 'alta' | 'media' | 'baixa';
  titulo: string;
  descricao: string;
  periodoInicio: string;
  periodoFim: string;
  dados?: any;
  status: 'novo' | 'lido' | 'ignorado';
  criadoEm: string;
}

interface Categoria {
  nome: string;
  orcamentoMensal: number;
  gastoAtual: number;
}

interface Meta {
  nome: string;
  valorObjetivo: number;
  valorAtual: number;
  dataLimite: string;
}

export default function InsightsPage() {
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [periodo, setPeriodo] = useState('30');
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [prioridadeFiltro, setPrioridadeFiltro] = useState('todas');
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user) {
      carregarDados(user.id);
    }
  }, []);

  const carregarDados = async (userId: string) => {
    try {
      setIsLoadingData(true);
      const supabase = createClient();

      // Buscar categorias
      const { data: categoriasData } = await supabase
        .from('categorias')
        .select('*')
        .eq('usuario_id', userId);

      // Buscar transações para calcular gastos por categoria
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      
      const { data: transacoesData } = await supabase
        .from('transacoes')
        .select('*')
        .eq('usuario_id', userId)
        .gte('data', inicioMes.toISOString().split('T')[0]);

      // Calcular gastos por categoria
      const categoriasComGastos: Categoria[] = (categoriasData || []).map(cat => {
        const gastoAtual = (transacoesData || [])
          .filter(t => t.categoria_id === cat.id && t.tipo === 'despesa')
          .reduce((sum, t) => sum + parseFloat(t.valor), 0);

        return {
          nome: cat.nome,
          orcamentoMensal: parseFloat(cat.orcamento_mensal || 0),
          gastoAtual
        };
      });

      setCategorias(categoriasComGastos);

      // Buscar metas
      const { data: metasData } = await supabase
        .from('metas')
        .select('*')
        .eq('usuario_id', userId);

      const metasFormatadas: Meta[] = (metasData || []).map(meta => ({
        nome: meta.nome,
        valorObjetivo: parseFloat(meta.valor_objetivo),
        valorAtual: parseFloat(meta.valor_atual || 0),
        dataLimite: meta.data_limite
      }));

      setMetas(metasFormatadas);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const gerarInsights = () => {
    setIsGenerating(true);
    
    const novosInsights: Insight[] = [];
    const hoje = new Date();
    const periodoInicio = new Date(hoje);
    periodoInicio.setDate(periodoInicio.getDate() - parseInt(periodo));

    // Só gera insights se houver dados reais do usuário
    if (categorias.length === 0 && metas.length === 0) {
      setInsights([]);
      setTimeout(() => setIsGenerating(false), 500);
      return;
    }

    // (1) Categoria próxima de estourar
    categorias.forEach(cat => {
      if (cat.orcamentoMensal > 0) {
        const percentual = (cat.gastoAtual / cat.orcamentoMensal) * 100;
        if (percentual >= 80 && percentual < 100) {
          novosInsights.push({
            id: `insight-${Date.now()}-${cat.nome}`,
            tipo: 'orcamento',
            prioridade: 'media',
            titulo: `${cat.nome} próxima do limite`,
            descricao: `Você já utilizou ${percentual.toFixed(1)}% do orçamento de ${cat.nome}. Restam apenas R$ ${(cat.orcamentoMensal - cat.gastoAtual).toFixed(2)} para este mês.`,
            periodoInicio: periodoInicio.toISOString().split('T')[0],
            periodoFim: hoje.toISOString().split('T')[0],
            dados: { categoria: cat.nome, percentual, restante: cat.orcamentoMensal - cat.gastoAtual },
            status: 'novo',
            criadoEm: hoje.toISOString()
          });
        }
      }
    });

    // (2) Categoria estourada
    categorias.forEach(cat => {
      if (cat.orcamentoMensal > 0 && cat.gastoAtual > cat.orcamentoMensal) {
        const excesso = cat.gastoAtual - cat.orcamentoMensal;
        novosInsights.push({
          id: `insight-${Date.now()}-estourado-${cat.nome}`,
          tipo: 'orcamento',
          prioridade: 'alta',
          titulo: `⚠️ Orçamento de ${cat.nome} estourado!`,
          descricao: `Você gastou R$ ${excesso.toFixed(2)} a mais do que o planejado em ${cat.nome}. Considere reduzir gastos nesta categoria.`,
          periodoInicio: periodoInicio.toISOString().split('T')[0],
          periodoFim: hoje.toISOString().split('T')[0],
          dados: { categoria: cat.nome, excesso },
          status: 'novo',
          criadoEm: hoje.toISOString()
        });
      }
    });

    // (3) Economia possível
    const categoriasComGastoAlto = categorias.filter(c => c.gastoAtual > 1000);
    if (categoriasComGastoAlto.length > 0) {
      const cat = categoriasComGastoAlto[0];
      const economiaMensal = cat.gastoAtual * 0.2;
      const economiaAnual = economiaMensal * 12;
      
      novosInsights.push({
        id: `insight-${Date.now()}-economia`,
        tipo: 'gastos',
        prioridade: 'media',
        titulo: `Oportunidade de economia em ${cat.nome}`,
        descricao: `Reduzindo 20% dos gastos em ${cat.nome}, você economizaria R$ ${economiaMensal.toFixed(2)} por mês, totalizando R$ ${economiaAnual.toFixed(2)} por ano.`,
        periodoInicio: periodoInicio.toISOString().split('T')[0],
        periodoFim: hoje.toISOString().split('T')[0],
        dados: { categoria: cat.nome, economiaMensal, economiaAnual },
        status: 'novo',
        criadoEm: hoje.toISOString()
      });
    }

    // (4) Meta em risco
    metas.forEach(meta => {
      const dataLimite = new Date(meta.dataLimite);
      const mesesRestantes = Math.max(1, Math.ceil((dataLimite.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24 * 30)));
      const faltante = meta.valorObjetivo - meta.valorAtual;
      const contribuicaoNecessaria = faltante / mesesRestantes;
      const progressoAtual = (meta.valorAtual / meta.valorObjetivo) * 100;
      
      if (mesesRestantes <= 3 && progressoAtual < 70) {
        novosInsights.push({
          id: `insight-${Date.now()}-meta-risco-${meta.nome}`,
          tipo: 'metas',
          prioridade: 'alta',
          titulo: `Meta "${meta.nome}" em risco`,
          descricao: `Faltam apenas ${mesesRestantes} meses e você está em ${progressoAtual.toFixed(1)}% da meta. Você precisa investir R$ ${contribuicaoNecessaria.toFixed(2)} por mês para alcançá-la.`,
          periodoInicio: periodoInicio.toISOString().split('T')[0],
          periodoFim: hoje.toISOString().split('T')[0],
          dados: { meta: meta.nome, mesesRestantes, contribuicaoNecessaria, progressoAtual },
          status: 'novo',
          criadoEm: hoje.toISOString()
        });
      }
    });

    // (5) Meta quase concluída
    metas.forEach(meta => {
      const progressoAtual = (meta.valorAtual / meta.valorObjetivo) * 100;
      if (progressoAtual >= 80 && progressoAtual < 100) {
        const faltante = meta.valorObjetivo - meta.valorAtual;
        novosInsights.push({
          id: `insight-${Date.now()}-meta-quase-${meta.nome}`,
          tipo: 'metas',
          prioridade: 'media',
          titulo: `🎉 Meta "${meta.nome}" quase concluída!`,
          descricao: `Você já alcançou ${progressoAtual.toFixed(1)}% da meta! Faltam apenas R$ ${faltante.toFixed(2)} para completar.`,
          periodoInicio: periodoInicio.toISOString().split('T')[0],
          periodoFim: hoje.toISOString().split('T')[0],
          dados: { meta: meta.nome, progressoAtual, faltante },
          status: 'novo',
          criadoEm: hoje.toISOString()
        });
      }
    });

    // (6) Simulação de investimento
    const economiaTotal = categoriasComGastoAlto.reduce((sum, c) => sum + (c.gastoAtual * 0.2), 0);
    if (economiaTotal > 0) {
      const taxaMensal = 0.008; // 0,8% ao mês
      const meses = 120; // 10 anos
      let montante = 0;
      
      for (let i = 0; i < meses; i++) {
        montante = (montante + economiaTotal) * (1 + taxaMensal);
      }
      
      novosInsights.push({
        id: `insight-${Date.now()}-investimento`,
        tipo: 'habitos',
        prioridade: 'media',
        titulo: `💰 Potencial de investimento`,
        descricao: `Investindo R$ ${economiaTotal.toFixed(2)} por mês a 0,8% ao mês, em 10 anos você teria R$ ${montante.toFixed(2)}!`,
        periodoInicio: periodoInicio.toISOString().split('T')[0],
        periodoFim: hoje.toISOString().split('T')[0],
        dados: { economiaMensal: economiaTotal, montanteFinal: montante, anos: 10 },
        status: 'novo',
        criadoEm: hoje.toISOString()
      });
    }

    setInsights(novosInsights);
    setTimeout(() => setIsGenerating(false), 1000);
  };

  const handleMarcarLido = (id: string) => {
    setInsights(prev => prev.map(i => i.id === id ? { ...i, status: 'lido' } : i));
  };

  const handleIgnorar = (id: string) => {
    setInsights(prev => prev.map(i => i.id === id ? { ...i, status: 'ignorado' } : i));
  };

  const insightsFiltrados = useMemo(() => {
    return insights.filter(insight => {
      if (insight.status === 'ignorado') return false;
      if (tipoFiltro !== 'todos' && insight.tipo !== tipoFiltro) return false;
      if (prioridadeFiltro !== 'todas' && insight.prioridade !== prioridadeFiltro) return false;
      return true;
    });
  }, [insights, tipoFiltro, prioridadeFiltro]);

  const insightsAltaPrioridade = useMemo(() => {
    return insightsFiltrados.filter(i => i.prioridade === 'alta' && i.status === 'novo');
  }, [insightsFiltrados]);

  const economiaPotencial = useMemo(() => {
    const insightEconomia = insights.find(i => i.tipo === 'gastos' && i.dados?.economiaAnual);
    return insightEconomia?.dados?.economiaAnual || 0;
  }, [insights]);

  const impacto10Anos = useMemo(() => {
    const insightInvestimento = insights.find(i => i.tipo === 'habitos' && i.dados?.montanteFinal);
    return insightInvestimento?.dados?.montanteFinal || 0;
  }, [insights]);

  const formatCurrency = (value: number) => {
    if (!mounted) return '0,00';
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getPrioridadeBadge = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'media':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'baixa':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'gastos':
        return TrendingDown;
      case 'metas':
        return Target;
      case 'orcamento':
        return Wallet;
      case 'receitas':
        return TrendingUp;
      case 'habitos':
        return Lightbulb;
      default:
        return AlertTriangle;
    }
  };

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

      {/* Navbar */}
      <AppNavbar activePage="insights" />

      {/* Content */}
      <div className="relative z-10">
        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Título */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Lightbulb className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">Insights Inteligentes</h1>
            </div>
            <p className="text-gray-400">Análises personalizadas para otimizar suas finanças.</p>
          </div>

          {/* Filtros */}
          <section className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Período */}
              <div>
                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Período
                </label>
                <select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="w-full bg-[#0f0f17]/80 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none transition-all"
                >
                  <option value="30">Últimos 30 dias</option>
                  <option value="90">Últimos 3 meses</option>
                  <option value="180">Últimos 6 meses</option>
                  <option value="365">Últimos 12 meses</option>
                </select>
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Tipo de Insight
                </label>
                <select
                  value={tipoFiltro}
                  onChange={(e) => setTipoFiltro(e.target.value)}
                  className="w-full bg-[#0f0f17]/80 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none transition-all"
                >
                  <option value="todos">Todos</option>
                  <option value="gastos">Gastos</option>
                  <option value="metas">Metas</option>
                  <option value="orcamento">Orçamento</option>
                  <option value="receitas">Receitas</option>
                  <option value="habitos">Hábitos</option>
                </select>
              </div>

              {/* Prioridade */}
              <div>
                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Prioridade
                </label>
                <select
                  value={prioridadeFiltro}
                  onChange={(e) => setPrioridadeFiltro(e.target.value)}
                  className="w-full bg-[#0f0f17]/80 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none transition-all"
                >
                  <option value="todas">Todas</option>
                  <option value="alta">Alta</option>
                  <option value="media">Média</option>
                  <option value="baixa">Baixa</option>
                </select>
              </div>

              {/* Botão Gerar */}
              <div className="flex items-end">
                <button
                  onClick={gerarInsights}
                  disabled={isGenerating || isLoadingData}
                  className="w-full px-6 py-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-5 h-5 ${isGenerating || isLoadingData ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Gerando...' : isLoadingData ? 'Carregando...' : 'Gerar Novos Insights'}
                </button>
              </div>
            </div>
          </section>

          {/* Cards de Resumo */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Total de Insights</span>
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/30">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">{insightsFiltrados.length}</div>
              <div className="text-xs text-gray-400 mt-1">Insights ativos</div>
            </div>

            <div className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/10 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400/30 to-orange-400/30" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Alta Prioridade</span>
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-400/30 to-orange-400/30">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">{insightsAltaPrioridade.length}</div>
              <div className="text-xs text-gray-400 mt-1">Requerem atenção</div>
            </div>

            <div className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400/30 to-emerald-400/30" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Economia Potencial</span>
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-400/30 to-emerald-400/30">
                  <PiggyBank className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">R$ {formatCurrency(economiaPotencial)}</div>
              <div className="text-xs text-gray-400 mt-1">Por ano</div>
            </div>

            <div className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400/30 to-pink-400/30" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Impacto em 10 anos</span>
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-400/30 to-pink-400/30">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">R$ {formatCurrency(impacto10Anos)}</div>
              <div className="text-xs text-gray-400 mt-1">Com investimento a 0,8% a.m.</div>
            </div>
          </section>

          {/* Insights de Alta Prioridade */}
          {insightsAltaPrioridade.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                Prioridade Alta
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {insightsAltaPrioridade.map((insight) => {
                  const TipoIcon = getTipoIcon(insight.tipo);
                  return (
                    <div
                      key={insight.id}
                      className="backdrop-blur-xl bg-[#1a1a24]/60 border border-red-500/30 rounded-2xl p-6 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400/50 to-orange-400/50" />
                      
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-red-500/20">
                            <TipoIcon className="w-5 h-5 text-red-400" />
                          </div>
                          <div>
                            <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium border ${getPrioridadeBadge(insight.prioridade)}`}>
                              {insight.prioridade.toUpperCase()}
                            </span>
                            <span className="ml-2 text-xs text-gray-400 capitalize">{insight.tipo}</span>
                          </div>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-2">{insight.titulo}</h3>
                      <p className="text-gray-300 text-sm mb-4">{insight.descricao}</p>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-xs text-gray-400">
                          Baseado em {periodo} dias
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleMarcarLido(insight.id)}
                            className="p-2 hover:bg-green-500/20 rounded-lg transition-colors group"
                            title="Marcar como lido"
                          >
                            <CheckCircle className="w-4 h-4 text-gray-400 group-hover:text-green-400" />
                          </button>
                          <button
                            onClick={() => handleIgnorar(insight.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                            title="Ignorar"
                          >
                            <XCircle className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Todos os Insights */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-purple-400" />
              Todos os Insights
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {insightsFiltrados.filter(i => i.prioridade !== 'alta' || i.status === 'lido').map((insight) => {
                const TipoIcon = getTipoIcon(insight.tipo);
                return (
                  <div
                    key={insight.id}
                    className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30" />
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                          <TipoIcon className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium border ${getPrioridadeBadge(insight.prioridade)}`}>
                            {insight.prioridade.toUpperCase()}
                          </span>
                          <span className="ml-2 text-xs text-gray-400 capitalize">{insight.tipo}</span>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{insight.titulo}</h3>
                    <p className="text-gray-300 text-sm mb-4">{insight.descricao}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <span className="text-xs text-gray-400">
                        Baseado em {periodo} dias
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMarcarLido(insight.id)}
                          className="p-2 hover:bg-green-500/20 rounded-lg transition-colors group"
                          title="Marcar como lido"
                        >
                          <CheckCircle className="w-4 h-4 text-gray-400 group-hover:text-green-400" />
                        </button>
                        <button
                          onClick={() => handleIgnorar(insight.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                          title="Ignorar"
                        >
                          <XCircle className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {insightsFiltrados.length === 0 && (
              <div className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-12 text-center">
                <Lightbulb className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Nenhum insight disponível</h3>
                <p className="text-gray-400 mb-4">
                  {categorias.length === 0 && metas.length === 0 
                    ? 'Comece registrando transações, criando categorias e definindo metas para receber análises personalizadas.'
                    : 'Clique em "Gerar Novos Insights" para analisar seus dados financeiros.'}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Link
                    href="/transacoes"
                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-lg transition-all text-sm font-medium"
                  >
                    Adicionar Transações
                  </Link>
                  <Link
                    href="/categorias"
                    className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 rounded-lg transition-all text-sm font-medium"
                  >
                    Criar Categorias
                  </Link>
                  <Link
                    href="/metas"
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-lg transition-all text-sm font-medium"
                  >
                    Definir Metas
                  </Link>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

// Helper component
function Wallet({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}
