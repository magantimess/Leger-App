"use client";

import React from 'react';
import { Calendar as CalendarIcon, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TransactionFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

const TransactionFilter = ({ startDate, endDate, onStartDateChange, onEndDateChange }: TransactionFilterProps) => {
  return (
    <Card className="mb-8 border-none shadow-lg bg-white/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
          <Search className="mr-2 text-indigo-600" size={20} />
          Retrieve Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-xs font-medium text-gray-500 uppercase tracking-wider">From Date</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="pl-10 rounded-xl border-gray-200 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-xs font-medium text-gray-500 uppercase tracking-wider">To Date</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="pl-10 rounded-xl border-gray-200 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionFilter;