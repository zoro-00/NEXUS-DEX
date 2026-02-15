import { useState, useEffect, useCallback } from 'react';
import { generateMockPriceData } from '@/lib/utils';

interface ChartPoint {
  timestamp: number;
  price: number;
  volume: number;
}

interface ChartData {
  data: ChartPoint[];
  currentPrice: number;
  priceChange24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

export function useChartData(
  tokenInSymbol: string,
  tokenOutSymbol: string,
  timeframe: string = '1D'
) {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChartData = useCallback(async () => {
    if (!tokenInSymbol || !tokenOutSymbol) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Generate mock price based on token pair
      const basePrice = getMockBasePrice(tokenInSymbol, tokenOutSymbol);
      const points = getTimeframePoints(timeframe);
      
      const data = generateMockPriceData(basePrice, points, 0.015);
      
      // Calculate statistics
      const prices = data.map((d) => d.price);
      const currentPrice = prices[prices.length - 1];
      const startPrice = prices[0];
      const priceChange24h = ((currentPrice - startPrice) / startPrice) * 100;
      const high24h = Math.max(...prices);
      const low24h = Math.min(...prices);
      const volume24h = data.reduce((sum, d) => sum + d.volume, 0);

      setChartData({
        data,
        currentPrice,
        priceChange24h,
        high24h,
        low24h,
        volume24h,
      });
    } catch (err) {
      console.error('Chart data fetch error:', err);
      setError('Failed to load chart data');
    } finally {
      setIsLoading(false);
    }
  }, [tokenInSymbol, tokenOutSymbol, timeframe]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchChartData();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchChartData]);

  return {
    chartData,
    isLoading,
    error,
    refetch: fetchChartData,
  };
}

function getMockBasePrice(tokenIn: string, tokenOut: string): number {
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

  return priceOut / priceIn;
}

function getTimeframePoints(timeframe: string): number {
  switch (timeframe) {
    case '1H':
      return 60;
    case '1D':
      return 96; // 15-minute intervals
    case '1W':
      return 168; // Hourly
    case '1M':
      return 120; // 6-hour intervals
    case '1Y':
      return 365; // Daily
    default:
      return 96;
  }
}

// Hook for pool analytics
export function usePoolAnalytics(poolId: string) {
  const [analytics, setAnalytics] = useState<{
    tvlHistory: { timestamp: number; value: number }[];
    volumeHistory: { timestamp: number; value: number }[];
    feeHistory: { timestamp: number; value: number }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!poolId) return;

      setIsLoading(true);

      try {
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Generate mock historical data
        const days = 30;
        const tvlHistory = [];
        const volumeHistory = [];
        const feeHistory = [];

        let currentTvl = 10000000 + Math.random() * 50000000;

        for (let i = days - 1; i >= 0; i--) {
          const timestamp = Date.now() - i * 24 * 60 * 60 * 1000;
          const change = (Math.random() - 0.5) * 0.1;
          currentTvl = currentTvl * (1 + change);

          const volume = currentTvl * (0.05 + Math.random() * 0.15);
          const fees = volume * 0.003;

          tvlHistory.push({ timestamp, value: currentTvl });
          volumeHistory.push({ timestamp, value: volume });
          feeHistory.push({ timestamp, value: fees });
        }

        setAnalytics({
          tvlHistory,
          volumeHistory,
          feeHistory,
        });
      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [poolId]);

  return { analytics, isLoading };
}
