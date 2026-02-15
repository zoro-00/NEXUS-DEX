import type { Chain, Token } from '@/types';

export const SUPPORTED_CHAINS: Chain[] = [
  {
    id: 1,
    name: 'Ethereum',
    shortName: 'ETH',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrl: import.meta.env.VITE_ETH_RPC_URL || 'https://eth.llamarpc.com',
    blockExplorerUrl: 'https://etherscan.io',
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    testnet: false,
  },
  {
    id: 56,
    name: 'BNB Smart Chain',
    shortName: 'BSC',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrl: import.meta.env.VITE_BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
    blockExplorerUrl: 'https://bscscan.com',
    icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
    testnet: false,
  },
  {
    id: 137,
    name: 'Polygon',
    shortName: 'MATIC',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrl: import.meta.env.VITE_POLYGON_RPC_URL || 'https://polygon-rpc.com',
    blockExplorerUrl: 'https://polygonscan.com',
    icon: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
    testnet: false,
  },
  {
    id: 42161,
    name: 'Arbitrum One',
    shortName: 'ARB',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrl: import.meta.env.VITE_ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
    blockExplorerUrl: 'https://arbiscan.io',
    icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
    testnet: false,
  },
];

export const DEFAULT_CHAIN = SUPPORTED_CHAINS[0];

// Popular tokens for each chain
export const POPULAR_TOKENS: Record<number, Token[]> = {
  1: [
    {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
      chainId: 1,
      logoURI: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    },
    {
      address: '0xA0b86a33E6441e6C7D3D4B4f6c7D3D4B4f6c7D3',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      chainId: 1,
      logoURI: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    },
    {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      chainId: 1,
      logoURI: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
    },
    {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      name: 'Dai Stablecoin',
      symbol: 'DAI',
      decimals: 18,
      chainId: 1,
      logoURI: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
    },
    {
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      name: 'Wrapped BTC',
      symbol: 'WBTC',
      decimals: 8,
      chainId: 1,
      logoURI: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png',
    },
  ],
  56: [
    {
      address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      name: 'Wrapped BNB',
      symbol: 'WBNB',
      decimals: 18,
      chainId: 56,
      logoURI: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
    },
    {
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 18,
      chainId: 56,
      logoURI: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    },
    {
      address: '0x55d398326f99059fF775485246999027B3197955',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 18,
      chainId: 56,
      logoURI: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
    },
    {
      address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
      name: 'Dai Stablecoin',
      symbol: 'DAI',
      decimals: 18,
      chainId: 56,
      logoURI: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
    },
    {
      address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
      name: 'BTCB Token',
      symbol: 'BTCB',
      decimals: 18,
      chainId: 56,
      logoURI: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    },
  ],
  137: [
    {
      address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
      chainId: 137,
      logoURI: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    },
    {
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      chainId: 137,
      logoURI: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    },
    {
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      chainId: 137,
      logoURI: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
    },
    {
      address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      name: 'Dai Stablecoin',
      symbol: 'DAI',
      decimals: 18,
      chainId: 137,
      logoURI: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
    },
    {
      address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
      name: 'Wrapped BTC',
      symbol: 'WBTC',
      decimals: 8,
      chainId: 137,
      logoURI: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png',
    },
  ],
  42161: [
    {
      address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
      chainId: 42161,
      logoURI: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    },
    {
      address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      chainId: 42161,
      logoURI: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    },
    {
      address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      chainId: 42161,
      logoURI: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
    },
    {
      address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      name: 'Dai Stablecoin',
      symbol: 'DAI',
      decimals: 18,
      chainId: 42161,
      logoURI: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
    },
    {
      address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
      name: 'Wrapped BTC',
      symbol: 'WBTC',
      decimals: 8,
      chainId: 42161,
      logoURI: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png',
    },
  ],
};

// Get native token for chain
export function getNativeToken(chainId: number): Token {
  const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
  if (!chain) throw new Error(`Chain ${chainId} not supported`);
  
  return {
    address: '0x0000000000000000000000000000000000000000',
    name: chain.nativeCurrency.name,
    symbol: chain.nativeCurrency.symbol,
    decimals: chain.nativeCurrency.decimals,
    chainId,
    isNative: true,
    logoURI: chain.icon,
  };
}

// Get tokens for chain
export function getTokensForChain(chainId: number): Token[] {
  const nativeToken = getNativeToken(chainId);
  const popularTokens = POPULAR_TOKENS[chainId] || [];
  return [nativeToken, ...popularTokens];
}

// Get chain by ID
export function getChainById(chainId: number): Chain | undefined {
  return SUPPORTED_CHAINS.find(c => c.id === chainId);
}

// Format chain ID for display
export function formatChainId(chainId: number): string {
  const chain = getChainById(chainId);
  return chain?.shortName || chainId.toString();
}
