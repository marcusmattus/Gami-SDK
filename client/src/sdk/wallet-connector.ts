import { ConnectWalletParams, ConnectWalletResponse, WalletType } from './types';

export class WalletConnector {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  /**
   * Connect to a Solana wallet
   * @param params Connection parameters
   * @returns Promise with connection result
   */
  async connectWallet(params: ConnectWalletParams): Promise<ConnectWalletResponse> {
    try {
      // First verify wallet type is enabled on the server
      const serverResponse = await fetch(`${this.apiUrl}/connect-wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify({ walletType: params.walletType }),
      });

      const serverData = await serverResponse.json();

      if (!serverResponse.ok) {
        const error = new Error(serverData.error || 'Failed to verify wallet type');
        if (params.onError) params.onError(error);
        return {
          success: false,
          error: serverData.error || 'Failed to verify wallet type',
        };
      }

      // Handle wallet connection based on type
      let publicKey: string | undefined;
      
      switch (params.walletType) {
        case 'phantom':
          publicKey = await this.connectPhantom();
          break;
        case 'solflare':
          publicKey = await this.connectSolflare();
          break;
        case 'walletconnect':
          publicKey = await this.connectWalletConnect();
          break;
        default:
          throw new Error(`Unsupported wallet type: ${params.walletType}`);
      }

      if (publicKey) {
        if (params.onSuccess) params.onSuccess(publicKey);
        return {
          success: true,
          publicKey,
        };
      } else {
        throw new Error('Failed to connect wallet');
      }
    } catch (error) {
      if (params.onError) params.onError(error instanceof Error ? error : new Error(String(error)));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Connect to Phantom wallet
   */
  private async connectPhantom(): Promise<string> {
    // Check if Phantom is installed
    const phantom = (window as any).phantom;
    
    if (!phantom?.solana?.isPhantom) {
      throw new Error('Phantom wallet is not installed');
    }

    try {
      // Connect to wallet
      const { publicKey } = await phantom.solana.connect();
      return publicKey.toString();
    } catch (error) {
      console.error('Phantom connection error:', error);
      throw new Error('Failed to connect to Phantom wallet');
    }
  }

  /**
   * Connect to Solflare wallet
   */
  private async connectSolflare(): Promise<string> {
    // Check if Solflare is installed
    const solflare = (window as any).solflare;
    
    if (!solflare?.isSolflare) {
      throw new Error('Solflare wallet is not installed');
    }

    try {
      // Connect to wallet
      await solflare.connect();
      
      if (solflare.publicKey) {
        return solflare.publicKey.toString();
      } else {
        throw new Error('Failed to get public key from Solflare');
      }
    } catch (error) {
      console.error('Solflare connection error:', error);
      throw new Error('Failed to connect to Solflare wallet');
    }
  }

  /**
   * Connect using WalletConnect
   */
  private async connectWalletConnect(): Promise<string> {
    throw new Error('WalletConnect integration is not implemented yet');
  }
}
