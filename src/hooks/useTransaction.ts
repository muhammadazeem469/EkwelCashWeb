import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Transaction {
  id: string;
  type: "CONTRACT_DEPLOYMENT" | "TOKEN_CREATION" | "TOKEN_MINT";
  status: "PENDING" | "SUCCEEDED" | "FAILED";
  data: any;
  timestamp: number;
}

interface TransactionStore {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "timestamp">) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  clearTransactions: () => void;
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set) => ({
      transactions: [],
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [
            { ...transaction, timestamp: Date.now() },
            ...state.transactions,
          ],
        })),
      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
      clearTransactions: () => set({ transactions: [] }),
    }),
    {
      name: "transaction-storage",
    }
  )
);
