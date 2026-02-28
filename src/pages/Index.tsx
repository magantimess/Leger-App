"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Summary from '@/components/Summary';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import TransactionFilter from '@/components/TransactionFilter';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { mongoClient, isMongoConfigured } from "@/lib/mongodb";
import { showError, showSuccess } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, AlertCircle, Settings, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
      
      if (!isMongoConfigured()) {
        throw new Error("MongoDB is not configured. Please update src/lib/mongodb.ts with your Atlas Data API credentials.");
      }

      const documents = await mongoClient.find();
      
      const formattedData: Transaction[] = (documents || []).map((doc: any) => ({
        id: doc._id,
        description: doc.description,
        amount: doc.amount,
        type: doc.type,
        date: doc.created_at
      }));

      setTransactions(formattedData);
    } catch (err: any) {
      console.error("MongoDB Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (formData: { description: string; amount: number; type: 'credit' | 'debit' }) => {
    try {
      const insertedId = await mongoClient.insertOne(formData);

      const newEntry: Transaction = {
        id: insertedId,
        description: formData.description,
        amount: formData.amount,
        type: formData.type,
        date: new Date().toISOString()
      };

      setTransactions(prev => [newEntry, ...prev]);
      showSuccess("Entry saved to MongoDB!");
    } catch (err: any) {
      showError("MongoDB Error: " + err.message);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await mongoClient.deleteOne(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      showSuccess("Entry removed.");
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
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12 relative">
          <div className="absolute top-0 right-0">
            <Badge variant="outline" className={`${error ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-green-50 text-green-700 border-green-200'} flex items-center gap-1 px-3 py-1`}>
              <Server size={14} />
              {error ? 'Config Required' : 'MongoDB Atlas Active'}
            </Badge>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            Daily <span className="text-indigo-600">Ledger</span>
          </h1>
          <p className="text-lg text-gray-500">NoSQL financial tracking powered by MongoDB Atlas.</p>
        </header>

        {error && error.includes("MongoDB is not configured") && (
          <Alert className="mb-8 bg-green-50 border-green-200 text-green-900 rounded-2xl">
            <Settings className="h-5 w-5" />
            <AlertTitle className="font-bold">MongoDB Setup Required</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-4">To use MongoDB, you must enable the <strong>Data API</strong> in your MongoDB Atlas dashboard and add the credentials to <code className="bg-green-100 px-1 rounded">src/lib/mongodb.ts</code>.</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Go to Atlas Dashboard > Data API</li>
                <li>Enable Data API for your cluster</li>
                <li>Generate an API Key</li>
                <li>Copy the App ID and API Key into the code</li>
              </ol>
            </AlertDescription>
          </Alert>
        )}

        {error && !error.includes("MongoDB is not configured") && (
          <Alert variant="destructive" className="mb-8 bg-rose-50 border-rose-200 text-rose-900 rounded-2xl">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-bold">Database Error</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-4">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchTransactions}
                className="bg-white border-rose-200 hover:bg-rose-100 text-rose-700"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!error && (
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
                  <h2 className="text-xl font-bold text-gray-800">Transactions</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={fetchTransactions} 
                    disabled={loading}
                    className="rounded-full hover:bg-indigo-50 text-indigo-600"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Sync
                  </Button>
                </div>

                {loading && transactions.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
                    <RefreshCw className="mx-auto h-8 w-8 animate-spin mb-4 text-indigo-400" />
                    <p>Loading from Atlas...</p>
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