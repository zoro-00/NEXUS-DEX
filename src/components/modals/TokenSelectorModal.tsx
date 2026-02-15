import { useState, useMemo } from 'react';
import { X, Search, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useWalletStore } from '@/stores';
import { getTokensForChain } from '@/lib/chains';
import type { Token } from '@/types';
import { formatNumber } from '@/lib/utils';

interface TokenSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  selectedToken: Token | null;
  otherToken: Token | null;
}

export function TokenSelectorModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  selectedToken,
  otherToken 
}: TokenSelectorModalProps) {
  const { chainId } = useWalletStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Get tokens for current chain
  const tokens = useMemo(() => {
    if (!chainId) return [];
    return getTokensForChain(chainId);
  }, [chainId]);

  // Filter tokens based on search and exclude selected token
  const filteredTokens = useMemo(() => {
    return tokens.filter((token) => {
      // Exclude the other token
      if (otherToken?.address === token.address) return false;
      
      // Filter by search
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        token.symbol.toLowerCase().includes(query) ||
        token.name.toLowerCase().includes(query) ||
        token.address.toLowerCase() === query
      );
    });
  }, [tokens, searchQuery, otherToken]);

  // Toggle favorite
  const toggleFavorite = (address: string) => {
    setFavorites((prev) =>
      prev.includes(address)
        ? prev.filter((a) => a !== address)
        : [...prev, address]
    );
  };

  // Sort tokens: favorites first, then by balance/popularity
  const sortedTokens = useMemo(() => {
    return [...filteredTokens].sort((a, b) => {
      const aFav = favorites.includes(a.address) ? 1 : 0;
      const bFav = favorites.includes(b.address) ? 1 : 0;
      return bFav - aFav;
    });
  }, [filteredTokens, favorites]);

  // Popular tokens (first 5)
  const popularTokens = tokens.slice(0, 5);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#0d111c] border-[#22242c] p-0 overflow-hidden max-h-[80vh]">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold text-white flex items-center justify-between">
            Select Token
            <button 
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[#22242c] transition-colors"
            >
              <X className="w-5 h-5 text-[#85868b]" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85868b]" />
            <Input
              placeholder="Search by name or paste address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#1d1e24] border-[#22242c] text-white placeholder:text-[#596070] focus-visible:ring-[#3c3cc4]"
              autoFocus
            />
          </div>

          {/* Popular Tokens */}
          {!searchQuery && (
            <div className="mb-4">
              <p className="text-sm text-[#85868b] mb-2">Popular Tokens</p>
              <div className="flex flex-wrap gap-2">
                {popularTokens.map((token) => (
                  <button
                    key={token.address}
                    onClick={() => onSelect(token)}
                    disabled={selectedToken?.address === token.address}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                      selectedToken?.address === token.address
                        ? 'border-[#3c3cc4] bg-[#3c3cc4]/10'
                        : 'border-[#22242c] hover:border-[#3c3cc4]/50 hover:bg-[#1d1e24]'
                    } disabled:opacity-50`}
                  >
                    <img 
                      src={token.logoURI} 
                      alt={token.symbol}
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="text-sm text-white">{token.symbol}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Token List */}
          <div className="max-h-[300px] overflow-y-auto space-y-1">
            {sortedTokens.map((token) => (
              <button
                key={token.address}
                onClick={() => onSelect(token)}
                disabled={selectedToken?.address === token.address}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  selectedToken?.address === token.address
                    ? 'bg-[#3c3cc4]/10'
                    : 'hover:bg-[#1d1e24]'
                } disabled:opacity-50`}
              >
                <img 
                  src={token.logoURI} 
                  alt={token.symbol}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{token.symbol}</span>
                    {token.isNative && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#3c3cc4]/20 text-[#3c3cc4]">
                        Native
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#85868b]">{token.name}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Mock balance - in production, fetch real balance */}
                  <span className="text-sm text-[#85868b]">
                    {formatNumber(Math.random() * 1000, 4)}
                  </span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(token.address);
                    }}
                    className="p-1 rounded-lg hover:bg-[#22242c] transition-colors"
                  >
                    <Star 
                      className={`w-4 h-4 ${
                        favorites.includes(token.address)
                          ? 'fill-[#3c3cc4] text-[#3c3cc4]'
                          : 'text-[#596070]'
                      }`}
                    />
                  </button>
                </div>
              </button>
            ))}

            {sortedTokens.length === 0 && (
              <div className="text-center py-8">
                <p className="text-[#85868b]">No tokens found</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
