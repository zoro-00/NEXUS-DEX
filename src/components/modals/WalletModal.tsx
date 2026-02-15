import { useState } from 'react';
import { X, Wallet } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWalletConnection } from '@/hooks';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WALLETS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    description: 'Connect to your MetaMask wallet',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    description: 'Scan with WalletConnect to connect',
    icon: 'https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Icon/Blue%20(Default)/Icon.svg',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    description: 'Connect to your Coinbase wallet',
    icon: 'https://raw.githubusercontent.com/coinbase/coinbase-wallet-sdk/master/assets/coinbase-wallet-logo.png',
  },
];

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connectMetaMask, connectWalletConnect, isConnecting, error, hasMetaMask } = useWalletConnection();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const handleConnect = async (walletId: string) => {
    setSelectedWallet(walletId);
    
    if (walletId === 'metamask') {
      await connectMetaMask();
    } else if (walletId === 'walletconnect') {
      await connectWalletConnect();
    } else if (walletId === 'coinbase') {
      // Mock Coinbase connection for now, reusing WalletConnect mock
      await connectWalletConnect();
    }
    
    onClose();
    setSelectedWallet(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#0d111c] border-[#22242c] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold text-white flex items-center justify-between">
            Connect Wallet
            <button 
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[#22242c] transition-colors"
            >
              <X className="w-5 h-5 text-[#85868b]" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          <p className="text-sm text-[#85868b] mb-4">
            Connect your wallet to start trading on Nexus DEX
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30">
              <p className="text-sm text-[#ef4444]">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            {WALLETS.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleConnect(wallet.id)}
                disabled={isConnecting || (wallet.id === 'metamask' && !hasMetaMask)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  selectedWallet === wallet.id
                    ? 'border-[#3c3cc4] bg-[#3c3cc4]/10'
                    : 'border-[#22242c] hover:border-[#3c3cc4]/50 hover:bg-[#1d1e24]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <img 
                  src={wallet.icon} 
                  alt={wallet.name}
                  className="w-10 h-10"
                />
                <div className="flex-1 text-left">
                  <p className="font-medium text-white">{wallet.name}</p>
                  <p className="text-sm text-[#85868b]">
                    {wallet.id === 'metamask' && !hasMetaMask 
                      ? 'Not installed' 
                      : wallet.description}
                  </p>
                </div>
                {isConnecting && selectedWallet === wallet.id ? (
                  <div className="w-5 h-5 border-2 border-[#3c3cc4]/30 border-t-[#3c3cc4] rounded-full animate-spin" />
                ) : (
                  <Wallet className="w-5 h-5 text-[#596070]" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-[#22242c]">
            <p className="text-xs text-[#85868b] text-center">
              By connecting, you agree to our{' '}
              <a href="#" className="text-[#3c3cc4] hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-[#3c3cc4] hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
