import { FC } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useFormProgressStore } from "../../store/useFormProgressStore";
import { apiService } from "../../services/api";
import { Button } from "../ui/Button";
import { useTransactionStore } from "../../hooks/useTransaction";
import { toast } from "react-toastify";

const tokenTypeValidationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  description: Yup.string().required("Description is required"),
  image: Yup.string()
    .url("Must be a valid URL")
    .required("Image URL is required"),
});

export const TokenTypeForm: FC = () => {
  const { formData, setFormData, setCurrentStep } = useFormProgressStore();
  const addTransaction = useTransactionStore((state) => state.addTransaction);

  const pollTokenTypeStatus = async (creationId: string) => {
    let attempts = 0;
    const maxAttempts = 12; // 1 minute (12 * 5 seconds)

    const checkStatus = async () => {
      try {
        const statusResponse = await apiService.getTokenTypeCreation(
          creationId
        );

        if (statusResponse.result.status === "SUCCEEDED") {
          // Store complete metadata including all image fields
          setFormData({
            ...formData,
            tokenType: {
              ...statusResponse.result,
              metadata: {
                ...statusResponse.result.metadata,
                image: statusResponse.result.metadata.image,
                imagePreview: statusResponse.result.metadata.image,
                imageThumbnail: statusResponse.result.metadata.image,
                contract: {
                  ...statusResponse.result.metadata.contract,
                  image: statusResponse.result.metadata.image,
                  imageUrl: statusResponse.result.metadata.image,
                  image_url: statusResponse.result.metadata.image,
                },
              },
            },
          });

          addTransaction({
            id: creationId,
            type: "TOKEN_CREATION",
            status: "SUCCEEDED",
            data: {
              ...statusResponse.result,
              metadata: {
                ...statusResponse.result.metadata,
                image: statusResponse.result.metadata.image,
                imagePreview: statusResponse.result.metadata.image,
                imageThumbnail: statusResponse.result.metadata.image,
                contract: {
                  ...statusResponse.result.metadata.contract,
                  image: statusResponse.result.metadata.image,
                  imageUrl: statusResponse.result.metadata.image,
                  image_url: statusResponse.result.metadata.image,
                },
              },
            },
          });

          setCurrentStep(3);
          toast.success("Token type created successfully!");
          return;
        } else if (statusResponse.result.status === "FAILED") {
          toast.error("Token type creation failed");
          return;
        }

        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkStatus, 5000); // Check every 5 seconds
        } else {
          toast.error("Creation timeout");
        }
      } catch (error) {
        console.error("Status check failed:", error);
        toast.error("Failed to check creation status");
      }
    };

    checkStatus();
  };

  return (
    <Formik
      initialValues={{
        name: "Ekwel Cash",
        description: "USD",
        image:
          formData.contractDeployment?.image ||
          "https://i.ibb.co/f0ZWgzZ/100usdbill.jpg",
      }}
      validationSchema={tokenTypeValidationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          if (
            !formData.contractDeployment?.chain ||
            !formData.contractDeployment?.address
          ) {
            toast.error("Contract deployment data is missing");
            return;
          }

          const response = await apiService.createTokenType({
            chain: formData.contractDeployment.chain,
            contractAddress: formData.contractDeployment.address,
            creations: [
              {
                name: values.name,
                description: values.description,
                image: values.image,
              },
            ],
          });

          // Store token type data with complete image fields
          setFormData({
            ...formData,
            tokenType: {
              ...response.result.creations[0],
              metadata: {
                ...response.result.creations[0].metadata,
                image: values.image,
                imagePreview: values.image,
                imageThumbnail: values.image,
                contract: {
                  ...response.result.creations[0].metadata.contract,
                  image: values.image,
                  imageUrl: values.image,
                  image_url: values.image,
                },
              },
            },
          });

          addTransaction({
            id: response.result.creations[0].id,
            type: "TOKEN_CREATION",
            status: "PENDING",
            data: {
              ...response.result.creations[0],
              metadata: {
                ...response.result.creations[0].metadata,
                image: values.image,
                imagePreview: values.image,
                imageThumbnail: values.image,
                contract: {
                  ...response.result.creations[0].metadata.contract,
                  image: values.image,
                  imageUrl: values.image,
                  image_url: values.image,
                },
              },
            },
          });

          pollTokenTypeStatus(response.result.creations[0].id);
          toast.info("Token type creation initiated. Please wait...");
        } catch (error) {
          console.error("Token type creation failed:", error);
          toast.error("Failed to create token type");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, errors, touched, getFieldProps }) => (
        <Form className="space-y-6">
          <div>
            <label className="block text-[#30374f] mb-1">Token Name</label>
            <input
              type="text"
              {...getFieldProps("name")}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8438fd]"
            />
            {errors.name && touched.name && (
              <div className="text-red-500 text-sm mt-1">{errors.name}</div>
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
                {errors.description}
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

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(1)}
            >
              Back
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Token Type
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
