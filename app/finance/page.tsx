'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { cn } from '@/utils/cn';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  DollarSign, 
  CreditCard, 
  PiggyBank, 
  Calendar, 
  ArrowUpRight, 
  TrendingUp 
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function FinancePage() {
  const { financeRecords } = useStore();

  // Metrics
  const totalBudget = financeRecords
    .filter(r => r.category === 'budget')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpenses = financeRecords
    .filter(r => r.category === 'expense' || r.category === 'vendor_payment')
    .reduce((sum, r) => sum + r.amount, 0);

  const pendingRenewals = financeRecords
    .filter(r => r.category === 'renewal' && r.status === 'pending')
    .reduce((sum, r) => sum + r.amount, 0);

  const overduePayments = financeRecords
    .filter(r => r.category === 'vendor_payment' && r.status === 'overdue')
    .reduce((sum, r) => sum + r.amount, 0);

  // Spending vs Budget trends
  const spendingTrends = [
    { month: 'Jan', spending: 24000, budget: 35000 },
    { month: 'Feb', spending: 28000, budget: 35000 },
    { month: 'Mar', spending: 22000, budget: 35000 },
    { month: 'Apr', spending: 35000, budget: 35000 },
    { month: 'May', spending: 31000, budget: 35000 },
    { month: 'Jun', spending: 42000, budget: 45000 },
  ];

  // Pie chart budget allocations
  const budgetAllocationData = [
    { name: 'Server Hosting', value: 80000 },
    { name: 'SaaS Licenses', value: 35000 },
    { name: 'Developer Support', value: 20000 },
    { name: 'Contingency Reserves', value: 15000 },
  ];

  const getRecordColor = (category: string) => {
    switch (category) {
      case 'vendor_payment': return 'text-accent-red bg-accent-red/10 border-accent-red/20';
      case 'expense': return 'text-accent-orange bg-accent-orange/10 border-accent-orange/20';
      case 'budget': return 'text-accent-green bg-accent-green/10 border-accent-green/20';
      default: return 'text-accent-blue bg-accent-blue/10 border-accent-blue/20';
    }
  };

  const getRecordLabel = (category: string) => {
    switch (category) {
      case 'vendor_payment': return 'Vendor Payment';
      case 'expense': return 'Expense';
      case 'budget': return 'Budget Allocation';
      case 'renewal': return 'SaaS Renewal';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-text-primary">
      {/* Finance Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background-secondary p-4 rounded-lg border border-border-subtle shadow-md">
        <div>
          <h2 className="text-base font-bold font-sans">Corporate Financial Control</h2>
          <p className="text-2xs text-text-secondary mt-0.5">Track budgets allocated, infrastructure expenses, and pending renewals.</p>
        </div>
      </div>

      {/* KPI metric grids */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Budget Allocated */}
        <div className="bg-background-secondary border border-border-subtle rounded-lg p-5 flex items-center gap-4 hover:border-text-muted transition-colors">
          <div className="p-3 bg-accent-green/10 rounded-lg text-accent-green">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Budgets Allocated</span>
            <span className="text-xl font-extrabold">${totalBudget.toLocaleString()}</span>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-background-secondary border border-border-subtle rounded-lg p-5 flex items-center gap-4 hover:border-text-muted transition-colors">
          <div className="p-3 bg-accent-blue/10 rounded-lg text-accent-blue">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Active Expenditures</span>
            <span className="text-xl font-extrabold">${totalExpenses.toLocaleString()}</span>
          </div>
        </div>

        {/* Overdue Vendor Payments */}
        <div className="bg-background-secondary border border-border-subtle rounded-lg p-5 flex items-center gap-4 hover:border-text-muted transition-colors">
          <div className="p-3 bg-accent-red/10 rounded-lg text-accent-red">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Overdue Payments</span>
            <span className="text-xl font-extrabold text-accent-red">${overduePayments.toLocaleString()}</span>
          </div>
        </div>

        {/* Pending Renewals */}
        <div className="bg-background-secondary border border-border-subtle rounded-lg p-5 flex items-center gap-4 hover:border-text-muted transition-colors">
          <div className="p-3 bg-accent-orange/10 rounded-lg text-accent-orange">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Pending Renewals</span>
            <span className="text-xl font-extrabold text-accent-orange">${pendingRenewals.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Visual Chart grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Spending Trends bar chart (left panel) */}
        <div className="lg:col-span-2 bg-background-secondary border border-border-subtle rounded-lg p-5 shadow-md space-y-4">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-accent-blue" /> Spending Trends vs Budget Caps (Jan - Jun)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendingTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A364F" />
                <XAxis dataKey="month" stroke="#8A99AD" fontSize={10} />
                <YAxis stroke="#8A99AD" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A2332', borderColor: '#2A364F', borderRadius: '8px' }} 
                  labelStyle={{ color: '#FFFFFF' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="spending" name="Actual Spending" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="budget" name="Budget Limit" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Allocation Breakdown pie chart (right panel) */}
        <div className="bg-background-secondary border border-border-subtle rounded-lg p-5 shadow-md space-y-4">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-accent-green" /> Q3 Infrastructure Allocations
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetAllocationData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {budgetAllocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A2332', borderColor: '#2A364F', borderRadius: '8px' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Corporate Ledger breakdown tables */}
      <div className="bg-background-secondary border border-border-subtle rounded-lg overflow-hidden shadow-md">
        <div className="p-4 border-b border-border-subtle bg-surface-card/10">
          <h3 className="text-xs font-bold text-text-primary">Corporate Invoice Ledger</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ledger Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Vendor / Dept</TableHead>
              <TableHead>Target Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {financeRecords.map((rec) => (
              <TableRow key={rec.id}>
                <TableCell className="font-semibold text-xs py-4">{rec.title}</TableCell>
                <TableCell>
                  <span className={cn("px-2 py-0.5 rounded border text-[9px] uppercase font-bold tracking-wider", getRecordColor(rec.category))}>
                    {getRecordLabel(rec.category)}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs font-bold text-text-primary">
                  ${rec.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-2xs text-text-secondary">
                  {rec.vendor || rec.department || 'N/A'}
                </TableCell>
                <TableCell className="text-2xs text-text-secondary">{rec.dueDate}</TableCell>
                <TableCell>
                  <span className={cn(
                    "text-2xs font-bold capitalize",
                    rec.status === 'overdue' ? 'text-accent-red' :
                    rec.status === 'paid' || rec.status === 'approved' ? 'text-accent-green' :
                    'text-accent-orange'
                  )}>
                    {rec.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
