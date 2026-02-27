"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Summary from '@/components/Summary';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import TransactionFilter from '@/components/TransactionFilter';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, Zap, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
}

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'credit' | 'debit'>('all');

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('ledger_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;

      const formattedData: Transaction[] = (data || []).map(item => ({
        id: item.id,
        description: item.description,
        amount: Number(item.amount),
        type: item.type as 'credit' | 'debit',
        date: item.created_at
      }));

      setTransactions(formattedData);
    } catch (err: any) {
      console.error("Supabase Connection Error:", err);
      setError(err.message);
      showError("Failed to connect to Supabase: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (data: Omit<Transaction, 'id' | 'date'>) => {
    try {
      const { data: newEntry, error: supabaseError } = await supabase
        .from('ledger_entries')
        .insert([{
          description: data.description,
          amount: data.amount,
          type: data.type
        }])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      const formattedEntry: Transaction = {
        id: newEntry.id,
        description: newEntry.description,
        amount: Number(newEntry.amount),
        type: newEntry.type as 'credit' | 'debit',
        date: newEntry.created_at
      };

      setTransactions(prev => [formattedEntry, ...prev]);
      showSuccess("Entry saved to Supabase!");
    } catch (err: any) {
      showError("Failed to add entry: " + err.message);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error: supabaseError } = await supabase
        .from('ledger_entries')
        .delete()
        .eq('id', id);

      if (supabaseError) throw supabaseError;

      setTransactions(prev => prev.filter(t => t.id !== id));
      showSuccess("Entry deleted from Supabase");
    } catch (err: any) {
      showError("Failed to delete entry: " + err.message);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date).setHours(0, 0, 0, 0);
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : -Infinity;
    const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Infinity;
    const matchesDate = transactionDate >= start && transactionDate <= end;
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    
    return matchesDate && matchesType;
  });

  const dateFilteredOnly = transactions.filter(t => {
    const transactionDate = new Date(t.date).setHours(0, 0, 0, 0);
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : -Infinity;
    const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Infinity;
    return transactionDate >= start && transactionDate <= end;
  });

  const totalCredit = dateFilteredOnly
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebit = dateFilteredOnly
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12 relative">
          <div className="absolute top-0 right-0">
            <Badge variant="outline" className={`${error ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'} flex items-center gap-1 px-3 py-1`}>
              <Zap size={14} />
              {error ? 'Disconnected' : 'Supabase Live'}
            </Badge>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            Daily <span className="text-indigo-600">Ledger</span>
          </h1>
          <p className="text-lg text-gray-500">Real-time financial tracking powered by Supabase.</p>
        </header>

        {error ? (
          <div className="bg-white border-2 border-rose-100 rounded-3xl p-10 shadow-xl text-center mb-8">
            <div className="bg-rose-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Database className="text-rose-500" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Supabase Connection Issue</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {error}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left max-w-lg mx-auto">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-1">
                  <ShieldCheck size={16} />
                  <span>Check RLS</span>
                </div>
                <p className="text-xs text-gray-500">Ensure Row Level Security policies allow access to the table.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-1">
                  <Database size={16} />
                  <span>Table Status</span>
                </div>
                <p className="text-xs text-gray-500">Ensure the 'ledger_entries' table exists in your public schema.</p>
              </div>
            </div>
            <Button 
              onClick={fetchTransactions} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 rounded-2xl text-lg font-semibold transition-all"
            >
              <RefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={20} />
              Retry Connection
            </Button>
          </div>
        ) : (
          <>
            <Summary 
              totalCredit={totalCredit} 
              totalDebit={totalDebit} 
              activeFilter={typeFilter}
              onFilterChange={setTypeFilter}
            />
            
            <div className="grid grid-cols-1 gap-8">
              <TransactionForm onAdd={addTransaction} />
              <TransactionFilter 
                startDate={startDate} 
                endDate={endDate} 
                onStartDateChange={setStartDate} 
                onEndDateChange={setEndDate} 
              />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {typeFilter !== 'all' && (
                    <p className="text-sm font-medium text-indigo-600">
                      Showing only {typeFilter} entries
                    </p>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchTransactions} 
                    disabled={loading}
                    className="ml-auto rounded-full"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center py-12 text-gray-400">
                    <RefreshCw className="mx-auto h-8 w-8 animate-spin mb-4 text-indigo-400" />
                    <p>Syncing with Supabase...</p>
                  </div>
                ) : (
                  <TransactionList transactions={filteredTransactions} onDelete={deleteTransaction} />
                )}
              </div>
            </div>
          </>
        )}

        <footer className="mt-16">
          <MadeWithDyad />
        </footer>
      </div>
    </div>
  );
};

export default Index;