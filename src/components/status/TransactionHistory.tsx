import { FC } from "react";
import { useTransactionStore } from "../../hooks/useTransaction";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { motion } from "framer-motion";

dayjs.extend(relativeTime);

export const TransactionHistory: FC = () => {
  const { transactions } = useTransactionStore();

  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-[#30374f] mb-4">
        Transaction History
      </h3>

      <div className="space-y-4">
        {transactions.map((transaction) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border rounded-lg p-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-[#30374f]">
                  {transaction.type.replace(/_/g, " ")}
                </h4>
                <p className="text-sm text-gray-500">
                  {dayjs(transaction.timestamp).fromNow()}
                </p>
              </div>
              <div
                className={`px-2 py-1 rounded text-sm ${
                  transaction.status === "SUCCEEDED"
                    ? "bg-green-100 text-green-800"
                    : transaction.status === "FAILED"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {transaction.status}
              </div>
            </div>

            <div className="mt-2 text-sm text-gray-600">
              ID: {transaction.id}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
