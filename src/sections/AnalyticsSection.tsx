import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  PieChart, 
  Activity,
  DollarSign,
  Layers
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts';
import { usePoolStore } from '@/stores';
import { formatCurrency, formatNumber } from '@/lib/utils';

const COLORS = ['#3c3cc4', '#2d62ff', '#7b61ff', '#20b553', '#ef4444'];

// Mock TVL history data
const tvlHistoryData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  }),
  tvl: 50000000 + Math.random() * 20000000,
}));

// Mock volume data
const volumeData = Array.from({ length: 7 }, (_, i) => ({
  day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  volume: 5000000 + Math.random() * 5000000,
}));

// Mock token distribution
const tokenDistribution = [
  { name: 'ETH', value: 35 },
  { name: 'USDC', value: 25 },
  { name: 'USDT', value: 20 },
  { name: 'WBTC', value: 15 },
  { name: 'Other', value: 5 },
];

export function AnalyticsSection() {
  const { pools } = usePoolStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'volume' | 'tokens'>('overview');

  // Calculate stats
  const totalTVL = pools.reduce((sum, p) => sum + p.tvl, 0);
  const totalVolume24h = pools.reduce((sum, p) => sum + p.volume24h, 0);
  const totalFees24h = pools.reduce((sum, p) => sum + p.fees24h, 0);
  const avgApr = pools.length > 0 
    ? pools.reduce((sum, p) => sum + p.apr, 0) / pools.length 
    : 0;

  const stats = [
    {
      label: 'Total Value Locked',
      value: formatCurrency(totalTVL, 0, true),
      change: '+12.5%',
      isPositive: true,
      icon: DollarSign,
    },
    {
      label: '24h Volume',
      value: formatCurrency(totalVolume24h, 0, true),
      change: '+8.3%',
      isPositive: true,
      icon: BarChart3,
    },
    {
      label: '24h Fees',
      value: formatCurrency(totalFees24h, 0, true),
      change: '+5.2%',
      isPositive: true,
      icon: Layers,
    },
    {
      label: 'Average APR',
      value: formatNumber(avgApr, 2) + '%',
      change: '-2.1%',
      isPositive: false,
      icon: Activity,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
      className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-white mb-2">Analytics</h1>
        <p className="text-[#85868b]">
          Track protocol performance, volume, and liquidity metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#0d111c] border border-[#22242c] rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className="w-5 h-5 text-[#3c3cc4]" />
                <span className={`text-sm ${stat.isPositive ? 'text-[#20b553]' : 'text-[#ef4444]'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-sm text-[#85868b] mb-1">{stat.label}</p>
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: PieChart },
          { id: 'volume', label: 'Volume', icon: BarChart3 },
          { id: 'tokens', label: 'Tokens', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#3c3cc4] text-white'
                  : 'bg-[#1d1e24] text-[#85868b] hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TVL Chart */}
        <div className="bg-[#0d111c] border border-[#22242c] rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-4">Total Value Locked</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tvlHistoryData}>
                <defs>
                  <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3c3cc4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3c3cc4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#22242c" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#596070" 
                  tick={{ fill: '#596070', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#596070" 
                  tick={{ fill: '#596070', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(value, 0, true)}
                  width={80}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0d111c', 
                    border: '1px solid #22242c',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'TVL']}
                />
                <Area
                  type="monotone"
                  dataKey="tvl"
                  stroke="#3c3cc4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#tvlGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volume Chart */}
        <div className="bg-[#0d111c] border border-[#22242c] rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-4">Volume (7 Days)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#22242c" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="#596070" 
                  tick={{ fill: '#596070', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#596070" 
                  tick={{ fill: '#596070', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(value, 0, true)}
                  width={80}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0d111c', 
                    border: '1px solid #22242c',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Volume']}
                />
                <Bar dataKey="volume" fill="#2d62ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Token Distribution */}
        <div className="bg-[#0d111c] border border-[#22242c] rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-4">Token Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={tokenDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tokenDistribution.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0d111c', 
                    border: '1px solid #22242c',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number) => [`${value}%`, 'Share']}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {tokenDistribution.map((token, index) => (
              <div key={token.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-[#85868b]">{token.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Pools */}
        <div className="bg-[#0d111c] border border-[#22242c] rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-4">Top Pools by TVL</h3>
          <div className="space-y-3">
            {pools.slice(0, 5).map((pool, index) => (
              <div 
                key={pool.id}
                className="flex items-center justify-between p-3 bg-[#1d1e24] rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#596070] w-6">#{index + 1}</span>
                  <div className="flex -space-x-2">
                    <img 
                      src={pool.token0.logoURI} 
                      alt={pool.token0.symbol}
                      className="w-8 h-8 rounded-full border-2 border-[#1d1e24]"
                    />
                    <img 
                      src={pool.token1.logoURI} 
                      alt={pool.token1.symbol}
                      className="w-8 h-8 rounded-full border-2 border-[#1d1e24]"
                    />
                  </div>
                  <span className="text-white font-medium">
                    {pool.token0.symbol}/{pool.token1.symbol}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{formatCurrency(pool.tvl, 0, true)}</p>
                  <p className="text-sm text-[#20b553]">{formatNumber(pool.apr, 2)}% APR</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
