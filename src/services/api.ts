/* import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { ContractDeployment, TokenResponse } from "../types/api.types";

const BASE_URL = {
  AUTH: "/auth", // Updated
  API: "/api/v3", // Updated
};

const api = axios.create({
  baseURL: BASE_URL.API,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const authStore = useAuthStore.getState();

    if (!config.headers.Authorization && authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }

    // Check if token is about to expire (within 30 seconds)
    if (authStore.expiresAt && authStore.expiresAt - Date.now() < 30000) {
      try {
        await refreshToken();
        config.headers.Authorization = `Bearer ${
          useAuthStore.getState().token
        }`;
      } catch (error) {
        console.error("Token refresh failed:", error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const refreshToken = async () => {
  const { clientId, clientSecret } = useAuthStore.getState();

  if (!clientId || !clientSecret) {
    throw new Error("No credentials stored");
  }

  const formData = new URLSearchParams();
  formData.append("grant_type", "client_credentials");
  formData.append("client_id", clientId);
  formData.append("client_secret", clientSecret);

  const response = await apiService.authenticate(formData);
  useAuthStore.getState().setToken(response.access_token, response.expires_in);

  return response;
};

export const apiService = {
  authenticate: async (formData: URLSearchParams) => {
    try {
      const response = await axios.post<TokenResponse>(
        `${BASE_URL.AUTH}/realms/Arkane/protocol/openid-connect/token`,
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  },
  // Chain operations
  getChains: async () => {
    const response = await api.get("/erc20/chains");
    return response.data;
  },

  // Contract operations
  deployContract: async (contractData: ContractDeployment) => {
    const response = await api.post(
      "/erc1155/contracts/deployments",
      contractData
    );
    return response.data;
  },

  getContractDeployment: async (deploymentId: string) => {
    const response = await api.get(
      `/erc1155/contracts/deployments/${deploymentId}`
    );
    return response.data;
  },

  // Token operations
  createTokenType: async (data: {
    chain: string;
    contractAddress: string;
    creations: Array<{
      name: string;
      description: string;
      image: string;
    }>;
  }) => {
    const response = await api.post("/erc1155/token-types/creations", data);
    return response.data;
  },

  getTokenTypeCreation: async (creationId: string) => {
    const response = await api.get(
      `/erc1155/token-types/creations/${creationId}`
    );
    return response.data;
  },

  mintTokens: async (data: {
    contractAddress: string;
    chain: string;
    tokenTypeId: number;
    destinations: Array<{
      address: string;
      amount: number;
    }>;
  }) => {
    const response = await api.post("/erc1155/tokens/mints", data);
    return response.data;
  },

  getMintStatus: async (mintId: string) => {
    const response = await api.get(`/erc1155/tokens/mints/${mintId}`);
    return response.data;
  },
};
 */

import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { ContractDeployment, TokenResponse } from "../types/api.types";

const isProd = import.meta.env.PROD;
const CORS_PROXY = isProd ? "https://cors-anywhere.herokuapp.com/" : "";

/* const BASE_URL = {
  AUTH: import.meta.env.VITE_AUTH_BASE_URL,
  API: import.meta.env.VITE_API_BASE_URL,
}; */
const BASE_URL = {
  AUTH: `${CORS_PROXY}${import.meta.env.VITE_AUTH_BASE_URL}`,
  API: `${CORS_PROXY}${import.meta.env.VITE_API_BASE_URL}`,
};

const api = axios.create({
  baseURL: BASE_URL.API,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const authStore = useAuthStore.getState();

    if (!config.headers.Authorization && authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }

    if (authStore.expiresAt && authStore.expiresAt - Date.now() < 30000) {
      try {
        await refreshToken();
        config.headers.Authorization = `Bearer ${
          useAuthStore.getState().token
        }`;
      } catch (error) {
        console.error("Token refresh failed:", error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const refreshToken = async () => {
  const { clientId, clientSecret } = useAuthStore.getState();

  if (!clientId || !clientSecret) {
    throw new Error("No credentials stored");
  }

  const formData = new URLSearchParams();
  formData.append("grant_type", "client_credentials");
  formData.append("client_id", clientId);
  formData.append("client_secret", clientSecret);

  const response = await apiService.authenticate(formData);
  useAuthStore.getState().setToken(response.access_token, response.expires_in);

  return response;
};

export const apiService = {
  authenticate: async (formData: URLSearchParams) => {
    try {
      const response = await axios.post<TokenResponse>(
        `${BASE_URL.AUTH}/realms/Arkane/protocol/openid-connect/token`,
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  },

  getChains: async () => {
    return {
      success: true,
      result: ["AVAC", "BSC", "ETHEREUM", "MATIC", "ARBITRUM"],
    };
  },

  deployContract: async (contractData: ContractDeployment) => {
    const response = await api.post(
      "/erc1155/contracts/deployments",
      contractData
    );
    return response.data;
  },

  getContractDeployment: async (deploymentId: string) => {
    const response = await api.get(
      `/erc1155/contracts/deployments/${deploymentId}`
    );
    return response.data;
  },

  createTokenType: async (data: {
    chain: string;
    contractAddress: string;
    creations: Array<{
      name: string;
      description: string;
      image: string;
    }>;
  }) => {
    const response = await api.post("/erc1155/token-types/creations", data);
    return response.data;
  },

  getTokenTypeCreation: async (creationId: string) => {
    const response = await api.get(
      `/erc1155/token-types/creations/${creationId}`
    );
    return response.data;
  },

  mintTokens: async (data: {
    contractAddress: string;
    chain: string;
    tokenTypeId: number;
    destinations: Array<{
      address: string;
      amount: number;
    }>;
  }) => {
    const response = await api.post("/erc1155/tokens/mints", data);
    return response.data;
  },

  getMintStatus: async (mintId: string) => {
    const response = await api.get(`/erc1155/tokens/mints/${mintId}`);
    return response.data;
  },
};
