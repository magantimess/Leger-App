"use client";

import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SummaryProps {
  totalCredit: number;
  totalDebit: number;
  activeFilter: 'all' | 'credit' | 'debit';
  onFilterChange: (filter: 'all' | 'credit' | 'debit') => void;
}

const Summary = ({ totalCredit, totalDebit, activeFilter, onFilterChange }: SummaryProps) => {
  const balance = totalCredit - totalDebit;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card 
        className={cn(
          "cursor-pointer transition-all hover:shadow-md border-emerald-100 overflow-hidden",
          activeFilter === 'credit' ? "bg-emerald-100 ring-2 ring-emerald-500 ring-offset-2" : "bg-emerald-50"
        )}
        onClick={() => onFilterChange(activeFilter === 'credit' ? 'all' : 'credit')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600 mb-1">Total Credit</p>
              <h3 className="text-2xl font-bold text-emerald-900">₹{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="bg-emerald-200/50 p-3 rounded-full">
              <ArrowUpCircle className="text-emerald-600" size={24} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card 
        className={cn(
          "cursor-pointer transition-all hover:shadow-md border-rose-100 overflow-hidden",
          activeFilter === 'debit' ? "bg-rose-100 ring-2 ring-rose-500 ring-offset-2" : "bg-rose-50"
        )}
        onClick={() => onFilterChange(activeFilter === 'debit' ? 'all' : 'debit')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-rose-600 mb-1">Total Debit</p>
              <h3 className="text-2xl font-bold text-rose-900">₹{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="bg-rose-200/50 p-3 rounded-full">
              <ArrowDownCircle className="text-rose-600" size={24} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card 
        className={cn(
          "cursor-pointer transition-all hover:shadow-md border-indigo-100 overflow-hidden",
          activeFilter === 'all' ? "bg-indigo-100 ring-2 ring-indigo-500 ring-offset-2" : "bg-indigo-50"
        )}
        onClick={() => onFilterChange('all')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600 mb-1">Current Balance</p>
              <h3 className="text-2xl font-bold text-indigo-900">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="bg-indigo-200/50 p-3 rounded-full">
              <Wallet className="text-indigo-600" size={24} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Summary;