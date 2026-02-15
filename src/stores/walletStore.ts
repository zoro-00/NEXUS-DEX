import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WalletState, Transaction } from '@/types';
import { SUPPORTED_CHAINS, getChainById } from '@/lib/chains';

interface WalletStore extends WalletState {
  // Actions
  connect: (address: string, chainId: number, provider?: any) => void;
  disconnect: () => void;
  setConnecting: (isConnecting: boolean) => void;
  switchChain: (chainId: number) => void;
  
  // Transactions
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
  updateTransaction: (hash: string, updates: Partial<Transaction>) => void;
  clearTransactions: () => void;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      // Initial state
      address: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      provider: null,
      transactions: [],

      // Connect wallet
      connect: (address, chainId, provider) => {
        set({
          address,
          chainId,
          isConnected: true,
          isConnecting: false,
          provider,
        });
      },

      // Disconnect wallet
      disconnect: () => {
        set({
          address: null,
          chainId: null,
          isConnected: false,
          isConnecting: false,
          provider: null,
        });
      },

      // Set connecting state
      setConnecting: (isConnecting) => {
        set({ isConnecting });
      },

      // Switch chain
      switchChain: (chainId) => {
        const chain = getChainById(chainId);
        if (chain) {
          set({ chainId });
        }
      },

      // Add transaction
      addTransaction: (tx) => {
        const newTx: Transaction = {
          ...tx,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };
        set((state) => ({
          transactions: [newTx, ...state.transactions],
        }));
      },

      // Update transaction
      updateTransaction: (hash, updates) => {
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.hash === hash ? { ...tx, ...updates } : tx
          ),
        }));
      },

      // Clear transactions
      clearTransactions: () => {
        set({ transactions: [] });
      },
    }),
    {
      name: 'nexus-wallet-storage',
      partialize: (state) => ({
        transactions: state.transactions.filter(
          (tx) => Date.now() - tx.timestamp < 7 * 24 * 60 * 60 * 1000 // Keep only last 7 days
        ),
      }),
    }
  )
);

// Helper hook for wallet connection
export function useWallet() {
  const store = useWalletStore();
  
  return {
    ...store,
    isSupportedChain: store.chainId
      ? SUPPORTED_CHAINS.some((c) => c.id === store.chainId)
      : false,
    currentChain: store.chainId ? getChainById(store.chainId) : null,
  };
}
