import { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useSwapStore } from '@/stores';
import { useChartData } from '@/hooks';
import { formatNumber, formatCurrency } from '@/lib/utils';

const TIMEFRAMES = [
  { label: '1H', value: '1H' },
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: '1Y', value: '1Y' },
];

export function PriceChart() {
  const { inputToken, outputToken } = useSwapStore();
  const [timeframe, setTimeframe] = useState('1D');
  
  const { chartData, isLoading } = useChartData(
    inputToken?.symbol || '',
    outputToken?.symbol || '',
    timeframe
  );

  if (!inputToken || !outputToken) {
    return (
      <div className="w-full max-w-xl bg-[#0d111c] border border-[#22242c] rounded-2xl p-6 flex items-center justify-center min-h-[400px]">
        <p className="text-[#85868b]">Select tokens to view price chart</p>
      </div>
    );
  }

  const isPositive = (chartData?.priceChange24h || 0) >= 0;

  // Format chart data for recharts
  const formattedData = chartData?.data.map((point) => ({
    timestamp: point.timestamp,
    price: point.price,
    volume: point.volume,
    time: new Date(point.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  })) || [];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0d111c] border border-[#22242c] rounded-xl p-3 shadow-xl">
          <p className="text-sm text-[#85868b]">{data.time}</p>
          <p className="text-lg font-medium text-white">
            {formatNumber(data.price, 6)}
          </p>
          <p className="text-xs text-[#85868b]">
            Vol: {formatCurrency(data.volume, 0, true)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-xl bg-[#0d111c] border border-[#22242c] rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <img 
              src={inputToken.logoURI} 
              alt={inputToken.symbol}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-white font-medium">{inputToken.symbol}</span>
            <span className="text-[#85868b]">/</span>
            <img 
              src={outputToken.logoURI} 
              alt={outputToken.symbol}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-white font-medium">{outputToken.symbol}</span>
          </div>
          
          {chartData && (
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold text-white">
                {formatNumber(chartData.currentPrice, 6)}
              </span>
              <span className={`flex items-center gap-1 text-sm ${isPositive ? 'text-[#20b553]' : 'text-[#ef4444]'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {formatNumber(Math.abs(chartData.priceChange24h), 2)}%
              </span>
            </div>
          )}
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 bg-[#1d1e24] rounded-lg p-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                timeframe === tf.value
                  ? 'bg-[#3c3cc4] text-white'
                  : 'text-[#85868b] hover:text-white'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Stats */}
      {chartData && (
        <div className="flex items-center gap-6 mb-4 text-sm">
          <div>
            <span className="text-[#85868b]">24h High</span>
            <p className="text-white font-medium">{formatNumber(chartData.high24h, 6)}</p>
          </div>
          <div>
            <span className="text-[#85868b]">24h Low</span>
            <p className="text-white font-medium">{formatNumber(chartData.low24h, 6)}</p>
          </div>
          <div>
            <span className="text-[#85868b]">24h Vol</span>
            <p className="text-white font-medium">{formatCurrency(chartData.volume24h, 0, true)}</p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-[300px]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#3c3cc4]/30 border-t-[#3c3cc4] rounded-full animate-spin" />
          </div>
        ) : formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? '#20b553' : '#ef4444'} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={isPositive ? '#20b553' : '#ef4444'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#22242c" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#596070" 
                tick={{ fill: '#596070', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                domain={['auto', 'auto']}
                stroke="#596070" 
                tick={{ fill: '#596070', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatNumber(value, 4)}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? '#20b553' : '#ef4444'}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-[#85868b]">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
