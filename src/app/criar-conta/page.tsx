'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { DollarSign, Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  createUser, 
  setCurrentUser, 
  validateEmail, 
  validatePassword, 
  validateName
} from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function CriarContaPage() {
  const router = useRouter();
  const { login: setAuthUser } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Validação em tempo real
  const validateField = (field: string, value: string) => {
    const errors = { ...fieldErrors };

    switch (field) {
      case 'nome':
        errors.nome = !validateName(value) ? 'Nome não pode estar vazio' : '';
        break;
      case 'email':
        if (!value) {
          errors.email = 'E-mail não pode estar vazio';
        } else if (!validateEmail(value)) {
          errors.email = 'E-mail inválido';
        } else {
          errors.email = '';
        }
        break;
      case 'senha':
        if (!value) {
          errors.senha = 'Senha não pode estar vazia';
        } else if (!validatePassword(value)) {
          errors.senha = 'Senha deve ter pelo menos 6 caracteres';
        } else {
          errors.senha = '';
        }
        // Revalidar confirmar senha se já foi preenchida
        if (confirmarSenha) {
          errors.confirmarSenha = value !== confirmarSenha ? 'As senhas não coincidem' : '';
        }
        break;
      case 'confirmarSenha':
        errors.confirmarSenha = value !== senha ? 'As senhas não coincidem' : '';
        break;
    }

    setFieldErrors(errors);
  };

  const isFormValid = () => {
    return (
      validateName(nome) &&
      validateEmail(email) &&
      validatePassword(senha) &&
      senha === confirmarSenha &&
      !Object.values(fieldErrors).some(error => error !== '')
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validar todos os campos
    if (!validateName(nome)) {
      setError('Por favor, preencha seu nome completo');
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError('Por favor, insira um e-mail válido');
      setIsLoading(false);
      return;
    }

    if (!validatePassword(senha)) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    try {
      // Criar usuário com statusAssinatura: "nao_assinou" e plano: null
      const newUser = await createUser(nome, email, senha, {
        statusAssinatura: 'nao_assinou',
        plano: null,
        isPremium: false
      });
      
      // Autenticar automaticamente
      setCurrentUser(newUser);
      setAuthUser(newUser);
      
      // Mostrar mensagem de sucesso
      setShowSuccess(true);
      
      // Redirecionar para /acesso após 1.5 segundos
      setTimeout(() => {
        window.location.href = '/acesso';
      }, 1500);
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a1a] to-[#0a0a0f] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/3 rounded-full blur-3xl" />
      </div>

      {/* Toast de Sucesso */}
      {showSuccess && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
          <div className="backdrop-blur-xl bg-green-500/20 border border-green-500/50 rounded-xl px-6 py-4 shadow-2xl shadow-green-500/20 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <p className="text-white font-medium">
              Conta criada com sucesso! Redirecionando para escolha de plano...
            </p>
          </div>
        </div>
      )}

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

        {/* Card de Cadastro Centralizado */}
        <main className="container mx-auto px-4 py-8 md:py-12 flex items-center justify-center min-h-[calc(100vh-120px)]">
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
                  Criar sua conta
                </h1>
                <p className="text-gray-400 text-sm">
                  Leva menos de 1 minuto para começar a organizar sua vida financeira.
                </p>
              </div>

              {/* Formulário */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Campo Nome */}
                <div className="space-y-2">
                  <label htmlFor="nome" className="text-sm font-medium text-gray-300 block">
                    Nome completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="nome"
                      type="text"
                      value={nome}
                      onChange={(e) => {
                        setNome(e.target.value);
                        validateField('nome', e.target.value);
                      }}
                      onBlur={(e) => validateField('nome', e.target.value)}
                      placeholder="Seu nome completo"
                      className={`w-full bg-[#0f0f17]/80 border ${
                        fieldErrors.nome ? 'border-red-500/50' : 'border-white/10'
                      } rounded-xl px-11 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all`}
                    />
                  </div>
                  {fieldErrors.nome && (
                    <p className="text-xs text-red-400 mt-1">{fieldErrors.nome}</p>
                  )}
                </div>

                {/* Campo Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-300 block">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        validateField('email', e.target.value);
                      }}
                      onBlur={(e) => validateField('email', e.target.value)}
                      placeholder="seu@email.com"
                      className={`w-full bg-[#0f0f17]/80 border ${
                        fieldErrors.email ? 'border-red-500/50' : 'border-white/10'
                      } rounded-xl px-11 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Campo Senha */}
                <div className="space-y-2">
                  <label htmlFor="senha" className="text-sm font-medium text-gray-300 block">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="senha"
                      type="password"
                      value={senha}
                      onChange={(e) => {
                        setSenha(e.target.value);
                        validateField('senha', e.target.value);
                      }}
                      onBlur={(e) => validateField('senha', e.target.value)}
                      placeholder="••••••••"
                      className={`w-full bg-[#0f0f17]/80 border ${
                        fieldErrors.senha ? 'border-red-500/50' : 'border-white/10'
                      } rounded-xl px-11 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all`}
                    />
                  </div>
                  {fieldErrors.senha && (
                    <p className="text-xs text-red-400 mt-1">{fieldErrors.senha}</p>
                  )}
                  {!fieldErrors.senha && (
                    <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
                  )}
                </div>

                {/* Campo Confirmar Senha */}
                <div className="space-y-2">
                  <label htmlFor="confirmarSenha" className="text-sm font-medium text-gray-300 block">
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="confirmarSenha"
                      type="password"
                      value={confirmarSenha}
                      onChange={(e) => {
                        setConfirmarSenha(e.target.value);
                        validateField('confirmarSenha', e.target.value);
                      }}
                      onBlur={(e) => validateField('confirmarSenha', e.target.value)}
                      placeholder="••••••••"
                      className={`w-full bg-[#0f0f17]/80 border ${
                        fieldErrors.confirmarSenha ? 'border-red-500/50' : 'border-white/10'
                      } rounded-xl px-11 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all`}
                    />
                  </div>
                  {fieldErrors.confirmarSenha && (
                    <p className="text-xs text-red-400 mt-1">{fieldErrors.confirmarSenha}</p>
                  )}
                </div>

                {/* Termos de Uso */}
                <div className="pt-2">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Ao criar sua conta, você concorda com nossos{' '}
                    <Link href="/termos" className="text-purple-400 hover:text-purple-300 transition-colors">
                      Termos de Uso
                    </Link>
                    {' '}e{' '}
                    <Link href="/privacidade" className="text-purple-400 hover:text-purple-300 transition-colors">
                      Política de Privacidade
                    </Link>
                    .
                  </p>
                </div>

                {/* Mensagem de erro geral */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                {/* Botão Criar Conta */}
                <Button
                  type="submit"
                  disabled={!isFormValid() || isLoading}
                  className={`w-full py-6 rounded-xl font-semibold shadow-lg transition-all ${
                    !isFormValid() || isLoading
                      ? 'bg-gray-600 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-purple-500/25 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/30'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Criando conta...
                    </span>
                  ) : (
                    <>
                      Criar conta
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>

              {/* Rodapé do card */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  Já tem uma conta?{' '}
                  <Link 
                    href="/login"
                    className="text-purple-400 hover:text-purple-300 font-medium transition-all hover:scale-105 inline-block"
                  >
                    Entrar
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
