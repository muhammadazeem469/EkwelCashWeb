import { FC, useEffect } from "react";
import { usePolling } from "../../hooks/usePolling";
import { apiService } from "../../services/api";
import { useTransactionStore } from "../../hooks/useTransaction";
import { useFormProgressStore } from "../../store/useFormProgressStore";
import { Button } from "../ui/Button";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { TransactionHistory } from "./TransactionHistory";

export const StatusCheck: FC = () => {
  const { transactions } = useTransactionStore();
  const { setCurrentStep, resetProgress } = useFormProgressStore();
  const latestTransaction = transactions[0];

  const { data, isPolling, error, startPolling, attempts } = usePolling(
    () => {
      switch (latestTransaction.type) {
        case "CONTRACT_DEPLOYMENT":
          return apiService.getContractDeployment(latestTransaction.id);
        case "TOKEN_CREATION":
          return apiService.getTokenTypeCreation(latestTransaction.id);
        case "TOKEN_MINT":
          return apiService.getMintStatus(latestTransaction.id);
        default:
          throw new Error("Unknown transaction type");
      }
    },
    {
      interval: 5000,
      maxAttempts: 12,
      shouldContinue: (data) => data?.result?.status === "PENDING",
    }
  );

  useEffect(() => {
    if (data?.result?.status === "SUCCESS") {
      toast.success(`${latestTransaction.type} completed successfully!`);
    } else if (data?.result?.status === "FAILED") {
      toast.error(`${latestTransaction.type} failed!`);
    }
  }, [data?.result?.status, latestTransaction.type]);

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-[#30374f] mb-4">
          Transaction Status
        </h3>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center space-x-4">
            <div
              className={`w-3 h-3 rounded-full ${
                isPolling
                  ? "bg-yellow-400"
                  : data?.result?.status === "SUCCESS"
                  ? "bg-green-500"
                  : data?.result?.status === "FAILED"
                  ? "bg-red-500"
                  : "bg-gray-300"
              }`}
            />
            <span className="text-[#30374f]">
              Status: {data?.result?.status || "Checking..."}
            </span>
          </div>

          {attempts > 0 && (
            <div className="text-sm text-gray-500">
              Checking attempt: {attempts}/12
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm">
              Error checking status: {error.message}
            </div>
          )}
        </motion.div>

        <div className="mt-6 flex justify-between">
          <Button
            onClick={() => startPolling()}
            disabled={isPolling}
            variant="outline"
          >
            Check Status
          </Button>

          {data?.result?.status === "SUCCESS" && (
            <Button
              onClick={() => {
                resetProgress();
                setCurrentStep(1);
              }}
            >
              Start New Transaction
            </Button>
          )}
        </div>
      </div>

      <TransactionHistory />
    </div>
  );
};
