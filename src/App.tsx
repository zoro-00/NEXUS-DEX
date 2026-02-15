import { useState, useEffect } from 'react';
import { Header } from '@/components/custom/Header';
import { SwapSection, PoolsSection, AnalyticsSection } from '@/sections';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { useWalletStore } from '@/stores';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('swap');
  const { transactions } = useWalletStore();

  // Watch for transaction updates and show notifications
  useEffect(() => {
    const latestTx = transactions[0];
    if (latestTx) {
      const timeSinceTx = Date.now() - latestTx.timestamp;
      if (timeSinceTx < 5000) { // Only show for recent transactions
        if (latestTx.status === 'success') {
          toast.success(latestTx.description, {
            description: 'Transaction confirmed successfully',
            action: {
              label: 'View',
              onClick: () => {
                const { getExplorerTxUrl } = require('@/lib/utils');
                window.open(getExplorerTxUrl(latestTx.chainId, latestTx.hash), '_blank');
              },
            },
          });
        } else if (latestTx.status === 'error') {
          toast.error('Transaction failed', {
            description: latestTx.description,
          });
        }
      }
    }
  }, [transactions]);

  // Render active section
  const renderSection = () => {
    switch (activeTab) {
      case 'swap':
        return <SwapSection />;
      case 'pools':
        return <PoolsSection />;
      case 'analytics':
        return <AnalyticsSection />;
      default:
        return <SwapSection />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19]">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="pt-16">
        {renderSection()}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#22242c] bg-[#0b0f19] mt-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2d62ff] to-[#7b61ff] flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
                <span className="text-xl font-semibold text-white">NEXUS</span>
              </div>
              <p className="text-sm text-[#85868b]">
                The most efficient multi-chain decentralized exchange. 
                Swap, earn, and build on the leading DEX.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {['Swap', 'Pools', 'Analytics'].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => setActiveTab(item.toLowerCase())}
                      className="text-sm text-[#85868b] hover:text-white transition-colors"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-white font-medium mb-4">Resources</h4>
              <ul className="space-y-2">
                {[
                  { label: 'Documentation', href: '#' },
                  { label: 'GitHub', href: '#' },
                  { label: 'Discord', href: '#' },
                  { label: 'Twitter', href: '#' },
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm text-[#85868b] hover:text-white transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Supported Chains */}
            <div>
              <h4 className="text-white font-medium mb-4">Supported Chains</h4>
              <div className="flex flex-wrap gap-2">
                {['Ethereum', 'BSC', 'Polygon', 'Arbitrum'].map((chain) => (
                  <span
                    key={chain}
                    className="px-3 py-1 text-xs rounded-full bg-[#1d1e24] text-[#85868b] border border-[#22242c]"
                  >
                    {chain}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-[#22242c] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#596070]">
              © 2024 Nexus DEX. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-sm text-[#85868b] hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-[#85868b] hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>

      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0d111c',
            border: '1px solid #22242c',
            color: '#ffffff',
          },
        }}
      />
    </div>
  );
}

export default App;
