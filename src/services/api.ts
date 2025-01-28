import axios, { AxiosError } from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { ChainResponse, ContractDeployment } from "../types/api.types";

const BASE_URL = import.meta.env.VITE_AUTH_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Add auth token to all API requests
api.interceptors.request.use(
  async (config) => {
    const authStore = useAuthStore.getState();
    console.log("Making API request to:", config.url);

    if (authStore.token) {
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
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error("API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 401) {
      useAuthStore.getState().clearToken();
    }

    return Promise.reject(error);
  }
);

export const refreshToken = async () => {
  const { email, password } = useAuthStore.getState();

  if (!email || !password) {
    throw new Error("No credentials stored");
  }

  const response = await apiService.authenticate({ email, password });
  useAuthStore.getState().setToken(response, 3600);

  return response;
};

export const apiService = {
  authenticate: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post("/token", credentials);
      return response.data;
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  },

  getChains: async (): Promise<ChainResponse> => {
    return Promise.resolve({
      success: true,
      result: ["AVAC", "BSC", "ETHEREUM", "MATIC", "ARBITRUM"],
    });
  },

  // Contract operations
  deployContract: async (contractData: ContractDeployment) => {
    try {
      console.log("Deploying contract with data:", contractData);
      const response = await api.post(
        "/venly/contracts/deployments",
        contractData
      );
      console.log("Contract deployment response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Contract deployment error:", error);
      throw error;
    }
  },

  getContractDeployment: async (deploymentId: string) => {
    try {
      const response = await api.get(
        `/venly/contracts/deployments/${deploymentId}`
      );
      return response.data;
    } catch (error) {
      console.error("Get contract deployment error:", error);
      throw error;
    }
  },

  // Token type operations
  createTokenType: async (data: {
    chain: string;
    contractAddress: string;
    creations: Array<{
      name: string;
      description: string;
      image: string;
    }>;
  }) => {
    try {
      const response = await api.post("/venly/token-types/creations", data);
      return response.data;
    } catch (error) {
      console.error("Create token type error:", error);
      throw error;
    }
  },

  getTokenTypeCreation: async (creationId: string) => {
    try {
      const response = await api.get(
        `/venly/token-types/creations/${creationId}`
      );
      return response.data;
    } catch (error) {
      console.error("Get token type creation error:", error);
      throw error;
    }
  },

  // Minting operations
  mintTokens: async (data: {
    contractAddress: string;
    chain: string;
    tokenTypeId: number;
    destinations: Array<{
      address: string;
      amount: number;
    }>;
  }) => {
    try {
      const response = await api.post("/venly/tokens/mints", data);
      return response.data;
    } catch (error) {
      console.error("Mint tokens error:", error);
      throw error;
    }
  },

  getMintStatus: async (mintId: string) => {
    try {
      const response = await api.get(`/venly/tokens/mints/${mintId}`);
      return response.data;
    } catch (error) {
      console.error("Get mint status error:", error);
      throw error;
    }
  },
};

export default apiService;
