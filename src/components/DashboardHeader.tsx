'use client';

import { DollarSign, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout } from '@/lib/auth';
import { useState, useEffect } from 'react';

export default function DashboardHeader() {
  const router = useRouter();
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

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/80 to-purple-600/80 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <DollarSign className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          FinanceFlow
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-gray-400">
          Olá, <span className="font-semibold text-white">{userName || '!'}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 transition-all text-red-400 hover:text-red-300"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
}