import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format number with commas and decimals
export function formatNumber(
  value: string | number,
  decimals: number = 2,
  compact: boolean = false
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '0';
  
  if (compact && Math.abs(num) >= 1e9) {
    return (num / 1e9).toFixed(decimals) + 'B';
  }
  if (compact && Math.abs(num) >= 1e6) {
    return (num / 1e6).toFixed(decimals) + 'M';
  }
  if (compact && Math.abs(num) >= 1e3) {
    return (num / 1e3).toFixed(decimals) + 'K';
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

// Format currency with $ symbol
export function formatCurrency(
  value: string | number,
  decimals: number = 2,
  compact: boolean = false
): string {
  const formatted = formatNumber(value, decimals, compact);
  return `$${formatted}`;
}

// Format percentage
export function formatPercentage(value: string | number, decimals: number = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0%';
  return `${num >= 0 ? '+' : ''}${num.toFixed(decimals)}%`;
}

// Format token amount with proper decimals
export function formatTokenAmount(
  amount: string,
  decimals: number,
  displayDecimals: number = 6
): string {
  const value = parseFloat(amount) / Math.pow(10, decimals);
  if (isNaN(value)) return '0';
  
  if (value < 0.000001) {
    return '< 0.000001';
  }
  
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: displayDecimals,
  });
}

// Parse token amount to raw value
export function parseTokenAmount(amount: string, decimals: number): string {
  const value = parseFloat(amount);
  if (isNaN(value)) return '0';
  return Math.floor(value * Math.pow(10, decimals)).toString();
}

// Shorten address for display
export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// Calculate price impact color
export function getPriceImpactColor(impact: number): string {
  if (impact < 1) return 'text-green-500';
  if (impact < 3) return 'text-yellow-500';
  if (impact < 5) return 'text-orange-500';
  return 'text-red-500';
}

// Calculate APR color
export function getAprColor(apr: number): string {
  if (apr >= 100) return 'text-purple-400';
  if (apr >= 50) return 'text-blue-400';
  if (apr >= 20) return 'text-green-400';
  return 'text-neutral-400';
}

// Generate mock price data for charts
export function generateMockPriceData(
  basePrice: number,
  points: number = 100,
  volatility: number = 0.02
): { timestamp: number; price: number; volume: number }[] {
  const data = [];
  let currentPrice = basePrice;
  const now = Date.now();
  const interval = 3600000; // 1 hour
  
  for (let i = points - 1; i >= 0; i--) {
    const change = (Math.random() - 0.5) * volatility;
    currentPrice = currentPrice * (1 + change);
    
    data.push({
      timestamp: now - i * interval,
      price: currentPrice,
      volume: Math.random() * 1000000,
    });
  }
  
  return data;
}

// Calculate exchange rate
export function calculateExchangeRate(
  inputAmount: string,
  outputAmount: string,
  inputDecimals: number,
  outputDecimals: number
): number {
  const input = parseFloat(inputAmount) / Math.pow(10, inputDecimals);
  const output = parseFloat(outputAmount) / Math.pow(10, outputDecimals);
  if (input === 0) return 0;
  return output / input;
}

// Debounce function
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// Get explorer URL for transaction
export function getExplorerTxUrl(chainId: number, hash: string): string {
  const { getChainById } = require('./chains');
  const chain = getChainById(chainId);
  if (!chain) return '#';
  return `${chain.blockExplorerUrl}/tx/${hash}`;
}

// Get explorer URL for address
export function getExplorerAddressUrl(chainId: number, address: string): string {
  const { getChainById } = require('./chains');
  const chain = getChainById(chainId);
  if (!chain) return '#';
  return `${chain.blockExplorerUrl}/address/${address}`;
}
