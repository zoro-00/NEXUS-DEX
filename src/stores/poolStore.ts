import { create } from 'zustand';
import type { Pool, LiquidityPosition } from '@/types';
import { getTokensForChain } from '@/lib/chains';

interface PoolState {
  // Pools
  pools: Pool[];
  isLoadingPools: boolean;
  selectedPool: Pool | null;
  
  // User positions
  positions: LiquidityPosition[];
  isLoadingPositions: boolean;
  
  // Add liquidity state
  token0Amount: string;
  token1Amount: string;
  isAddingLiquidity: boolean;
  
  // UI state
  showAddLiquidityModal: boolean;
  showRemoveLiquidityModal: boolean;
  
  // Actions
  setPools: (pools: Pool[]) => void;
  setIsLoadingPools: (isLoading: boolean) => void;
  setSelectedPool: (pool: Pool | null) => void;
  setPositions: (positions: LiquidityPosition[]) => void;
  setIsLoadingPositions: (isLoading: boolean) => void;
  setToken0Amount: (amount: string) => void;
  setToken1Amount: (amount: string) => void;
  setIsAddingLiquidity: (isAdding: boolean) => void;
  setShowAddLiquidityModal: (show: boolean) => void;
  setShowRemoveLiquidityModal: (show: boolean) => void;
  
  // Async actions
  fetchPools: (chainId: number) => Promise<void>;
  fetchPositions: (address: string, chainId: number) => Promise<void>;
  addLiquidity: () => Promise<void>;
  removeLiquidity: (positionId: string, percentage: number) => Promise<void>;
}

// Generate mock pools for a chain
function generateMockPools(chainId: number): Pool[] {
  const tokens = getTokensForChain(chainId);
  const pools: Pool[] = [];
  
  // Create pairs between native token and popular tokens
  const nativeToken = tokens[0];
  const popularTokens = tokens.slice(1, 4);
  
  popularTokens.forEach((token, index) => {
    const tvl = 10000000 + Math.random() * 50000000;
    const volume24h = tvl * (0.05 + Math.random() * 0.15);
    const fees24h = volume24h * 0.003;
    const apr = (fees24h * 365 / tvl) * 100;
    
    pools.push({
      id: `${chainId}-${nativeToken.symbol}-${token.symbol}`,
      token0: nativeToken,
      token1: token,
      reserve0: (tvl / 2 / (index + 1)).toFixed(18),
      reserve1: (tvl / 2).toFixed(6),
      totalSupply: (tvl / 100).toFixed(18),
      tvl,
      volume24h,
      fees24h,
      apr: Math.min(apr * 100, 500), // Cap at 500%
    });
  });
  
  // Add stable pairs
  if (tokens.length > 3) {
    const usdc = tokens.find(t => t.symbol === 'USDC') || tokens[2];
    const usdt = tokens.find(t => t.symbol === 'USDT') || tokens[3];
    
    const stableTvl = 50000000 + Math.random() * 100000000;
    const stableVolume = stableTvl * (0.1 + Math.random() * 0.2);
    const stableFees = stableVolume * 0.0005; // Lower fees for stable pairs
    
    pools.push({
      id: `${chainId}-${usdc.symbol}-${usdt.symbol}`,
      token0: usdc,
      token1: usdt,
      reserve0: (stableTvl / 2).toFixed(6),
      reserve1: (stableTvl / 2).toFixed(6),
      totalSupply: (stableTvl / 100).toFixed(18),
      tvl: stableTvl,
      volume24h: stableVolume,
      fees24h: stableFees,
      apr: (stableFees * 365 / stableTvl) * 100,
    });
  }
  
  return pools.sort((a, b) => b.tvl - a.tvl);
}

