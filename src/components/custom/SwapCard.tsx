import { useState } from 'react';
import { ArrowDown, Settings, ChevronDown, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { useSwapStore, useWalletStore, initializeTokens } from '@/stores';
import { useWalletConnection, useTokenBalance } from '@/hooks';
import { formatNumber, getPriceImpactColor } from '@/lib/utils';
import { TokenSelectorModal } from '../modals/TokenSelectorModal';
import { SettingsModal } from '../modals/SettingsModal';

export function SwapCard() {
  const { isConnected, chainId } = useWalletStore();
  const { connectMetaMask } = useWalletConnection();
  
  const {
    inputToken,
    outputToken,
    inputAmount,
    outputAmount,
    trade,
    isCalculating,
    showSettings,
    showTokenSelector,
    setInputToken,
    setOutputToken,
    setInputAmount,
    setOutputAmount,
    switchTokens,
    setShowSettings,
    setShowTokenSelector,
  } = useSwapStore();

  const [isSwapping, setIsSwapping] = useState(false);

  // Initialize tokens when chain changes
  const [prevChainId, setPrevChainId] = useState<number | null>(null);

  if (chainId && (chainId !== prevChainId || !inputToken)) {
    initializeTokens(chainId);
    setPrevChainId(chainId);
  }

  // Get token balances
  const { balance: inputBalance } = useTokenBalance(
    inputToken?.address || '',
    inputToken?.decimals
  );
  const { balance: outputBalance } = useTokenBalance(
    outputToken?.address || '',
    outputToken?.decimals
  );

  // Handle swap execution
  const handleSwap = async () => {
    if (!isConnected) {
      connectMetaMask();
      return;
    }

    if (!trade || !inputToken || !outputToken) return;

    setIsSwapping(true);
    
    // Simulate swap transaction
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Add transaction to store
    const { addTransaction } = useWalletStore.getState();
    addTransaction({
      hash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
      status: 'success',
      type: 'swap',
      description: `Swap ${formatNumber(inputAmount, 4)} ${inputToken.symbol} for ${formatNumber(outputAmount, 4)} ${outputToken.symbol}`,
      chainId: chainId || 1,
      from: useWalletStore.getState().address || '',
    });

    setIsSwapping(false);
    setInputAmount('');
    setOutputAmount('');
  };

  // Set max input amount
  const handleMaxClick = () => {
    if (inputBalance) {
      setInputAmount(inputBalance);
    }
  };

  // Get button text
  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet';
    if (!inputToken || !outputToken) return 'Select Tokens';
    if (!inputAmount || parseFloat(inputAmount) === 0) return 'Enter Amount';
    if (isCalculating) return 'Calculating...';
    if (isSwapping) return 'Swapping...';
    if (trade && parseFloat(inputAmount) > parseFloat(inputBalance || '0')) {
      return `Insufficient ${inputToken.symbol} Balance`;
    }
    if (trade && trade.priceImpact > 5) return 'Price Impact Too High';
    return 'Swap';
  };

  // Check if button is disabled
  const isButtonDisabled = () => {
    if (!isConnected) return false;
    if (!inputToken || !outputToken) return true;
    if (!inputAmount || parseFloat(inputAmount) === 0) return true;
    if (isCalculating || isSwapping) return true;
    if (trade && parseFloat(inputAmount) > parseFloat(inputBalance || '0')) return true;
    if (trade && trade.priceImpact > 15) return true;
    return false;
  };

  return (
    <div className="w-full max-w-md">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Swap</h2>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-xl bg-[#1d1e24] border border-[#22242c] hover:border-[#3c3cc4]/50 transition-colors"
        >
          <Settings className="w-4 h-4 text-[#b4bcd0]" />
        </button>
      </div>

      {/* Swap Card */}
      <div className="bg-[#0d111c] border border-[#22242c] rounded-2xl p-4">
        {/* Input Token */}
        <div className="bg-[#1d1e24] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#85868b]">You Pay</span>
            {isConnected && inputToken && (
              <span className="text-sm text-[#85868b]">
                Balance: {formatNumber(inputBalance, 4)}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <Input
              type="number"
              placeholder="0.0"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              className="flex-1 bg-transparent border-0 text-2xl font-medium text-white placeholder:text-[#596070] focus-visible:ring-0 p-0"
            />
            <button
              onClick={() => setShowTokenSelector('input')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0d111c] border border-[#22242c] hover:border-[#3c3cc4]/50 transition-colors"
            >
              {inputToken ? (
                <>
                  <img 
                    src={inputToken.logoURI || '/tokens/unknown.png'} 
                    alt={inputToken.symbol}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-medium text-white">{inputToken.symbol}</span>
                </>
              ) : (
                <span className="font-medium text-white">Select</span>
              )}
              <ChevronDown className="w-4 h-4 text-[#85868b]" />
            </button>
          </div>
          
          {isConnected && inputToken && parseFloat(inputBalance || '0') > 0 && (
            <button
              onClick={handleMaxClick}
              className="mt-2 text-xs text-[#3c3cc4] hover:text-[#2d62ff] transition-colors"
            >
              MAX
            </button>
          )}
        </div>

        {/* Swap Direction Button */}
        <div className="flex justify-center -my-3 relative z-10">
          <button
            onClick={switchTokens}
            className="p-2 rounded-xl bg-[#0d111c] border border-[#22242c] hover:border-[#3c3cc4] hover:bg-[#3c3cc4]/10 transition-all group"
          >
            <ArrowDown className="w-5 h-5 text-[#b4bcd0] group-hover:text-[#3c3cc4] transition-colors" />
          </button>
        </div>

        {/* Output Token */}
        <div className="bg-[#1d1e24] rounded-xl p-4 mt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#85868b]">You Receive</span>
            {isConnected && outputToken && (
              <span className="text-sm text-[#85868b]">
                Balance: {formatNumber(outputBalance, 4)}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <Input
              type="number"
              placeholder="0.0"
              value={outputAmount}
              onChange={(e) => setOutputAmount(e.target.value)}
              className="flex-1 bg-transparent border-0 text-2xl font-medium text-white placeholder:text-[#596070] focus-visible:ring-0 p-0"
            />
            <button
              onClick={() => setShowTokenSelector('output')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0d111c] border border-[#22242c] hover:border-[#3c3cc4]/50 transition-colors"
            >
              {outputToken ? (
                <>
                  <img 
                    src={outputToken.logoURI || '/tokens/unknown.png'} 
                    alt={outputToken.symbol}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-medium text-white">{outputToken.symbol}</span>
                </>
              ) : (
                <span className="font-medium text-white">Select</span>
              )}
              <ChevronDown className="w-4 h-4 text-[#85868b]" />
            </button>
          </div>
        </div>

        {/* Trade Details */}
        {trade && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#85868b]">Rate</span>
              <span className="text-white">
                1 {inputToken?.symbol} = {formatNumber(trade.price, 6)} {outputToken?.symbol}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#85868b]">Price Impact</span>
              <span className={getPriceImpactColor(trade.priceImpact)}>
                {formatNumber(trade.priceImpact, 2)}%
              </span>
            </div>
            
            <TooltipProvider>
              <div className="flex items-center justify-between text-sm">
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1 text-[#85868b]">
                    Minimum Received
                    <Info className="w-3 h-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.</p>
                  </TooltipContent>
                </Tooltip>
                <span className="text-white">
                  {formatNumber(trade.minimumReceived, 4)} {outputToken?.symbol}
                </span>
              </div>
            </TooltipProvider>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#85868b]">Liquidity Provider Fee</span>
              <span className="text-white">
                {formatNumber(trade.liquidityProviderFee, 4)} {inputToken?.symbol}
              </span>
            </div>
          </div>
        )}

        {/* Swap Button */}
        <Button
          onClick={handleSwap}
          disabled={isButtonDisabled()}
          className={`w-full mt-4 py-6 rounded-xl font-medium text-lg transition-all ${
            !isConnected
              ? 'bg-gradient-to-r from-[#2d62ff] to-[#7b61ff] hover:opacity-90 text-white'
              : trade?.priceImpact && trade.priceImpact > 5
              ? 'bg-[#ef4444] hover:bg-[#ef4444]/90 text-white'
              : 'bg-gradient-to-r from-[#2d62ff] to-[#7b61ff] hover:opacity-90 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSwapping ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            getButtonText()
          )}
        </Button>
      </div>

      {/* Token Selector Modal */}
      {showTokenSelector && (
        <TokenSelectorModal
          isOpen={!!showTokenSelector}
          onClose={() => setShowTokenSelector(null)}
          onSelect={(token) => {
            if (showTokenSelector === 'input') {
              setInputToken(token);
            } else {
              setOutputToken(token);
            }
            setShowTokenSelector(null);
          }}
          selectedToken={showTokenSelector === 'input' ? inputToken : outputToken}
          otherToken={showTokenSelector === 'input' ? outputToken : inputToken}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}
