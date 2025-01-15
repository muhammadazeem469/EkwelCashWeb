import { FC } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useAuthStore } from "../../store/useAuthStore";
import { Button } from "../ui/Button";
import { apiService } from "../../services/api";
import { toast } from "react-toastify";

const authValidationSchema = Yup.object({
  clientId: Yup.string().required("Client ID is required"),
  clientSecret: Yup.string().required("Client Secret is required"),
});

export const AuthForm: FC = () => {
  const { setToken, setCredentials } = useAuthStore();

  return (
    <Formik
      initialValues={{
        clientId: "",
        clientSecret: "",
      }}
      validationSchema={authValidationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          // First store the credentials
          setCredentials(values.clientId, values.clientSecret);

          const formData = new URLSearchParams();
          formData.append("grant_type", "client_credentials");
          formData.append("client_id", values.clientId);
          formData.append("client_secret", values.clientSecret);

          const response = await apiService.authenticate(formData);
          setToken(response.access_token, response.expires_in);
          toast.success("Authentication successful!");
        } catch (error) {
          console.error("Authentication failed:", error);
          toast.error("Authentication failed. Please check your credentials.");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, errors, touched, getFieldProps }) => (
        <Form className="space-y-4">
          <div>
            <label className="block text-[#30374f] mb-1">Client ID</label>
            <input
              type="text"
              {...getFieldProps("clientId")}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8438fd]"
            />
            {errors.clientId && touched.clientId && (
              <div className="text-red-500 text-sm mt-1">{errors.clientId}</div>
            )}
          </div>

          <div>
            <label className="block text-[#30374f] mb-1">Client Secret</label>
            <input
              type="password"
              {...getFieldProps("clientSecret")}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8438fd]"
            />
            {errors.clientSecret && touched.clientSecret && (
              <div className="text-red-500 text-sm mt-1">
                {errors.clientSecret}
              </div>
            )}
          </div>

          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Authenticate
          </Button>
        </Form>
      )}
    </Formik>
  );
};
