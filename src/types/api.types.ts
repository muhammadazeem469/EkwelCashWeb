export interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  "not-before-policy": number;
  scope: string;
}

export interface ChainResponse {
  success: boolean;
  result: string[];
}

export interface ContractDeployment {
  name: string;
  description: string;
  image: string;
  externalUrl: string;
  chain: string;
}

export interface ContractResponse {
  success: boolean;
  result: {
    name: string;
    description: string;
    id: string;
    address: string; // Add this property
    chain: string;
    symbol: string;
    externalUrl: string;
    image: string;
    media: any[];
    transactionHash: string;
    status: string;
    storage: {
      type: string;
      location: string;
    };
    contractUri: string;
    royalties: Record<string, unknown>;
    external_link: string;
  };
}
