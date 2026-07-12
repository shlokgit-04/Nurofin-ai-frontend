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
      outstandingInvoices: 0,
      cloudCosts: 0,
      salaries: 0,
      budgetRemaining: 0,
    };
  },
  getSpendingTrends: async (): Promise<{ month: string; spending: number; budget: number }[]> => {
    return [];
  },
  getFinanceRecords: async (): Promise<FinanceRecord[]> => {
    return [];
  },
  createFinanceRecord: async (record: Omit<FinanceRecord, 'id'>): Promise<FinanceRecord> => {
    return { id: 'mock-id', ...record };
  },
};
