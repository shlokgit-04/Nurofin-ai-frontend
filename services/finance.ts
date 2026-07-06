import { FinanceRecord } from '../types';

export interface FinancialMetrics {
  outstandingInvoices: number;
  cloudCosts: number;
  salaries: number;
  budgetRemaining: number;
}

export const financeService = {
  getMetrics: async (): Promise<FinancialMetrics> => {
    return Promise.resolve({
      outstandingInvoices: 45200,
      cloudCosts: 12450,
      salaries: 118000,
      budgetRemaining: 382500,
    });
  },
  getSpendingTrends: async (): Promise<{ month: string; spending: number; budget: number }[]> => {
    return Promise.resolve([
      { month: 'Jan', spending: 24000, budget: 35000 },
      { month: 'Feb', spending: 28000, budget: 35000 },
      { month: 'Mar', spending: 22000, budget: 35000 },
      { month: 'Apr', spending: 35000, budget: 35000 },
      { month: 'May', spending: 31000, budget: 35000 },
      { month: 'Jun', spending: 42000, budget: 45000 },
    ]);
  },
  getFinanceRecords: async (): Promise<FinanceRecord[]> => {
    return Promise.resolve([
      {
        id: 'fin-1',
        category: 'vendor_payment',
        title: 'Acme Developer Seat Licenses',
        amount: 12450.00,
        dueDate: '2026-07-03',
        status: 'overdue',
        vendor: 'Acme Corp',
        department: 'Engineering',
      },
      {
        id: 'fin-2',
        category: 'expense',
        title: 'GetStream Real-Time Chat Plan',
        amount: 4500.00,
        dueDate: '2026-07-15',
        status: 'pending',
        vendor: 'Stream.io',
        department: 'Product',
      },
      {
        id: 'fin-3',
        category: 'budget',
        title: 'Q3 Enterprise Infrastructure Budget',
        amount: 150000.00,
        dueDate: '2026-09-01',
        status: 'approved',
        department: 'Operations',
        chartData: [
          { name: 'Hosting', value: 80000 },
          { name: 'Licenses', value: 35000 },
          { name: 'Support', value: 20000 },
          { name: 'Reserves', value: 15000 },
        ],
      },
      {
        id: 'fin-4',
        category: 'renewal',
        title: 'AWS Ledger DB Instances Renewal',
        amount: 28900.00,
        dueDate: '2026-08-01',
        status: 'pending',
        vendor: 'Amazon Web Services',
        department: 'Infrastructure',
      },
    ]);
  },
  createFinanceRecord: async (record: Omit<FinanceRecord, 'id'>): Promise<FinanceRecord> => {
    return Promise.resolve({
      ...record,
      id: `fin-${Date.now()}`,
    });
  },
};
