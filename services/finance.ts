import { FinanceRecord } from '../types';

export interface FinancialMetrics {
  outstandingInvoices: number;
  cloudCosts: number;
  salaries: number;
  budgetRemaining: number;
}

export const financeService = {
  getMetrics: async (): Promise<FinancialMetrics> => {
    return {
      outstandingInvoices: 12450,
      cloudCosts: 3200,
      salaries: 145000,
      budgetRemaining: 382500,
    };
  },
  getSpendingTrends: async (): Promise<{ month: string; spending: number; budget: number }[]> => {
    return [
      { month: 'Jan', spending: 40000, budget: 50000 },
      { month: 'Feb', spending: 45000, budget: 50000 },
      { month: 'Mar', spending: 42000, budget: 50000 },
    ];
  },
  getFinanceRecords: async (): Promise<FinanceRecord[]> => {
    return [];
  },
  createFinanceRecord: async (record: Omit<FinanceRecord, 'id'>): Promise<FinanceRecord> => {
    return { id: 'mock-id', ...record };
  },
};
