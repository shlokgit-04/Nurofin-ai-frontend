import { FinanceRecord } from '../types';

export interface FinancialMetrics {
  outstandingInvoices: number;
  cloudCosts: number;
  salaries: number;
  budgetRemaining: number;
}

export const financeService = {
  getMetrics: async (): Promise<FinancialMetrics> => {
    const res = await fetch('/api/finance/metrics');
    if (!res.ok) {
      throw new Error('Failed to fetch financial metrics');
    }
    return res.json();
  },
  getSpendingTrends: async (): Promise<{ month: string; spending: number; budget: number }[]> => {
    const res = await fetch('/api/finance/spending-trends');
    if (!res.ok) {
      throw new Error('Failed to fetch spending trends');
    }
    return res.json();
  },
  getFinanceRecords: async (): Promise<FinanceRecord[]> => {
    const res = await fetch('/api/finance/records');
    if (!res.ok) {
      throw new Error('Failed to fetch finance records');
    }
    return res.json();
  },
  createFinanceRecord: async (record: Omit<FinanceRecord, 'id'>): Promise<FinanceRecord> => {
    const res = await fetch('/api/finance/records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });
    if (!res.ok) {
      throw new Error('Failed to create finance record');
    }
    return res.json();
  },
};
