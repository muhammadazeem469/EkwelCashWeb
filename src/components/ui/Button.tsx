import { FC, ButtonHTMLAttributes } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  isLoading?: boolean;
}

export const Button: FC<ButtonProps> = ({
  children,
  variant = "primary",
  isLoading,
  className = "",
  ...props
}) => {
  const baseClasses =
    "px-4 py-2 rounded-lg font-medium transition-all duration-200 ease-in-out";
  const variants = {
    primary: "bg-[#8438fd] text-white hover:bg-opacity-90",
    secondary: "bg-gray-200 text-[#30374f] hover:bg-gray-300",
    outline:
      "border-2 border-[#8438fd] text-[#8438fd] hover:bg-[#8438fd] hover:text-white",
  };

  const buttonContent = (
    <button
      className={`${baseClasses} ${variants[variant]} ${className} ${
        isLoading ? "opacity-50 cursor-not-allowed" : ""
      }`}
      disabled={isLoading}
      {...props}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center"
          >
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );

  return <motion.div whileTap={{ scale: 0.98 }}>{buttonContent}</motion.div>;
};
