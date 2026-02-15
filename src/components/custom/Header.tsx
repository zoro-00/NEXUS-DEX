import { useState } from 'react';
import { 
  ChevronDown, 
  Wallet, 
  ArrowRightLeft, 
  Droplets, 
  BarChart3, 
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useWalletConnection } from '@/hooks';
import { SUPPORTED_CHAINS } from '@/lib/chains';
import { shortenAddress } from '@/lib/utils';
import { WalletModal } from '../modals/WalletModal';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const { 
    address, 
    isConnected, 
    isConnecting, 
    chainId, 
    switchToChain,
    disconnectWallet,
  } = useWalletConnection();
  
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentChain = SUPPORTED_CHAINS.find(c => c.id === chainId);

  const navItems = [
    { id: 'swap', label: 'Swap', icon: ArrowRightLeft },
    { id: 'pools', label: 'Pools', icon: Droplets },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0b0f19]/80 backdrop-blur-xl border-b border-[#22242c]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <button 
                onClick={() => onTabChange('swap')}
                className="flex items-center gap-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2d62ff] to-[#7b61ff] flex items-center justify-center">
                  <ArrowRightLeft className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-semibold text-white group-hover:text-[#b4bcd0] transition-colors">
                  NEXUS
                </span>
              </button>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        activeTab === item.id
                          ? 'text-white bg-[#3c3cc4]/20'
                          : 'text-[#b4bcd0] hover:text-white hover:bg-[#22242c]/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Chain Selector */}
              {isConnected && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1d1e24] border border-[#22242c] hover:border-[#3c3cc4]/50 transition-colors">
                      {currentChain ? (
                        <>
                          <img 
                            src={currentChain.icon} 
                            alt={currentChain.name}
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="hidden sm:inline text-sm text-white">
                            {currentChain.shortName}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-[#ef4444]">Unsupported</span>
                      )}
                      <ChevronDown className="w-4 h-4 text-[#85868b]" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end"
                    className="w-48 bg-[#0d111c] border-[#22242c]"
                  >
                    {SUPPORTED_CHAINS.map((chain) => (
                      <DropdownMenuItem
                        key={chain.id}
                        onClick={() => switchToChain(chain.id)}
                        className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-[#3c3cc4]/20 ${
                          chainId === chain.id ? 'bg-[#3c3cc4]/10' : ''
                        }`}
                      >
                        <img 
                          src={chain.icon} 
                          alt={chain.name}
                          className="w-5 h-5 rounded-full"
                        />
                        <span className="text-white">{chain.name}</span>
                        {chainId === chain.id && (
                          <div className="ml-auto w-2 h-2 rounded-full bg-[#20b553]" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Connect Wallet Button */}
              {isConnected ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#2d62ff] to-[#7b61ff] hover:opacity-90 transition-opacity">
                      <div className="w-2 h-2 rounded-full bg-[#20b553] animate-pulse" />
                      <span className="text-sm font-medium text-white">
                        {shortenAddress(address!)}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end"
                    className="w-48 bg-[#0d111c] border-[#22242c]"
                  >
                    <DropdownMenuItem
                      onClick={() => disconnectWallet()}
                      className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-[#ef4444]/20 text-[#ef4444]"
                    >
                      <Wallet className="w-4 h-4" />
                      Disconnect
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => setShowWalletModal(true)}
                  disabled={isConnecting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#2d62ff] to-[#7b61ff] hover:opacity-90 transition-opacity text-white font-medium"
                >
                  {isConnecting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Wallet className="w-4 h-4" />
                  )}
                  Connect Wallet
                </Button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-[#1d1e24] border border-[#22242c]"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-[#22242c]">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === item.id
                        ? 'text-white bg-[#3c3cc4]/20'
                        : 'text-[#b4bcd0] hover:text-white hover:bg-[#22242c]/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      {/* Wallet Modal */}
      <WalletModal 
        isOpen={showWalletModal} 
        onClose={() => setShowWalletModal(false)} 
      />
    </>
  );
}
