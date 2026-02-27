"use client";

import React, { useState, useEffect } from 'react';
import Summary from '@/components/Summary';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import { MadeWithDyad } from "@/components/made-with-dyad";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
}

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load from localStorage for now (will be replaced by Supabase)
  useEffect(() => {
    const saved = localStorage.getItem('ledger_entries');
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ledger_entries', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (data: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
    };
    setTransactions([...transactions, newTransaction]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const totalCredit = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebit = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            Daily <span className="text-indigo-600">Ledger</span>
          </h1>
          <p className="text-lg text-gray-500">Keep track of your daily finances with ease.</p>
        </header>

        <Summary totalCredit={totalCredit} totalDebit={totalDebit} />
        
        <div className="grid grid-cols-1 gap-8">
          <TransactionForm onAdd={addTransaction} />
          <TransactionList transactions={transactions} onDelete={deleteTransaction} />
        </div>

        <footer className="mt-16">
          <MadeWithDyad />
        </footer>
      </div>
    </div>
  );
};

export default Index;