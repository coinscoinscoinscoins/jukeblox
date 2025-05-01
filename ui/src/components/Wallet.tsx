import '@coinbase/onchainkit/styles.css';
import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownDisconnect, WalletDropdownLink } from "@coinbase/onchainkit/wallet";

export const WalletComponent = () => {
  return (
    <Wallet>
      <ConnectWallet>
        Connect Wallet
      </ConnectWallet>
      <WalletDropdown>
        <WalletDropdownLink
          icon="wallet"
          href="/wallet"
        >
          Wallet
        </WalletDropdownLink>
        <WalletDropdownDisconnect />
      </WalletDropdown>
    </Wallet>
  );
}; 