// Generate mock positions
function generateMockPositions(address: string, pools: Pool[]): LiquidityPosition[] {
  if (!address || Math.random() > 0.7) return []; // 30% chance of having positions
  
  const numPositions = Math.floor(Math.random() * 3) + 1;
  const positions: LiquidityPosition[] = [];
  
  for (let i = 0; i < Math.min(numPositions, pools.length); i++) {
    const pool = pools[i];
    const share = 0.001 + Math.random() * 0.01; // 0.1% to 1% of pool
    const lpTokens = (parseFloat(pool.totalSupply) * share).toFixed(18);
    const amount0 = (parseFloat(pool.reserve0) * share).toFixed(6);
    const amount1 = (parseFloat(pool.reserve1) * share).toFixed(6);
    
    positions.push({
      poolId: pool.id,
      token0: pool.token0,
      token1: pool.token1,
      amount0,
      amount1,
      lpTokens,
      share: share * 100,
      valueUSD: pool.tvl * share,
    });
  }
  
  return positions;
}

export const usePoolStore = create<PoolState>((set, get) => ({
  // Initial state
  pools: [],
  isLoadingPools: false,
  selectedPool: null,
  positions: [],
  isLoadingPositions: false,
  token0Amount: '',
  token1Amount: '',
  isAddingLiquidity: false,
  showAddLiquidityModal: false,
  showRemoveLiquidityModal: false,

  // Setters
  setPools: (pools) => set({ pools }),
  setIsLoadingPools: (isLoading) => set({ isLoadingPools: isLoading }),
  setSelectedPool: (pool) => set({ selectedPool: pool }),
  setPositions: (positions) => set({ positions }),
  setIsLoadingPositions: (isLoading) => set({ isLoadingPositions: isLoading }),
  setToken0Amount: (amount) => {
    set({ token0Amount: amount });
    // Auto-calculate token1 amount based on pool ratio
    const { selectedPool } = get();
    if (selectedPool && amount) {
      const ratio = parseFloat(selectedPool.reserve1) / parseFloat(selectedPool.reserve0);
      const token1Amount = (parseFloat(amount) * ratio).toFixed(6);
      set({ token1Amount });
    }
  },
  setToken1Amount: (amount) => {
    set({ token1Amount: amount });
    // Auto-calculate token0 amount based on pool ratio
    const { selectedPool } = get();
    if (selectedPool && amount) {
      const ratio = parseFloat(selectedPool.reserve0) / parseFloat(selectedPool.reserve1);
      const token0Amount = (parseFloat(amount) * ratio).toFixed(6);
      set({ token0Amount });
    }
  },
  setIsAddingLiquidity: (isAdding) => set({ isAddingLiquidity: isAdding }),
  setShowAddLiquidityModal: (show) => set({ showAddLiquidityModal: show }),
  setShowRemoveLiquidityModal: (show) => set({ showRemoveLiquidityModal: show }),

  // Fetch pools
  fetchPools: async (chainId) => {
    set({ isLoadingPools: true });
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const pools = generateMockPools(chainId);
    set({ pools, isLoadingPools: false });
  },

  // Fetch user positions
  fetchPositions: async (address, _chainId) => {
    set({ isLoadingPositions: true });
    
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    const { pools } = get();
    const positions = generateMockPositions(address, pools);
    set({ positions, isLoadingPositions: false });
  },

  // Add liquidity
  addLiquidity: async () => {
    const { selectedPool, token0Amount, token1Amount } = get();
    if (!selectedPool || !token0Amount || !token1Amount) return;

    set({ isAddingLiquidity: true });
    
    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    set({ 
      isAddingLiquidity: false,
      showAddLiquidityModal: false,
      token0Amount: '',
      token1Amount: '',
    });
  },

  // Remove liquidity
  removeLiquidity: async (positionId, percentage) => {
    set({ isAddingLiquidity: true });
    
    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Update positions
    set((state) => ({
      positions: state.positions
        .map((pos) => {
          if (pos.poolId === positionId) {
            const remainingShare = pos.share * (1 - percentage / 100);
            if (remainingShare < 0.001) return null;
            return {
              ...pos,
              share: remainingShare,
              valueUSD: pos.valueUSD * (1 - percentage / 100),
            };
          }
          return pos;
        })
        .filter(Boolean) as LiquidityPosition[],
      isAddingLiquidity: false,
      showRemoveLiquidityModal: false,
    }));
  },
}));
