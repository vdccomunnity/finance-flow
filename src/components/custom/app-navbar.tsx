'use client';

import { 
  DollarSign, 
  LogOut, 
  LayoutDashboard, 
  Tag, 
  Target, 
  Lightbulb, 
  Settings,
  Receipt
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, logout } from '@/lib/auth';
import { useState, useEffect } from 'react';

export default function AppNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserName(user.nome.split(' ')[0]);
    }
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Transações", icon: Receipt, href: "/transacoes" },
    { name: "Categorias", icon: Tag, href: "/categorias" },
    { name: "Metas", icon: Target, href: "/metas" },
    { name: "Insights", icon: Lightbulb, href: "/insights" },
    { name: "Configurações", icon: Settings, href: "/configuracoes" }
  ];

  return (
    <nav className="backdrop-blur-xl bg-[#1a1a24]/60 border-b border-white/5 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/80 to-purple-600/80 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              FinanceFlow
            </span>
          </Link>

          {/* Menu de Navegação */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-purple-500/30 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Saudação + Botão Sair */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-gray-400">
              Olá, <span className="font-semibold text-white">{userName || 'Usuário'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 transition-all text-red-400 hover:text-red-300"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Sair</span>
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        <div className="lg:hidden mt-4 flex flex-wrap gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-purple-500/30 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
