import { create } from 'zustand';
import type { Token, Trade, SwapSettings } from '@/types';
import { getTokensForChain } from '@/lib/chains';

interface SwapState {
  // Input/Output tokens
  inputToken: Token | null;
  outputToken: Token | null;
  inputAmount: string;
  outputAmount: string;
  
  // Trade info
  trade: Trade | null;
  isCalculating: boolean;
  
  // Settings
  settings: SwapSettings;
  
  // UI state
  showSettings: boolean;
  showTokenSelector: 'input' | 'output' | null;
  
  // Actions
  setInputToken: (token: Token | null) => void;
  setOutputToken: (token: Token | null) => void;
  setInputAmount: (amount: string) => void;
  setOutputAmount: (amount: string) => void;
  switchTokens: () => void;
  setTrade: (trade: Trade | null, inputAmount?: string, outputAmount?: string) => void;
  setIsCalculating: (isCalculating: boolean) => void;
  updateSettings: (settings: Partial<SwapSettings>) => void;
  setShowSettings: (show: boolean) => void;
  setShowTokenSelector: (selector: 'input' | 'output' | null) => void;
  reset: () => void;
}

const defaultSettings: SwapSettings = {
  slippageTolerance: 0.5,
  deadline: 20,
  infiniteApprove: false,
  expertMode: false,
};

export const useSwapStore = create<SwapState>((set, get) => ({
  // Initial state
  inputToken: null,
  outputToken: null,
  inputAmount: '',
  outputAmount: '',
  trade: null,
  isCalculating: false,
  settings: defaultSettings,
  showSettings: false,
  showTokenSelector: null,

  // Set input token
  setInputToken: (token) => {
    set({ inputToken: token });
    // Recalculate trade if needed
    const { inputAmount, outputToken } = get();
    if (inputAmount && token && outputToken) {
      calculateTrade();
    }
  },

  // Set output token
  setOutputToken: (token) => {
    set({ outputToken: token });
    // Recalculate trade if needed
    const { inputAmount, inputToken } = get();
    if (inputAmount && inputToken && token) {
      calculateTrade();
    }
  },

  // Set input amount
  setInputAmount: (amount) => {
    set({ inputAmount: amount });
    if (amount) {
      calculateTrade();
    } else {
      set({ outputAmount: '', trade: null });
    }
  },

  // Set output amount
  setOutputAmount: (amount) => {
    set({ outputAmount: amount });
    if (amount) {
      calculateReverseTrade();
    } else {
      set({ inputAmount: '', trade: null });
    }
  },

  // Switch input/output tokens
  switchTokens: () => {
    const { inputToken, outputToken, inputAmount, outputAmount } = get();
    set({
      inputToken: outputToken,
      outputToken: inputToken,
      inputAmount: outputAmount,
      outputAmount: inputAmount,
    });
    if (outputAmount) {
      calculateTrade();
    }
  },

  // Set trade
  setTrade: (trade, inputAmount, outputAmount) => {
    set((state) => ({
      trade,
      inputAmount: inputAmount !== undefined ? inputAmount : state.inputAmount,
      outputAmount: outputAmount !== undefined ? outputAmount : state.outputAmount,
      isCalculating: false,
    }));
  },

  // Set calculating state
  setIsCalculating: (isCalculating) => set({ isCalculating }),

  // Update settings
  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  // Toggle settings panel
  setShowSettings: (show) => set({ showSettings: show }),

  // Set token selector
  setShowTokenSelector: (selector) => set({ showTokenSelector: selector }),

  // Reset state
  reset: () => {
    set({
      inputAmount: '',
      outputAmount: '',
      trade: null,
      isCalculating: false,
    });
  },
}));

// Mock trade calculation (in production, this would call a DEX router)
async function calculateTrade() {
  const store = useSwapStore.getState();
  const { inputToken, outputToken, inputAmount, settings } = store;
  
  if (!inputToken || !outputToken || !inputAmount || parseFloat(inputAmount) === 0) {
    store.setTrade(null);
    return;
  }

  store.setIsCalculating(true);

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Mock calculation
  const inputValue = parseFloat(inputAmount);
  const mockPrice = getMockPrice(inputToken.symbol, outputToken.symbol);
  const outputValue = inputValue * mockPrice;
  const priceImpact = Math.random() * 2; // 0-2%
  
  const trade: Trade = {
    inputAmount,
    outputAmount: outputValue.toFixed(6),
    inputToken,
    outputToken,
    price: mockPrice,
    priceImpact,
    route: [inputToken.symbol, outputToken.symbol],
    minimumReceived: (outputValue * (1 - settings.slippageTolerance / 100)).toFixed(6),
    liquidityProviderFee: (inputValue * 0.003).toFixed(6),
  };

  store.setTrade(trade, undefined, trade.outputAmount);
}

// Mock reverse trade calculation
async function calculateReverseTrade() {
  const store = useSwapStore.getState();
  const { inputToken, outputToken, outputAmount, settings } = store;
  
  if (!inputToken || !outputToken || !outputAmount || parseFloat(outputAmount) === 0) {
    store.setTrade(null);
    return;
  }

  store.setIsCalculating(true);

  await new Promise((resolve) => setTimeout(resolve, 300));

  const outputValue = parseFloat(outputAmount);
  const mockPrice = getMockPrice(inputToken.symbol, outputToken.symbol);
  const inputValue = outputValue / mockPrice;
  const priceImpact = Math.random() * 2;

  const trade: Trade = {
    inputAmount: inputValue.toFixed(6),
    outputAmount,
    inputToken,
    outputToken,
    price: mockPrice,
    priceImpact,
    route: [inputToken.symbol, outputToken.symbol],
    minimumReceived: (outputValue * (1 - settings.slippageTolerance / 100)).toFixed(6),
    liquidityProviderFee: (inputValue * 0.003).toFixed(6),
  };

  store.setTrade(trade, trade.inputAmount, undefined);
}

// Mock price feed
function getMockPrice(tokenIn: string, tokenOut: string): number {
  const prices: Record<string, number> = {
    'ETH': 3500,
    'WETH': 3500,
    'BNB': 600,
    'WBNB': 600,
    'MATIC': 0.8,
    'USDC': 1,
    'USDT': 1,
    'DAI': 1,
    'WBTC': 65000,
    'BTCB': 65000,
  };
  
  const priceIn = prices[tokenIn] || 1;
  const priceOut = prices[tokenOut] || 1;
  
  return priceIn / priceOut;
}

// Initialize tokens for a chain
export function initializeTokens(chainId: number) {
  const tokens = getTokensForChain(chainId);
  const store = useSwapStore.getState();
  
  if (!store.inputToken) {
    store.setInputToken(tokens[0]); // Native token
  }
  if (!store.outputToken) {
    store.setOutputToken(tokens[1]); // First popular token
  }
}
