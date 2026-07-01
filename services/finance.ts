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
      budgetRemaining: 382500
    });
  },
  getSpendingTrends: async (): Promise<{ month: string; spending: number }[]> => {
    return Promise.resolve([
      { month: 'Jan', spending: 24000 },
      { month: 'Feb', spending: 28000 },
      { month: 'Mar', spending: 22000 },
      { month: 'Apr', spending: 35000 },
      { month: 'May', spending: 31000 },
      { month: 'Jun', spending: 42000 }
    ]);
  }
};
