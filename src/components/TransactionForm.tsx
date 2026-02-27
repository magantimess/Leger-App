"use client";

import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showSuccess } from "@/utils/toast";

interface TransactionFormProps {
  onAdd: (transaction: { description: string; amount: number; type: 'credit' | 'debit' }) => void;
}

const TransactionForm = ({ onAdd }: TransactionFormProps) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'credit' | 'debit'>('debit');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    onAdd({
      description,
      amount: parseFloat(amount),
      type
    });

    setDescription('');
    setAmount('');
    showSuccess("Entry added successfully!");
  };

  return (
    <Card className="mb-8 border-none shadow-lg bg-white/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">New Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Grocery, Salary, Rent"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl border-gray-200 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-xl border-gray-200 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Transaction Type</Label>
            <RadioGroup 
              value={type} 
              onValueChange={(v) => setType(v as 'credit' | 'debit')}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 cursor-pointer hover:bg-emerald-100 transition-colors">
                <RadioGroupItem value="credit" id="credit" className="text-emerald-600" />
                <Label htmlFor="credit" className="cursor-pointer text-emerald-700 font-medium">Credit (Income)</Label>
              </div>
              <div className="flex items-center space-x-2 bg-rose-50 px-4 py-2 rounded-full border border-rose-100 cursor-pointer hover:bg-rose-100 transition-colors">
                <RadioGroupItem value="debit" id="debit" className="text-rose-600" />
                <Label htmlFor="debit" className="cursor-pointer text-rose-700 font-medium">Debit (Expense)</Label>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 text-lg font-semibold transition-all transform hover:scale-[1.01] active:scale-[0.99]">
            <PlusCircle className="mr-2" size={20} />
            Add Entry
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;