'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  Edit2,
  Trash2,
  X,
  LayoutDashboard,
  Tag,
  Target,
  Lightbulb,
  Settings,
  Receipt,
  AlertTriangle,
  Wallet,
  PieChart
} from 'lucide-react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { 
  getUserCategorias, 
  getUserTransactions,
  saveCategoria,
  updateCategoria as updateCategoriaData,
  deleteCategoria as deleteCategoriaData,
  calculateGastosPorCategoria,
  calculateReceitasPorCategoria,
  calculateCategoriasSummary,
  type Categoria,
  type Transaction
} from '@/lib/user-data';
import { useRouter } from 'next/navigation';
import AppNavbar from '@/components/custom/app-navbar';

export default function CategoriasPage() {
  const router = useRouter();
  // Estado para controlar hydration
  const [mounted, setMounted] = useState(false);

  // Lógica dinâmica de anos
  const currentYear = new Date().getFullYear();
  const anosDisponiveis = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Estados
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('6');
  const [anoSelecionado, setAnoSelecionado] = useState(currentYear);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [currentCategoria, setCurrentCategoria] = useState<Categoria>({
    id: '',
    userId: '',
    nome: '',
    icone: '📁',
    cor: '#6366f1',
    orcamentoMensal: 0,
    ativa: true,
    tipo: 'despesa' // Padrão: despesa
  });

  const iconesSugeridos = ['🍔', '🚗', '🏠', '🎮', '💊', '📚', '💰', '🛒', '✈️', '🎬', '💻', '👕', '🏋️', '🐕', '🎨', '📱'];

  // Effect para carregar dados do usuário
  useEffect(() => {
    setMounted(true);
    
    const user = getCurrentUser();
    if (user) {
      // Carregar categorias e transações do usuário logado
      const userCategorias = getUserCategorias(user.id);
      const userTransactions = getUserTransactions(user.id);
      
      setCategorias(userCategorias);
      setTransactions(userTransactions);
    }
  }, [router]);

  // Calcular gastos e receitas por categoria
  const gastoPorCategoria = useMemo(() => {
    const month = parseInt(selectedMonth);
    const year = anoSelecionado;
    return calculateGastosPorCategoria(transactions, month, year);
  }, [transactions, selectedMonth, anoSelecionado]);

  const receitaPorCategoria = useMemo(() => {
    const month = parseInt(selectedMonth);
    const year = anoSelecionado;
    return calculateReceitasPorCategoria(transactions, month, year);
  }, [transactions, selectedMonth, anoSelecionado]);

  // Calcular resumo geral (apenas categorias de despesa)
  const resumoGeral = useMemo(() => {
    // Filtrar apenas categorias de despesa para o resumo
    const categoriasDespesa = categorias.filter(c => c.tipo === 'despesa');
    
    if (categoriasDespesa.length === 0) {
      return {
        orcamentoTotal: 0,
        gastoTotal: 0,
        saldo: 0,
        categoriasEstouradas: 0
      };
    }

    return calculateCategoriasSummary(categoriasDespesa, gastoPorCategoria);
  }, [categorias, gastoPorCategoria]);

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    if (!mounted) return '0,00';
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Handlers
  const handleOpenModal = (categoria?: Categoria) => {
    if (categoria) {
      setIsEditMode(true);
      setCurrentCategoria(categoria);
    } else {
      setIsEditMode(false);
      const user = getCurrentUser();
      setCurrentCategoria({
        id: '',
        userId: user?.id || '',
        nome: '',
        icone: '📁',
        cor: '#6366f1',
        orcamentoMensal: 0,
        ativa: true,
        tipo: 'despesa' // Padrão: despesa
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    const user = getCurrentUser();
    setCurrentCategoria({
      id: '',
      userId: user?.id || '',
      nome: '',
      icone: '📁',
      cor: '#6366f1',
      orcamentoMensal: 0,
      ativa: true,
      tipo: 'despesa'
    });
  };

  const handleSaveCategoria = () => {
    if (!currentCategoria.nome || currentCategoria.orcamentoMensal < 0) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      alert('Você precisa estar logado para criar categorias');
      return;
    }

    if (isEditMode) {
      // Atualizar categoria existente
      updateCategoriaData(currentCategoria.id, currentCategoria);
      setCategorias(prev => 
        prev.map(c => c.id === currentCategoria.id ? currentCategoria : c)
      );
    } else {
      // Criar nova categoria
      const newCategoria = saveCategoria({
        nome: currentCategoria.nome,
        icone: currentCategoria.icone,
        cor: currentCategoria.cor,
        orcamentoMensal: currentCategoria.orcamentoMensal,
        ativa: currentCategoria.ativa,
        tipo: currentCategoria.tipo
      });
      setCategorias(prev => [...prev, newCategoria]);
    }
    handleCloseModal();
  };

  const handleDeleteCategoria = (id: string) => {
    deleteCategoriaData(id);
    setCategorias(prev => prev.filter(c => c.id !== id));
    setDeleteConfirmId(null);
  };

  const handleToggleAtiva = (id: string) => {
    const categoria = categorias.find(c => c.id === id);
    if (categoria) {
      const updated = { ...categoria, ativa: !categoria.ativa };
      updateCategoriaData(id, updated);
      setCategorias(prev =>
        prev.map(c => c.id === id ? updated : c)
      );
    }
  };

  // Renderizar loading state durante hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a1a] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  // Estado vazio: nenhuma categoria criada
  const hasNoCategorias = categorias.length === 0;
  const user = getCurrentUser();
  const primeiroNome = user?.nome?.split(' ')[0] || 'Usuário';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a1a] to-[#0a0a0f] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/3 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <AppNavbar activePage="categorias" />

      {/* Content */}
      <div className="relative z-10">
        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Título */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Tag className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">Receitas & Despesas</h1>
            </div>
            <p className="text-gray-400">Controle quanto você quer gastar em cada área.</p>
          </div>

          {/* Filtros */}
          <section className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Filtro Mês */}
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-2">Mês</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full bg-[#0f0f17]/80 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none transition-all"
                >
                  <option value="1">Janeiro</option>
                  <option value="2">Fevereiro</option>
                  <option value="3">Março</option>
                  <option value="4">Abril</option>
                  <option value="5">Maio</option>
                  <option value="6">Junho</option>
                  <option value="7">Julho</option>
                  <option value="8">Agosto</option>
                  <option value="9">Setembro</option>
                  <option value="10">Outubro</option>
                  <option value="11">Novembro</option>
                  <option value="12">Dezembro</option>
                </select>
              </div>

              {/* Filtro Ano */}
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-2">Ano</label>
                <select
                  value={anoSelecionado}
                  onChange={(e) => setAnoSelecionado(Number(e.target.value))}
                  className="w-full bg-[#0f0f17]/80 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none transition-all"
                >
                  {anosDisponiveis.map((ano) => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botão Nova Categoria */}
              <div className="flex items-end">
                <button
                  onClick={() => handleOpenModal()}
                  className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                >
                  <Plus className="w-5 h-5" />
                  Nova Categoria
                </button>
              </div>
            </div>
          </section>

          {/* Cards de Resumo */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Orçamento Total</span>
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/30">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">
                R$ {formatCurrency(resumoGeral.orcamentoTotal)}
              </div>
              <div className="text-xs text-gray-400 mt-1">Soma dos orçamentos ativos</div>
            </div>

            <div className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400/30 to-pink-400/30" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Gasto Total</span>
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-400/30 to-pink-400/30">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">
                R$ {formatCurrency(resumoGeral.gastoTotal)}
              </div>
              <div className="text-xs text-gray-400 mt-1">Total gasto no período</div>
            </div>

            <div className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400/30 to-cyan-400/30" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Saldo de Orçamento</span>
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400/30 to-cyan-400/30">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className={`text-3xl font-bold ${resumoGeral.saldo >= 0 ? 'text-white' : 'text-red-400'}`}>
                R$ {formatCurrency(resumoGeral.saldo)}
              </div>
              <div className="text-xs text-gray-400 mt-1">Orçamento - Gasto</div>
            </div>

            <div className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400/30 to-orange-400/30" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Categorias Estouradas</span>
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-400/30 to-orange-400/30">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">{resumoGeral.categoriasEstouradas}</div>
              <div className="text-xs text-gray-400 mt-1">
                {resumoGeral.categoriasEstouradas === 1 ? 'categoria estourada' : 'categorias estouradas'}
              </div>
            </div>
          </section>

          {/* Grid de Categorias ou Estado Vazio */}
          {hasNoCategorias ? (
            <section className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Tag className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Nenhuma categoria criada ainda</h3>
                <p className="text-gray-400 max-w-md">
                  Clique em "Nova Categoria" para começar a organizar seus gastos por categorias e definir orçamentos mensais.
                </p>
                <button
                  onClick={() => handleOpenModal()}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-600 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
                >
                  <Plus className="w-5 h-5" />
                  Criar Primeira Categoria
                </button>
              </div>
            </section>
          ) : (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categorias.map((categoria) => {
                const isReceita = categoria.tipo === 'receita';
                const valor = isReceita 
                  ? receitaPorCategoria[categoria.nome] || 0
                  : gastoPorCategoria[categoria.nome] || 0;
                
                const restante = categoria.orcamentoMensal - valor;
                const percentualUtilizado = categoria.orcamentoMensal > 0 
                  ? (valor / categoria.orcamentoMensal) * 100 
                  : 0;
                const estourado = !isReceita && valor > categoria.orcamentoMensal;

                return (
                  <div
                    key={categoria.id}
                    className={`backdrop-blur-xl bg-[#1a1a24]/60 border rounded-2xl p-6 transition-all relative overflow-hidden ${
                      estourado 
                        ? 'border-red-500/30 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10' 
                        : 'border-white/5 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10'
                    } ${!categoria.ativa ? 'opacity-60' : ''}`}
                  >
                    {/* Accent gradient no topo */}
                    <div 
                      className={`absolute top-0 left-0 right-0 h-1 ${
                        estourado ? 'bg-gradient-to-r from-red-400/50 to-orange-400/50' : 'bg-gradient-to-r from-blue-500/30 to-purple-500/30'
                      }`} 
                    />

                    {/* Header do Card */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                          style={{ backgroundColor: `${categoria.cor}20`, border: `2px solid ${categoria.cor}40` }}
                        >
                          {categoria.icone}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{categoria.nome}</h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            isReceita 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          }`}>
                            {isReceita ? 'Receita' : 'Despesa'}
                          </span>
                          {estourado && (
                            <span className="inline-flex items-center gap-1 text-xs text-red-400 font-medium ml-2">
                              <AlertTriangle className="w-3 h-3" />
                              Estourado
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenModal(categoria)}
                          className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors group"
                        >
                          <Edit2 className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(categoria.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                        </button>
                      </div>
                    </div>

                    {/* Valores */}
                    {isReceita ? (
                      // Categorias de RECEITA: apenas Total Recebido
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Total Recebido</span>
                          <span className="text-lg font-semibold text-green-400">
                            R$ {formatCurrency(valor)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      // Categorias de DESPESA: orçamento, gasto, restante, utilizado
                      <>
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Gasto</span>
                            <span className="text-lg font-semibold text-white">
                              R$ {formatCurrency(valor)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Orçamento</span>
                            <span className="text-lg font-semibold text-white">
                              R$ {formatCurrency(categoria.orcamentoMensal)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Restante</span>
                            <span className={`text-lg font-semibold ${restante >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {restante >= 0 ? 'R$ ' : '− R$ '}{formatCurrency(Math.abs(restante))}
                            </span>
                          </div>
                        </div>

                        {/* Barra de Progresso */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Utilizado</span>
                            <span className={`font-semibold ${estourado ? 'text-red-400' : 'text-purple-400'}`}>
                              {percentualUtilizado.toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-3 bg-[#0f0f17]/80 rounded-full overflow-hidden border border-white/5">
                            <div
                              className={`h-full rounded-full transition-all ${
                                estourado 
                                  ? 'bg-gradient-to-r from-red-500/80 to-orange-500/80' 
                                  : 'bg-gradient-to-r from-blue-500/80 to-purple-600/80'
                              }`}
                              style={{ width: `${Math.min(percentualUtilizado, 100)}%` }}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Toggle Ativa */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <span className="text-sm text-gray-400">Status</span>
                      <button
                        onClick={() => handleToggleAtiva(categoria.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          categoria.ativa ? 'bg-purple-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            categoria.ativa ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </section>
          )}
        </main>
      </div>

      {/* FAB - Floating Action Button */}
      <button
        onClick={() => handleOpenModal()}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-500/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-600 backdrop-blur-xl rounded-full shadow-2xl shadow-purple-500/30 flex items-center justify-center transition-all hover:scale-110 z-50 border border-white/10"
      >
        <Plus className="w-8 h-8 text-white" />
      </button>

      {/* Modal Nova/Editar Categoria */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-[#1a1a24]/95 border border-purple-500/20 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-purple-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {isEditMode ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nome da Categoria *</label>
                <input
                  type="text"
                  value={currentCategoria.nome}
                  onChange={(e) => setCurrentCategoria({
                    ...currentCategoria,
                    nome: e.target.value
                  })}
                  className="w-full bg-[#0f0f17]/80 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none transition-all"
                  placeholder="Ex: Alimentação"
                />
              </div>

              {/* Tipo da Categoria */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tipo da categoria *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipo"
                      value="receita"
                      checked={currentCategoria.tipo === 'receita'}
                      onChange={(e) => setCurrentCategoria({
                        ...currentCategoria,
                        tipo: e.target.value as 'receita' | 'despesa'
                      })}
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-white">Receita</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipo"
                      value="despesa"
                      checked={currentCategoria.tipo === 'despesa'}
                      onChange={(e) => setCurrentCategoria({
                        ...currentCategoria,
                        tipo: e.target.value as 'receita' | 'despesa'
                      })}
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-white">Despesa</span>
                  </label>
                </div>
              </div>

              {/* Orçamento Mensal */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">R$ Orçamento Mensal *</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentCategoria.orcamentoMensal || ''}
                  onChange={(e) => setCurrentCategoria({
                    ...currentCategoria,
                    orcamentoMensal: parseFloat(e.target.value) || 0
                  })}
                  className="w-full bg-[#0f0f17]/80 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none transition-all"
                  placeholder="0.00"
                />
              </div>

              {/* Ícone */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Ícone</label>
                <div className="grid grid-cols-8 gap-2 mb-2">
                  {iconesSugeridos.map((icone, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentCategoria({
                        ...currentCategoria,
                        icone
                      })}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                        currentCategoria.icone === icone
                          ? 'bg-purple-500/30 border-2 border-purple-500/50'
                          : 'bg-[#0f0f17]/80 border border-white/10 hover:bg-white/5'
                      }`}
                    >
                      {icone}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={currentCategoria.icone}
                  onChange={(e) => setCurrentCategoria({
                    ...currentCategoria,
                    icone: e.target.value
                  })}
                  className="w-full bg-[#0f0f17]/80 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none transition-all"
                  placeholder="Ou digite um emoji"
                  maxLength={2}
                />
              </div>

              {/* Cor */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Cor</label>
                <div className="flex gap-2">
                  {['#6366f1', '#8b5cf6', '#a855f7', '#7c3aed', '#6d28d9', '#5b21b6'].map((cor) => (
                    <button
                      key={cor}
                      onClick={() => setCurrentCategoria({
                        ...currentCategoria,
                        cor
                      })}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        currentCategoria.cor === cor
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a24]'
                          : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: cor }}
                    />
                  ))}
                </div>
              </div>

              {/* Toggle Ativa */}
              <div className="flex items-center justify-between pt-2">
                <label className="text-sm text-gray-400">Categoria ativa</label>
                <button
                  onClick={() => setCurrentCategoria({
                    ...currentCategoria,
                    ativa: !currentCategoria.ativa
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    currentCategoria.ativa ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      currentCategoria.ativa ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-medium transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCategoria}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20"
              >
                {isEditMode ? 'Salvar Alterações' : 'Salvar Categoria'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmação de Exclusão */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-[#1a1a24]/95 border border-red-500/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl shadow-red-500/20">
            <h2 className="text-xl font-bold text-white mb-4">Confirmar Exclusão</h2>
            <p className="text-gray-300 mb-6">
              Tem certeza que deseja excluir esta categoria? As transações existentes não serão apagadas, apenas deixarão de exibir esse orçamento.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-medium transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteCategoria(deleteConfirmId)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500/80 to-red-600/80 hover:from-red-500 hover:to-red-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-red-500/20"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
