import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWalletStore } from '@/stores';
import { SUPPORTED_CHAINS, getChainById } from '@/lib/chains';

// Check if MetaMask is installed
export function useMetaMask() {
  const [isInstalled, setIsInstalled] = useState(false);
  
  useEffect(() => {
    setIsInstalled(typeof window !== 'undefined' && !!window.ethereum);
  }, []);
  
  return isInstalled;
}

// Main wallet connection hook
export function useWalletConnection() {
  const { 
    address, 
    chainId, 
    isConnected, 
    isConnecting, 
    connect, 
    disconnect, 
    setConnecting,
    switchChain,
  } = useWalletStore();
  
  const hasMetaMask = useMetaMask();
  const [error, setError] = useState<string | null>(null);

  // Connect with MetaMask
  const connectMetaMask = useCallback(async () => {
    if (!hasMetaMask) {
      setError('MetaMask is not installed');
      return;
    }

    setError(null);
    setConnecting(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      connect(address, chainId, provider);
    } catch (err: any) {
      console.error('Connection error:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  }, [hasMetaMask, connect, setConnecting]);

  // Connect with WalletConnect (mock implementation)
  const connectWalletConnect = useCallback(async () => {
    setError(null);
    setConnecting(true);

    try {
      // In production, this would use WalletConnect SDK
      // For demo, we'll simulate a connection
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Mock connection
      const mockAddress = '0x' + Array(40).fill(0).map(() => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      
      connect(mockAddress, 1, null);
    } catch (err: any) {
      console.error('WalletConnect error:', err);
      setError(err.message || 'Failed to connect with WalletConnect');
    } finally {
      setConnecting(false);
    }
  }, [connect, setConnecting]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    disconnect();
    setError(null);
  }, [disconnect]);

  // Switch to a different chain
  const switchToChain = useCallback(async (targetChainId: number) => {
    if (!hasMetaMask || !isConnected) return;

    const chain = getChainById(targetChainId);
    if (!chain) {
      setError('Unsupported chain');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      await provider.send('wallet_switchEthereumChain', [
        { chainId: `0x${targetChainId.toString(16)}` },
      ]);
      
      switchChain(targetChainId);
    } catch (err: any) {
      // If chain not added, try to add it
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${targetChainId.toString(16)}`,
                chainName: chain.name,
                nativeCurrency: chain.nativeCurrency,
                rpcUrls: [chain.rpcUrl],
                blockExplorerUrls: [chain.blockExplorerUrl],
              },
            ],
          });
          switchChain(targetChainId);
        } catch (addError) {
          setError('Failed to add chain');
        }
      } else {
        setError(err.message || 'Failed to switch chain');
      }
    }
  }, [hasMetaMask, isConnected, switchChain]);

  // Listen for account/chain changes
  useEffect(() => {
    if (!hasMetaMask) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== address) {
        connect(accounts[0], chainId || 1, null);
      }
    };

    const handleChainChanged = (newChainId: string) => {
      switchChain(parseInt(newChainId, 16));
    };

    const handleDisconnect = () => {
      disconnect();
    };

    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    window.ethereum?.on('chainChanged', handleChainChanged);
    window.ethereum?.on('disconnect', handleDisconnect);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
      window.ethereum?.removeListener('disconnect', handleDisconnect);
    };
  }, [hasMetaMask, address, chainId, connect, disconnect, switchChain]);

  // Auto-connect on mount if previously connected
  useEffect(() => {
    const checkConnection = async () => {
      if (!hasMetaMask) return;
      
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const address = await accounts[0].getAddress();
          const network = await provider.getNetwork();
          connect(address, Number(network.chainId), provider);
        }
      } catch (err) {
        console.error('Auto-connect error:', err);
      }
    };

    checkConnection();
  }, [hasMetaMask, connect]);

  return {
    address,
    chainId,
    isConnected,
    isConnecting,
    error,
    hasMetaMask,
    isSupportedChain: chainId ? SUPPORTED_CHAINS.some(c => c.id === chainId) : false,
    connectMetaMask,
    connectWalletConnect,
    disconnectWallet,
    switchToChain,
  };
}

// Hook for token balances
export function useTokenBalance(tokenAddress: string, decimals: number = 18) {
  const { address, isConnected } = useWalletStore();
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!isConnected || !address || !window.ethereum) {
        setBalance('0');
        return;
      }

      setIsLoading(true);
      
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        if (tokenAddress === '0x0000000000000000000000000000000000000000') {
          // Native token balance
          const balance = await provider.getBalance(address);
          setBalance(ethers.formatUnits(balance, decimals));
        } else {
          // ERC20 token balance (mock for demo)
          // In production, this would call the token contract
          await new Promise((resolve) => setTimeout(resolve, 500));
          const mockBalance = (Math.random() * 100).toFixed(decimals);
          setBalance(mockBalance);
        }
      } catch (err) {
        console.error('Balance fetch error:', err);
        setBalance('0');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [address, isConnected, tokenAddress, decimals]);

  return { balance, isLoading };
}

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
