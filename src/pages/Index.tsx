"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Summary from '@/components/Summary';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import TransactionFilter from '@/components/TransactionFilter';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ThemeToggle } from "@/components/ThemeToggle";
import { showError, showSuccess } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, LogOut, User as UserIcon, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/components/AuthProvider';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
}

const Index = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'credit' | 'debit'>('all');

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "ledger_entries"), orderBy("date", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        
        let dateString = new Date().toISOString();
        if (docData.date instanceof Timestamp) {
          dateString = docData.date.toDate().toISOString();
        } else if (docData.date?.seconds) {
          dateString = new Date(docData.date.seconds * 1000).toISOString();
        } else if (typeof docData.date === 'string') {
          dateString = docData.date;
        }

        return {
          id: doc.id,
          description: docData.description || 'No description',
          amount: Number(docData.amount) || 0,
          type: docData.type || 'debit',
          date: dateString
        };
      }) as Transaction[];
      
      setTransactions(data);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Sync Error:", error);
      showError("Database sync failed. Please check your connection.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addTransaction = async (formData: { description: string; amount: number; type: 'credit' | 'debit' }) => {
    if (!user) return;

    try {
      await addDoc(collection(db, "ledger_entries"), {
        ...formData,
        createdBy: user.username,
        userId: user.id,
        date: Timestamp.now()
      });
      showSuccess("Entry added to ledger!");
    } catch (err: any) {
      showError("Failed to save entry: " + err.message);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await deleteDoc(doc(db, "ledger_entries", id));
      showSuccess("Entry removed from ledger.");
    } catch (err: any) {
      showError("Delete failed: " + err.message);
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
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-2xl shadow-sm border border-border">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-xl">
              <UserIcon className="text-indigo-600 dark:text-indigo-400" size={18} />
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground font-medium">Logged in as</p>
              <p className="text-sm font-bold text-foreground truncate max-w-[150px]">
                {user?.displayName || user?.username}
              </p>
            </div>
            {role === 'admin' && (
              <Badge className="bg-indigo-600 text-white border-none ml-2">Admin</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <ThemeToggle />
            {role === 'admin' && (
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin')}
                className="flex-1 sm:flex-none rounded-2xl border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
              >
                <ShieldCheck className="mr-2" size={18} />
                Admin Panel
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={signOut}
              className="flex-1 sm:flex-none rounded-2xl border-border hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 transition-all"
            >
              <LogOut className="mr-2" size={18} />
              Logout
            </Button>
          </div>
        </div>

        <header className="text-center mb-12 relative">
          <div className="mx-auto mb-6 flex justify-center">
            <img 
              src="https://wskwblytqmyjqcgsxeky.supabase.co/storage/v1/object/public/project_assets/maganti_logo.png" 
              alt="MagantiMess Logo" 
              className="w-24 h-24 object-contain rounded-full shadow-md border-2 border-indigo-500/10"
            />
          </div>
          <div className="absolute top-0 right-0 hidden md:block">
            <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 flex items-center gap-1 px-3 py-1">
              <Database size={14} />
              Live Ledger
            </Badge>
          </div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">
            MagantiMess <span className="text-indigo-600">Ledger</span>
          </h1>
          <p className="text-lg text-muted-foreground">Secure financial tracking for your organization.</p>
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
              <h2 className="text-xl font-bold text-foreground">Transactions</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={loading}
                className="rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Live Sync
              </Button>
            </div>

            {loading && transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-card rounded-3xl border border-dashed border-border">
                <RefreshCw className="mx-auto h-8 w-8 animate-spin mb-4 text-indigo-400" />
                <p>Connecting to ledger_entries...</p>
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