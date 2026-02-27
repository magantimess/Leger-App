"use client";

import React, { useState, useEffect } from 'react';
import Summary from '@/components/Summary';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import TransactionFilter from '@/components/TransactionFilter';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";

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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'credit' | 'debit'>('all');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      console.log("Fetching transactions from Supabase...");
      const { data, error } = await supabase
        .from('ledger_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase fetch error:", error);
        throw error;
      }

      console.log("Fetched data:", data);

      const formattedData: Transaction[] = (data || []).map(item => ({
        id: item.id,
        description: item.description,
        amount: Number(item.amount),
        type: item.type as 'credit' | 'debit',
        date: item.created_at
      }));

      setTransactions(formattedData);
    } catch (error: any) {
      showError("Failed to load entries: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const addTransaction = async (data: Omit<Transaction, 'id' | 'date'>) => {
    try {
      console.log("Adding transaction to Supabase:", data);
      const { data: newEntry, error } = await supabase
        .from('ledger_entries')
        .insert([{
          description: data.description,
          amount: data.amount,
          type: data.type
        }])
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      console.log("Inserted entry:", newEntry);

      const formattedEntry: Transaction = {
        id: newEntry.id,
        description: newEntry.description,
        amount: Number(newEntry.amount),
        type: newEntry.type as 'credit' | 'debit',
        date: newEntry.created_at
      };

      setTransactions(prev => [formattedEntry, ...prev]);
      showSuccess("Entry saved to database!");
    } catch (error: any) {
      showError("Failed to add entry: " + (error.message || "Unknown error"));
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      console.log("Deleting transaction from Supabase:", id);
      const { error } = await supabase
        .from('ledger_entries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Supabase delete error:", error);
        throw error;
      }

      setTransactions(prev => prev.filter(t => t.id !== id));
      showSuccess("Entry deleted from database");
    } catch (error: any) {
      showError("Failed to delete entry: " + (error.message || "Unknown error"));
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
        <header className="text-center mb-12">
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
          <div className="space-y-2">
            {typeFilter !== 'all' && (
              <p className="text-sm font-medium text-indigo-600 animate-in fade-in slide-in-from-left-2">
                Showing only {typeFilter} entries
              </p>
            )}
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading entries from database...</div>
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