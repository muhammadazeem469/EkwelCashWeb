import { FC } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { AuthForm } from "./components/forms/AuthForm";
import { ContractForm } from "./components/forms/ContractForm";
import { TokenTypeForm } from "./components/forms/TokenTypeForm";
import { MintForm } from "./components/forms/MintForm";
import { useAuthStore } from "./store/useAuthStore";
import { useFormProgressStore } from "./store/useFormProgressStore";
import { motion, AnimatePresence } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "./components/ui/Button";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const App: FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const clearToken = useAuthStore((state) => state.clearToken);
  const { currentStep, resetProgress, isProcessing } = useFormProgressStore();

  const steps = [
    { number: 1, label: "Contract Deployment" },
    { number: 2, label: "Token Type Creation" },
    { number: 3, label: "Token Minting" },
  ];

  const handleLogout = () => {
    clearToken();
    resetProgress();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <header className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-[#30374f]">NFT Creator</h1>
            {isAuthenticated && (
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            )}
          </header>

          <main className="bg-white rounded-xl shadow-lg p-6">
            <AnimatePresence mode="wait">
              {!isAuthenticated ? (
                <motion.div
                  key="auth-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AuthForm />
                </motion.div>
              ) : (
                <motion.div
                  key="main-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Step Indicators */}
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-center space-x-4">
                      {steps.map((step, index) => (
                        <div key={step.number} className="flex items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                              step.number <= currentStep
                                ? "bg-[#8438fd] text-white"
                                : "bg-gray-200 text-[#30374f]"
                            }`}
                          >
                            {step.number}
                          </div>
                          {index < steps.length - 1 && (
                            <div
                              className={`h-1 w-16 mx-2 transition-all duration-300 ${
                                step.number < currentStep
                                  ? "bg-[#8438fd]"
                                  : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between px-4">
                      {steps.map((step) => (
                        <span
                          key={step.number}
                          className={`text-sm ${
                            step.number <= currentStep
                              ? "text-[#8438fd]"
                              : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-4 mb-8">
                      {[1, 2, 3].map((step) => (
                        <div
                          key={step}
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step <= currentStep
                              ? "bg-[#8438fd] text-white"
                              : "bg-gray-200 text-[#30374f]"
                          } ${isProcessing ? "opacity-50" : ""}`}
                        >
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form Content */}
                  <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                      <motion.div
                        key="contract-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ContractForm />
                      </motion.div>
                    )}
                    {currentStep === 2 && (
                      <motion.div
                        key="token-type-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <TokenTypeForm />
                      </motion.div>
                    )}
                    {currentStep === 3 && (
                      <motion.div
                        key="mint-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <MintForm />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </QueryClientProvider>
  );
};

export default App;
