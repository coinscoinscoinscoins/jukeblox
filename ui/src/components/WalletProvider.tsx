import { ReactNode } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface WalletProviderProps {
  children: ReactNode;
}

// Create a client for React Query
const queryClient = new QueryClient();

export default function WalletProvider({ children }: WalletProviderProps) {

  return (
    <QueryClientProvider client={queryClient}>
      <OnchainKitProvider
      apiKey=""
          chain={baseSepolia}
          config={{ appearance: { 
            mode: 'auto',
        }
      }}
    >
      {children}
    </OnchainKitProvider>
    </QueryClientProvider>
  );
} 