import { useEffect, useState } from 'react';
import { ArrowUpDown, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { usePoolStore, useWalletStore } from '@/stores';
import { formatCurrency, formatNumber, getAprColor } from '@/lib/utils';
import { AddLiquidityModal } from '../modals/AddLiquidityModal';

type SortField = 'tvl' | 'volume24h' | 'fees24h' | 'apr';
type SortDirection = 'asc' | 'desc';

export function PoolTable() {
  const { isConnected, address, chainId } = useWalletStore();
  const { 
    pools, 
    isLoadingPools, 
    selectedPool,
    positions,
    showAddLiquidityModal,
    setSelectedPool,
    setShowAddLiquidityModal,
    fetchPools,
    fetchPositions,
  } = usePoolStore();

  const [sortField, setSortField] = useState<SortField>('tvl');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Fetch pools on mount and when chain changes
  useEffect(() => {
    if (chainId) {
      fetchPools(chainId);
    }
  }, [chainId, fetchPools]);

  // Fetch positions when connected
  useEffect(() => {
    if (isConnected && address && chainId) {
      fetchPositions(address, chainId);
    }
  }, [isConnected, address, chainId, fetchPositions]);

  // Sort pools
  const sortedPools = [...pools].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sort icon
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-[#596070]" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-[#3c3cc4]" />
    ) : (
      <ChevronDown className="w-4 h-4 text-[#3c3cc4]" />
    );
  };

  return (
    <div className="w-full">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#0d111c] border border-[#22242c] rounded-xl p-4">
          <p className="text-sm text-[#85868b] mb-1">Total Value Locked</p>
          <p className="text-2xl font-semibold text-white">
            {formatCurrency(pools.reduce((sum, p) => sum + p.tvl, 0), 0, true)}
          </p>
        </div>
        <div className="bg-[#0d111c] border border-[#22242c] rounded-xl p-4">
          <p className="text-sm text-[#85868b] mb-1">24h Volume</p>
          <p className="text-2xl font-semibold text-white">
            {formatCurrency(pools.reduce((sum, p) => sum + p.volume24h, 0), 0, true)}
          </p>
        </div>
        <div className="bg-[#0d111c] border border-[#22242c] rounded-xl p-4">
          <p className="text-sm text-[#85868b] mb-1">24h Fees</p>
          <p className="text-2xl font-semibold text-white">
            {formatCurrency(pools.reduce((sum, p) => sum + p.fees24h, 0), 0, true)}
          </p>
        </div>
      </div>

      {/* User Positions */}
      {isConnected && positions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-4">Your Positions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {positions.map((position) => (
              <div 
                key={position.poolId}
                className="bg-[#0d111c] border border-[#22242c] rounded-xl p-4 hover:border-[#3c3cc4]/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex -space-x-2">
                    <img 
                      src={position.token0.logoURI} 
                      alt={position.token0.symbol}
                      className="w-8 h-8 rounded-full border-2 border-[#0d111c]"
                    />
                    <img 
                      src={position.token1.logoURI} 
                      alt={position.token1.symbol}
                      className="w-8 h-8 rounded-full border-2 border-[#0d111c]"
                    />
                  </div>
                  <span className="font-medium text-white">
                    {position.token0.symbol}/{position.token1.symbol}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#85868b]">Value</span>
                    <span className="text-white">{formatCurrency(position.valueUSD)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#85868b]">Share</span>
                    <span className="text-white">{formatNumber(position.share, 4)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#85868b]">{position.token0.symbol}</span>
                    <span className="text-white">{formatNumber(position.amount0, 4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#85868b]">{position.token1.symbol}</span>
                    <span className="text-white">{formatNumber(position.amount1, 4)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pool Table */}
      <div className="bg-[#0d111c] border border-[#22242c] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#22242c]">
          <h3 className="text-lg font-medium text-white">All Pools</h3>
        </div>
        
        {isLoadingPools ? (
          <div className="p-12 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#3c3cc4]/30 border-t-[#3c3cc4] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#22242c] hover:bg-transparent">
                  <TableHead className="text-[#85868b]">Pool</TableHead>
                  <TableHead 
                    className="text-[#85868b] cursor-pointer hover:text-white"
                    onClick={() => handleSort('tvl')}
                  >
                    <div className="flex items-center gap-1">
                      TVL
                      <SortIcon field="tvl" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-[#85868b] cursor-pointer hover:text-white"
                    onClick={() => handleSort('volume24h')}
                  >
                    <div className="flex items-center gap-1">
                      Volume 24h
                      <SortIcon field="volume24h" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-[#85868b] cursor-pointer hover:text-white"
                    onClick={() => handleSort('fees24h')}
                  >
                    <div className="flex items-center gap-1">
                      Fees 24h
                      <SortIcon field="fees24h" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-[#85868b] cursor-pointer hover:text-white"
                    onClick={() => handleSort('apr')}
                  >
                    <div className="flex items-center gap-1">
                      APR
                      <SortIcon field="apr" />
                    </div>
                  </TableHead>
                  <TableHead className="text-[#85868b]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPools.map((pool) => (
                  <TableRow 
                    key={pool.id}
                    className="border-[#22242c] hover:bg-[#1d1e24]"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
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
                        <span className="font-medium text-white">
                          {pool.token0.symbol}/{pool.token1.symbol}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      {formatCurrency(pool.tvl, 0, true)}
                    </TableCell>
                    <TableCell className="text-white">
                      {formatCurrency(pool.volume24h, 0, true)}
                    </TableCell>
                    <TableCell className="text-white">
                      {formatCurrency(pool.fees24h, 0, true)}
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${getAprColor(pool.apr)}`}>
                        {formatNumber(pool.apr, 2)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => {
                          setSelectedPool(pool);
                          setShowAddLiquidityModal(true);
                        }}
                        size="sm"
                        className="bg-[#3c3cc4] hover:bg-[#3c3cc4]/80 text-white"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add Liquidity Modal */}
      {selectedPool && (
        <AddLiquidityModal
          isOpen={showAddLiquidityModal}
          onClose={() => {
            setShowAddLiquidityModal(false);
            setSelectedPool(null);
          }}
          pool={selectedPool}
        />
      )}
    </div>
  );
}
