'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Receipt
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { 
  getUserTransactions, 
  getUserCategorias,
  saveTransaction, 
  updateTransaction as updateTransactionData,
  deleteTransaction as deleteTransactionData,
  type Transaction 
} from '@/lib/user-data';
import { useRouter } from 'next/navigation';
import { EmptyState } from '@/components/custom/empty-state';
import AppNavbar from '@/components/custom/app-navbar';
import { updateCategoria } from '@/lib/user-data';

export default function TransacoesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [currentTransaction, setCurrentTransaction] = useState<Partial<Transaction>>({
    tipo: 'receita',
    categoria: '',
    descricao: '',
    valor: 0,
    data: ''
  });

  // Gerar anos de 2021 a 2031 (5 anos pra trás e 5 pra frente de 2026)
  const years = Array.from({ length: 11 }, (_, i) => 2021 + i);

  useEffect(() => {
    setMounted(true);
    
    const user = getCurrentUser();
    if (user) {
      loadTransactions();
      loadCategorias();
    }
    
    // Define mês/ano atual
    const hoje = new Date();
    const currentYear = hoje.getFullYear();
    setSelectedMonth((hoje.getMonth() + 1).toString());
    setSelectedYear(currentYear.toString());
  }, [router]);

  const loadTransactions = () => {
    const user = getCurrentUser();
    if (user) {
      const userTransactions = getUserTransactions(user.id);
      setTransactions(userTransactions);
    }
  };

  const loadCategorias = () => {
    const user = getCurrentUser();
    if (user) {
      const userCategorias = getUserCategorias(user.id);
      setCategorias(userCategorias);
    }
  };

  // Filtrar categorias com base no tipo de transação selecionado
  const categoriasFiltradas = useMemo(() => {
    if (!currentTransaction.tipo) return categorias;
    
    // Se tipo = 'receita', mostrar apenas categorias de receita
    // Se tipo = 'despesa', mostrar apenas categorias de despesa
    return categorias.filter(cat => cat.tipo === currentTransaction.tipo);
  }, [categorias, currentTransaction.tipo]);

  // Filtrar transações - SEMPRE usa dados reais
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const transactionDate = new Date(t.data);
        const matchesMonth = (transactionDate.getMonth() + 1).toString() === selectedMonth;
        const matchesYear = transactionDate.getFullYear().toString() === selectedYear;
        const matchesSearch = t.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.categoria.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesMonth && matchesYear && matchesSearch;
      })
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [transactions, selectedMonth, selectedYear, searchTerm]);

  // Calcular resumo - SEMPRE R$ 0,00 se não houver dados
  const summary = useMemo(() => {
    const receitas = filteredTransactions
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + t.valor, 0);
    
    const despesas = filteredTransactions
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + t.valor, 0);
    
    return {
      receitas,
      despesas,
      saldo: receitas - despesas,
      quantidade: filteredTransactions.length
    };
  }, [filteredTransactions]);

  const formatCurrency = (value: number) => {
    if (!mounted) return '0,00';
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateString: string) => {
    if (!mounted) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleOpenModal = (transaction?: Transaction) => {
    if (transaction) {
      setIsEditMode(true);
      setCurrentTransaction(transaction);
    } else {
      setIsEditMode(false);
      const today = new Date();
      const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      setCurrentTransaction({
        tipo: 'receita',
        categoria: '',
        descricao: '',
        valor: 0,
        data: dateString
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    const today = new Date();
    const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setCurrentTransaction({
      tipo: 'receita',
      categoria: '',
      descricao: '',
      valor: 0,
      data: dateString
    });
  };

  const handleSaveTransaction = () => {
    if (!currentTransaction.categoria || !currentTransaction.valor || !currentTransaction.data) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (isEditMode && currentTransaction.id) {
        // Edição: atualizar orçamento da categoria
        const oldTransaction = transactions.find(t => t.id === currentTransaction.id);
        if (oldTransaction && oldTransaction.tipo === 'despesa') {
          const categoria = categorias.find(c => c.nome === oldTransaction.categoria);
          if (categoria) {
            // Devolve o valor antigo
            const novoOrcamento = categoria.orcamentoMensal + oldTransaction.valor;
            updateCategoria(categoria.id, { orcamentoMensal: novoOrcamento });
          }
        }

        updateTransactionData(currentTransaction.id, currentTransaction as Transaction);

        // Desconta o novo valor se for despesa
        if (currentTransaction.tipo === 'despesa') {
          const categoria = categorias.find(c => c.nome === currentTransaction.categoria);
          if (categoria) {
            const novoOrcamento = categoria.orcamentoMensal - currentTransaction.valor;
            updateCategoria(categoria.id, { orcamentoMensal: novoOrcamento });
          }
        }
      } else {
        // Nova transação
        saveTransaction(currentTransaction as Omit<Transaction, 'id' | 'userId'>);

        // Se for despesa, atualizar orçamento da categoria
        if (currentTransaction.tipo === 'despesa') {
          const categoria = categorias.find(c => c.nome === currentTransaction.categoria);
          if (categoria) {
            const novoOrcamento = categoria.orcamentoMensal - currentTransaction.valor;
            updateCategoria(categoria.id, { orcamentoMensal: novoOrcamento });
          }
        }
      }
      loadTransactions();
      loadCategorias();
      handleCloseModal();
    } catch (error) {
      alert('Erro ao salvar transação');
    }
  };

  const handleDeleteTransaction = (id: string) => {
    // Devolve o valor ao orçamento da categoria se for despesa
    const transaction = transactions.find(t => t.id === id);
    if (transaction && transaction.tipo === 'despesa') {
      const categoria = categorias.find(c => c.nome === transaction.categoria);
      if (categoria) {
        const novoOrcamento = categoria.orcamentoMensal + transaction.valor;
        updateCategoria(categoria.id, { orcamentoMensal: novoOrcamento });
      }
    }

    deleteTransactionData(id);
    loadTransactions();
    loadCategorias();
    setDeleteConfirmId(null);
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
      <AppNavbar activeItem="Transações" />

      {/* Content */}
      <div className="relative z-10">
        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Título */}
          <div className="flex items-center gap-3">
            <Receipt className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Transações</h1>
          </div>

          {/* Cards de Resumo - SEMPRE mostra R$ 0,00 se não houver dados */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400/30 to-cyan-400/30" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Total de Receitas</span>
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400/30 to-cyan-400/30">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">
                R$ {formatCurrency(summary.receitas)}
              </div>
            </div>

            <div className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400/30 to-pink-400/30" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Total de Despesas</span>
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-400/30 to-pink-400/30">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">
                R$ {formatCurrency(summary.despesas)}
              </div>
            </div>

            <div className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Saldo do Mês</span>
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/30">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className={`text-3xl font-bold ${summary.saldo >= 0 ? 'text-white' : 'text-red-400'}`}>
                R$ {formatCurrency(summary.saldo)}
              </div>
            </div>

            <div className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400/30 to-purple-400/30" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Total de Transações</span>
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-400/30 to-purple-400/30">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">{summary.quantidade}</div>
            </div>
          </section>

          {/* Filtros */}
          <section className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 flex flex-col sm:flex-row gap-4">
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
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full bg-[#0f0f17]/80 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none transition-all"
                  >
                    {years.map(year => (
                      <option key={year} value={year.toString()}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Campo de Busca */}
                <div className="flex-1 lg:flex-[2]">
                  <label className="block text-sm text-gray-400 mb-2">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por descrição ou categoria..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#0f0f17]/80 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Botão Nova Transação */}
              <div className="flex items-end">
                <button
                  onClick={() => handleOpenModal()}
                  className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                >
                  <Plus className="w-5 h-5" />
                  Nova Transação
                </button>
              </div>
            </div>
          </section>

          {/* Tabela de Transações ou Estado Vazio */}
          <section className="backdrop-blur-xl bg-[#1a1a24]/60 border border-white/5 rounded-2xl overflow-hidden">
            {filteredTransactions.length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Data</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Tipo</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Categoria</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Descrição</th>
                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-400">Valor</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-400">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {formatDate(transaction.data)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                              transaction.tipo === 'receita'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {transaction.tipo === 'receita' ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {transaction.tipo === 'receita' ? 'Receita' : 'Despesa'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">{transaction.categoria}</td>
                          <td className="px-6 py-4 text-sm text-gray-300">{transaction.descricao}</td>
                          <td className={`px-6 py-4 text-sm font-semibold text-right ${
                            transaction.tipo === 'receita' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.tipo === 'receita' ? '+' : '−'} R$ {formatCurrency(transaction.valor)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenModal(transaction)}
                                className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors group"
                              >
                                <Edit2 className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(transaction.id)}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                              >
                                <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile List */}
                <div className="md:hidden divide-y divide-white/5">
                  {filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="p-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-medium text-white mb-1">{transaction.descricao}</div>
                          <div className="text-sm text-gray-400">{transaction.categoria}</div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.tipo === 'receita'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {transaction.tipo === 'receita' ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {transaction.tipo === 'receita' ? 'Receita' : 'Despesa'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          {formatDate(transaction.data)}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`text-lg font-semibold ${
                            transaction.tipo === 'receita' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.tipo === 'receita' ? '+' : '−'} R$ {formatCurrency(transaction.valor)}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleOpenModal(transaction)}
                              className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4 text-gray-400" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(transaction.id)}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                icon={Receipt}
                title="Nenhuma transação cadastrada"
                description="Comece adicionando sua primeira transação para acompanhar suas finanças."
                action={{
                  label: "Nova Transação",
                  onClick: () => handleOpenModal()
                }}
              />
            )}
          </section>
        </main>
      </div>

      {/* FAB - Floating Action Button */}
      <button
        onClick={() => handleOpenModal()}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-500/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-600 backdrop-blur-xl rounded-full shadow-2xl shadow-purple-500/30 flex items-center justify-center transition-all hover:scale-110 z-50 border border-white/10"
      >
        <Plus className="w-8 h-8 text-white" />
      </button>

      {/* Modal Nova/Editar Transação */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-[#1a1a24]/95 border border-purple-500/20 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-purple-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {isEditMode ? 'Editar Transação' : 'Nova Transação'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Tipo */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tipo *</label>
                <select
                  value={currentTransaction.tipo}
                  onChange={(e) => setCurrentTransaction({
                    ...currentTransaction,
                    tipo: e.target.value as 'receita' | 'despesa',
                    categoria: '' // Resetar categoria ao mudar tipo
                  })}
                  className="w-full bg-[#0f0f17]/80 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none transition-all"
                >
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </select>
              </div>

              {/* Categoria - FILTRADA pelo tipo */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Categoria *</label>
                <select
                  value={currentTransaction.categoria}
                  onChange={(e) => setCurrentTransaction({
                    ...currentTransaction,
                    categoria: e.target.value
                  })}
                  className="w-full bg-[#0f0f17]/80 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none transition-all"
                >
                  <option value="">Selecione uma categoria</option>
                  {categoriasFiltradas.map((cat) => (
                    <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                  ))}
                </select>
              </div>

              {/* Valor */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">R$ Valor *</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentTransaction.valor || ''}
                  onChange={(e) => setCurrentTransaction({
                    ...currentTransaction,
                    valor: parseFloat(e.target.value) || 0
                  })}
                  className="w-full bg-[#0f0f17]/80 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none transition-all"
                  placeholder="0.00"
                />
              </div>

              {/* Data */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Data *</label>
                <input
                  type="date"
                  value={currentTransaction.data}
                  onChange={(e) => setCurrentTransaction({
                    ...currentTransaction,
                    data: e.target.value
                  })}
                  className="w-full bg-[#0f0f17]/80 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none transition-all"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Descrição</label>
                <input
                  type="text"
                  value={currentTransaction.descricao}
                  onChange={(e) => setCurrentTransaction({
                    ...currentTransaction,
                    descricao: e.target.value
                  })}
                  className="w-full bg-[#0f0f17]/80 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500/50 focus:outline-none transition-all"
                  placeholder="Descrição da transação"
                />
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
                onClick={handleSaveTransaction}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20"
              >
                {isEditMode ? 'Salvar Alterações' : 'Salvar Transação'}
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
              Você realmente deseja excluir esta transação?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-medium transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteTransaction(deleteConfirmId)}
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
