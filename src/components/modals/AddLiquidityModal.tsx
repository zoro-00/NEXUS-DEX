import { useState } from 'react';
import { X, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePoolStore, useWalletStore } from '@/stores';
import { useWalletConnection, useTokenBalance } from '@/hooks';
import type { Pool } from '@/types';
import { formatNumber } from '@/lib/utils';

interface AddLiquidityModalProps {
  isOpen: boolean;
  onClose: () => void;
  pool: Pool;
}

export function AddLiquidityModal({ isOpen, onClose, pool }: AddLiquidityModalProps) {
  const { isConnected } = useWalletStore();
  const { connectMetaMask } = useWalletConnection();
  const { 
    token0Amount, 
    token1Amount, 
    isAddingLiquidity,
    setToken0Amount,
    setToken1Amount,
    addLiquidity,
  } = usePoolStore();

  const [step, setStep] = useState<'input' | 'confirm'>('input');

  // Get token balances
  const { balance: balance0 } = useTokenBalance(pool.token0.address, pool.token0.decimals);
  const { balance: balance1 } = useTokenBalance(pool.token1.address, pool.token1.decimals);

  // Calculate share of pool
  const shareOfPool = token0Amount && parseFloat(token0Amount) > 0
    ? (parseFloat(token0Amount) / (parseFloat(pool.reserve0) + parseFloat(token0Amount))) * 100
    : 0;

  // Calculate LP tokens to receive (mock)
  const lpTokensToReceive = token0Amount && parseFloat(token0Amount) > 0
    ? (parseFloat(token0Amount) * parseFloat(pool.totalSupply) / parseFloat(pool.reserve0)).toFixed(6)
    : '0';

  // Check if amounts are valid
  const isValidAmounts = () => {
    if (!token0Amount || !token1Amount) return false;
    if (parseFloat(token0Amount) <= 0 || parseFloat(token1Amount) <= 0) return false;
    if (parseFloat(token0Amount) > parseFloat(balance0 || '0')) return false;
    if (parseFloat(token1Amount) > parseFloat(balance1 || '0')) return false;
    return true;
  };

  // Handle add liquidity
  const handleAddLiquidity = async () => {
    if (!isConnected) {
      connectMetaMask();
      return;
    }

    if (step === 'input') {
      setStep('confirm');
      return;
    }

    await addLiquidity();
    setStep('input');
    onClose();
  };

  // Handle close
  const handleClose = () => {
    setStep('input');
    setToken0Amount('');
    setToken1Amount('');
    onClose();
  };

  // Set max amount for token0
  const handleMax0 = () => {
    if (balance0) {
      setToken0Amount(balance0);
    }
  };

  // Set max amount for token1
  const handleMax1 = () => {
    if (balance1) {
      setToken1Amount(balance1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-[#0d111c] border-[#22242c] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold text-white flex items-center justify-between">
            {step === 'input' ? 'Add Liquidity' : 'Confirm Deposit'}
            <button 
              onClick={handleClose}
              className="p-1 rounded-lg hover:bg-[#22242c] transition-colors"
            >
              <X className="w-5 h-5 text-[#85868b]" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          {/* Pool Info */}
          <div className="flex items-center gap-3 mb-6 p-3 bg-[#1d1e24] rounded-xl">
            <div className="flex -space-x-2">
              <img 
                src={pool.token0.logoURI} 
                alt={pool.token0.symbol}
                className="w-8 h-8 rounded-full border-2 border-[#0d111c]"
              />
              <img 
                src={pool.token1.logoURI} 
                alt={pool.token1.symbol}
                className="w-8 h-8 rounded-full border-2 border-[#0d111c]"
              />
            </div>
            <div>
              <p className="font-medium text-white">
                {pool.token0.symbol}/{pool.token1.symbol}
              </p>
              <p className="text-sm text-[#85868b]">
                APR: <span className="text-[#20b553]">{formatNumber(pool.apr, 2)}%</span>
              </p>
            </div>
          </div>

          {step === 'input' ? (
            <>
              {/* Token 0 Input */}
              <div className="bg-[#1d1e24] rounded-xl p-4 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#85868b]">Input</span>
                  {isConnected && (
                    <span className="text-sm text-[#85868b]">
                      Balance: {formatNumber(balance0, 4)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={token0Amount}
                    onChange={(e) => setToken0Amount(e.target.value)}
                    className="flex-1 bg-transparent border-0 text-2xl font-medium text-white placeholder:text-[#596070] focus-visible:ring-0 p-0"
                  />
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0d111c]">
                    <img 
                      src={pool.token0.logoURI} 
                      alt={pool.token0.symbol}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="font-medium text-white">{pool.token0.symbol}</span>
                  </div>
                </div>
                {isConnected && parseFloat(balance0 || '0') > 0 && (
                  <button
                    onClick={handleMax0}
                    className="mt-2 text-xs text-[#3c3cc4] hover:text-[#2d62ff] transition-colors"
                  >
                    MAX
                  </button>
                )}
              </div>

              {/* Plus Icon */}
              <div className="flex justify-center -my-2 relative z-10">
                <div className="p-2 rounded-xl bg-[#0d111c] border border-[#22242c]">
                  <Plus className="w-5 h-5 text-[#b4bcd0]" />
                </div>
              </div>

              {/* Token 1 Input */}
              <div className="bg-[#1d1e24] rounded-xl p-4 mt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#85868b]">Input</span>
                  {isConnected && (
                    <span className="text-sm text-[#85868b]">
                      Balance: {formatNumber(balance1, 4)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={token1Amount}
                    onChange={(e) => setToken1Amount(e.target.value)}
                    className="flex-1 bg-transparent border-0 text-2xl font-medium text-white placeholder:text-[#596070] focus-visible:ring-0 p-0"
                  />
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0d111c]">
                    <img 
                      src={pool.token1.logoURI} 
                      alt={pool.token1.symbol}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="font-medium text-white">{pool.token1.symbol}</span>
                  </div>
                </div>
                {isConnected && parseFloat(balance1 || '0') > 0 && (
                  <button
                    onClick={handleMax1}
                    className="mt-2 text-xs text-[#3c3cc4] hover:text-[#2d62ff] transition-colors"
                  >
                    MAX
                  </button>
                )}
              </div>

              {/* Price Info */}
              {token0Amount && parseFloat(token0Amount) > 0 && (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#85868b]">Price Ratio</span>
                    <span className="text-white">
                      1 {pool.token0.symbol} = {formatNumber(parseFloat(pool.reserve1) / parseFloat(pool.reserve0), 6)} {pool.token1.symbol}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#85868b]">Share of Pool</span>
                    <span className="text-white">{formatNumber(shareOfPool, 4)}%</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Confirmation Details */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-3 bg-[#1d1e24] rounded-xl">
                  <div className="flex items-center gap-2">
                    <img 
                      src={pool.token0.logoURI} 
                      alt={pool.token0.symbol}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-white">{pool.token0.symbol}</span>
                  </div>
                  <span className="text-white font-medium">{formatNumber(token0Amount, 6)}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#1d1e24] rounded-xl">
                  <div className="flex items-center gap-2">
                    <img 
                      src={pool.token1.logoURI} 
                      alt={pool.token1.symbol}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-white">{pool.token1.symbol}</span>
                  </div>
                  <span className="text-white font-medium">{formatNumber(token1Amount, 6)}</span>
                </div>

                <div className="flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-[#85868b]" />
                </div>

                <div className="p-3 bg-[#3c3cc4]/10 border border-[#3c3cc4]/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[#85868b]">LP Tokens to Receive</span>
                    <span className="text-white font-medium">{formatNumber(lpTokensToReceive, 6)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[#85868b]">New Share of Pool</span>
                    <span className="text-white font-medium">{formatNumber(shareOfPool, 4)}%</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Button */}
          <Button
            onClick={handleAddLiquidity}
            disabled={step === 'input' ? !isValidAmounts() : isAddingLiquidity}
            className="w-full mt-4 py-6 rounded-xl font-medium text-lg bg-gradient-to-r from-[#2d62ff] to-[#7b61ff] hover:opacity-90 text-white disabled:opacity-50"
          >
            {!isConnected ? (
              'Connect Wallet'
            ) : isAddingLiquidity ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : step === 'input' ? (
              'Add Liquidity'
            ) : (
              'Confirm Deposit'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
