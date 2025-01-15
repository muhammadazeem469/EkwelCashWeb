import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ContractDeployment {
  id: string;
  address: string;
  chain: string;
  name: string;
  description: string;
  image: string;
  status: string;
}

interface TokenType {
  id: string;
  tokenTypeId: number;
  status: string;
  metadata: {
    name: string;
    description: string;
    image: string;
  };
}

interface FormData {
  contractDeployment?: ContractDeployment;
  tokenType?: TokenType;
}

interface FormProgress {
  currentStep: number;
  maxStep: number;
  formData: FormData;
  setCurrentStep: (step: number) => void;
  setFormData: (data: Partial<FormData>) => void;
  resetProgress: () => void;
  isProcessing: boolean;
  setProcessing: (processing: boolean) => void;
}

export const useFormProgressStore = create<FormProgress>()(
  persist(
    (set) => ({
      currentStep: 1,
      maxStep: 1,
      formData: {},
      setCurrentStep: (step) =>
        set((state) => ({
          currentStep: step,
          maxStep: Math.max(state.maxStep, step),
        })),
      setFormData: (data) =>
        set((state) => ({
          ...state,
          formData: {
            ...state.formData,
            ...(data.contractDeployment && {
              contractDeployment: {
                ...state.formData.contractDeployment,
                ...data.contractDeployment,
              },
            }),
            ...(data.tokenType && {
              tokenType: {
                ...state.formData.tokenType,
                ...data.tokenType,
              },
            }),
          },
        })),
      resetProgress: () => set({ currentStep: 1, maxStep: 1, formData: {} }),
      isProcessing: false,
      setProcessing: (processing) => set({ isProcessing: processing }),
    }),
    {
      name: "form-progress",
    }
  )
);
