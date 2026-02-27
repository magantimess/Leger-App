"use client";

import React from 'react';
import { Trash2, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const TransactionList = ({ transactions, onDelete }: TransactionListProps) => {
  return (
    <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">Recent Entries</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No entries yet. Start by adding one above!</p>
            </div>
          ) : (
            transactions.map((t) => (
              <div 
                key={t.id} 
                className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 hover:border-indigo-100 transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${t.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{t.description}</h4>
                    <p className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <span className={`text-lg font-bold ${t.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'credit' ? '+' : '-'}${t.amount.toFixed(2)}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDelete(t.id)}
                    className="text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            ))
          ).reverse()}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionList;