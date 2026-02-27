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
import { RefreshCw, WifiOff, Database } from "lucide-react";
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
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'credit' | 'debit'>('all');

  const loadLocalData = () => {
    const localData = localStorage.getItem('ledger_entries');
    if (localData) {
      setTransactions(JSON.parse(localData));
    }
    setIsLocalMode(true);
  };

  const saveLocalData = (data: Transaction[]) => {
    localStorage.setItem('ledger_entries', JSON.stringify(data));
    setTransactions(data);
  };

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Attempting to fetch from Supabase...");
      
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
      setIsLocalMode(false);
      console.log("Connected to Supabase successfully.");
    } catch (err: any) {
      console.warn("Supabase connection failed, falling back to local storage:", err.message);
      loadLocalData();
      if (err.message === 'Failed to fetch') {
        showError("Network timeout. Using Local Storage mode.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (data: Omit<Transaction, 'id' | 'date'>) => {
    if (isLocalMode) {
      const newEntry: Transaction = {
        ...data,
        id: crypto.randomUUID(),
        date: new Date().toISOString()
      };
      const updated = [newEntry, ...transactions];
      saveLocalData(updated);
      showSuccess("Entry saved locally!");
      return;
    }

    try {
      const { data: newEntry, error: insertError } = await supabase
        .from('ledger_entries')
        .insert([{
          description: data.description,
          amount: data.amount,
          type: data.type
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      const formattedEntry: Transaction = {
        id: newEntry.id,
        description: newEntry.description,
        amount: Number(newEntry.amount),
        type: newEntry.type as 'credit' | 'debit',
        date: newEntry.created_at
      };

      setTransactions(prev => [formattedEntry, ...prev]);
      showSuccess("Entry saved to database!");
    } catch (err: any) {
      showError("Failed to add entry: " + err.message);
      // If it fails, offer to save locally
      setIsLocalMode(true);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (isLocalMode) {
      const updated = transactions.filter(t => t.id !== id);
      saveLocalData(updated);
      showSuccess("Entry deleted locally");
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('ledger_entries')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setTransactions(prev => prev.filter(t => t.id !== id));
      showSuccess("Entry deleted from database");
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
            {isLocalMode ? (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1 px-3 py-1">
                <WifiOff size={14} />
                Local Mode
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1 px-3 py-1">
                <Database size={14} />
                Connected
              </Badge>
            )}
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            Daily <span className="text-indigo-600">Ledger</span>
          </h1>
          <p className="text-lg text-gray-500">Manage your daily finances in INR with precise timestamps.</p>
        </header>

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
              <div className="flex flex-col gap-1">
                {typeFilter !== 'all' && (
                  <p className="text-sm font-medium text-indigo-600">
                    Showing only {typeFilter} entries
                  </p>
                )}
                {isLocalMode && (
                  <p className="text-xs text-amber-600 font-medium">
                    Data is being saved to your browser locally.
                  </p>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchTransactions} 
                disabled={loading}
                className="ml-auto rounded-full"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {isLocalMode ? 'Retry Connection' : 'Refresh'}
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400">
                <RefreshCw className="mx-auto h-8 w-8 animate-spin mb-4 text-indigo-400" />
                <p>Checking connection...</p>
              </div>
            ) : (
              <TransactionList transactions={filteredTransactions} onDelete={deleteTransaction} />
            )}
          </div>
        </div>

        <footer className="mt-16">
          <MadeWithDyad />
        </footer>
      </div>
    </div>
  );
};

export default Index;