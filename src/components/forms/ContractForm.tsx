import { FC } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../../services/api";
import { Button } from "../ui/Button";
import { useFormProgressStore } from "../../store/useFormProgressStore";
import { useTransactionStore } from "../../hooks/useTransaction";
import { toast } from "react-toastify";

const contractValidationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  description: Yup.string().required("Description is required"),
  image: Yup.string()
    .url("Must be a valid URL")
    .required("Image URL is required"),
  chain: Yup.string().required("Chain is required"),
});

export const ContractForm: FC = () => {
  const { setFormData, setCurrentStep, isProcessing, setProcessing } =
    useFormProgressStore();
  const addTransaction = useTransactionStore((state) => state.addTransaction);

  const { data: chainsData, isLoading: chainsLoading } = useQuery({
    queryKey: ["chains"],
    queryFn: apiService.getChains,
  });

  const checkDeploymentStatus = async (deploymentId: string) => {
    setProcessing(true);
    let attempts = 0;
    const maxAttempts = 12;

    const pollStatus = async () => {
      try {
        const statusResponse = await apiService.getContractDeployment(
          deploymentId
        );
        console.log("Status check response:", statusResponse);

        if (statusResponse.result.status === "SUCCEEDED") {
          // Changed from SUCCESS to SUCCEEDED
          setFormData({
            contractDeployment: {
              ...statusResponse.result,
              address: statusResponse.result.address,
            },
          });

          addTransaction({
            id: deploymentId,
            type: "CONTRACT_DEPLOYMENT",
            status: "SUCCEEDED",
            data: statusResponse.result,
          });

          setCurrentStep(2);
          toast.success("Contract deployed successfully!");
          setProcessing(false);
          return;
        } else if (statusResponse.result.status === "FAILED") {
          toast.error("Contract deployment failed");
          setProcessing(false);

          return;
        }

        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(pollStatus, 5000);
        } else {
          toast.error("Deployment timeout");
          setProcessing(false);
        }
      } catch (error) {
        console.error("Status check failed:", error);
        toast.error("Failed to check deployment status");
        setProcessing(false);
      }
    };

    pollStatus();
  };

  if (chainsLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-[#8438fd] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Formik
      initialValues={{
        name: "Ekwel Cash",
        description: "USD",
        image: "https://i.ibb.co/f0ZWgzZ/100usdbill.jpg",
        chain: "MATIC",
        externalUrl: "https://www.venly.io/",
      }}
      validationSchema={contractValidationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          console.log("Starting contract deployment...");
          // First API call to get deployment ID
          const deployResponse = await apiService.deployContract(values);
          console.log("Deployment response:", deployResponse);

          const deploymentId = deployResponse.result.id;

          setFormData({
            contractDeployment: deployResponse.result,
          });

          addTransaction({
            id: deploymentId,
            type: "CONTRACT_DEPLOYMENT",
            status: "PENDING",
            data: deployResponse.result,
          });

          // Start checking status using deploymentId
          checkDeploymentStatus(deploymentId);
          toast.info("Contract deployment initiated. Please wait...");
        } catch (error) {
          console.error("Contract deployment failed:", error);
          toast.error("Failed to deploy contract");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, errors, touched, getFieldProps }) => (
        <Form className="space-y-6">
          <div>
            <label className="block text-[#30374f] mb-1">Name</label>
            <input
              type="text"
              {...getFieldProps("name")}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8438fd]"
            />
            {errors.name && touched.name && (
              <div className="text-red-500 text-sm mt-1">
                {String(errors.name)}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[#30374f] mb-1">Description</label>
            <textarea
              {...getFieldProps("description")}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8438fd]"
            />
            {errors.description && touched.description && (
              <div className="text-red-500 text-sm mt-1">
                {String(errors.description)}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[#30374f] mb-1">Image URL</label>
            <input
              type="url"
              {...getFieldProps("image")}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8438fd]"
            />
            {errors.image && touched.image && (
              <div className="text-red-500 text-sm mt-1">
                {String(errors.image)}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[#30374f] mb-1">Chain</label>
            <select
              {...getFieldProps("chain")}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8438fd]"
            >
              <option value="">Select Chain</option>
              {chainsData?.result.map((chain: string) => (
                <option key={chain} value={chain}>
                  {chain}
                </option>
              ))}
            </select>
            {errors.chain && touched.chain && (
              <div className="text-red-500 text-sm mt-1">
                {String(errors.chain)}
              </div>
            )}
          </div>

          <Button
            type="submit"
            isLoading={isSubmitting || isProcessing}
            className="w-full"
          >
            Deploy Contract
          </Button>
        </Form>
      )}
    </Formik>
  );
};
