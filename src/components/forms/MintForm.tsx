import { FC } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useFormProgressStore } from "../../store/useFormProgressStore";
import { apiService } from "../../services/api";
import { Button } from "../ui/Button";
import { toast } from "react-toastify";

const mintValidationSchema = Yup.object({
  address: Yup.string().required("Wallet address is required"),
  amount: Yup.number()
    .min(1, "Amount must be at least 1")
    .max(100, "Amount cannot exceed 100")
    .required("Amount is required"),
});

export const MintForm: FC = () => {
  const { formData, setCurrentStep, resetProgress } = useFormProgressStore();

  const pollMintStatus = async (mintId: string) => {
    let attempts = 0;
    const maxAttempts = 12;

    const checkStatus = async () => {
      try {
        const statusResponse = await apiService.getMintStatus(mintId);

        if (statusResponse.result.status === "SUCCEEDED") {
          toast.success("Minting completed successfully!");
          setTimeout(() => {
            resetProgress(); // Reset and go back to step 1
          }, 1500); // Small delay to show success message
          return;
        } else if (statusResponse.result.status === "FAILED") {
          toast.error("Minting failed");
          return;
        }

        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkStatus, 5000);
        } else {
          toast.error("Minting timeout");
        }
      } catch (error) {
        console.error("Status check failed:", error);
        toast.error("Failed to check minting status");
      }
    };

    checkStatus();
  };

  return (
    <Formik
      initialValues={{
        address: "",
        amount: 50,
      }}
      validationSchema={mintValidationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          const contractAddress = formData.contractDeployment?.address;
          const chain = formData.contractDeployment?.chain;
          const tokenTypeId = formData.tokenType?.tokenTypeId;

          if (!contractAddress || !chain || !tokenTypeId) {
            toast.error("Required data is missing");
            return;
          }

          await apiService.mintTokens({
            contractAddress,
            chain,
            tokenTypeId,
            destinations: [
              {
                address: values.address,
                amount: values.amount,
              },
            ],
          });

          // Rest of your code...
        } catch (error) {
          console.error("Minting failed:", error);
          toast.error("Failed to mint tokens");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, errors, touched, getFieldProps }) => (
        <Form className="space-y-6">
          <div>
            <label className="block text-[#30374f] mb-1">Wallet Address</label>
            <input
              type="text"
              {...getFieldProps("address")}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8438fd]"
            />
            {errors.address && touched.address && (
              <div className="text-red-500 text-sm mt-1">{errors.address}</div>
            )}
          </div>

          <div>
            <label className="block text-[#30374f] mb-1">Amount</label>
            <input
              type="number"
              {...getFieldProps("amount")}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8438fd]"
            />
            {errors.amount && touched.amount && (
              <div className="text-red-500 text-sm mt-1">{errors.amount}</div>
            )}
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(2)}
            >
              Back
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Start Minting
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
