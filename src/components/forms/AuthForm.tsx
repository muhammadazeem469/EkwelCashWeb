import { FC } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useAuthStore } from "../../store/useAuthStore";
import { Button } from "../ui/Button";
import { apiService } from "../../services/api";
import { toast } from "react-toastify";

const authValidationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export const AuthForm: FC = () => {
  const { setToken, setCredentials } = useAuthStore();

  return (
    <Formik
      initialValues={{
        email: "mash@example.com",
        password: "password123",
      }}
      validationSchema={authValidationSchema}
      onSubmit={async (values, { setSubmitting, setFieldError }) => {
        try {
          setCredentials(values.email, values.password);

          const response = await apiService.authenticate(values);

          if (response && response.access_token) {
            setToken(response.access_token, 3600);
            toast.success("Authentication successful!");
          } else {
            throw new Error("Invalid response format");
          }
        } catch (error) {
          console.error("Authentication error:", error);

          if (error instanceof Error) {
            toast.error(error.message || "Authentication failed");
          } else {
            toast.error(
              "Authentication failed. Please check your credentials."
            );
          }

          // Reset form submission state
          setFieldError("email", "Authentication failed");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, errors, touched, getFieldProps }) => (
        <Form className="space-y-4">
          <div>
            <label className="block text-[#30374f] mb-1">Email</label>
            <input
              type="email"
              {...getFieldProps("email")}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8438fd]"
              disabled={isSubmitting}
            />
            {errors.email && touched.email && (
              <div className="text-red-500 text-sm mt-1">{errors.email}</div>
            )}
          </div>

          <div>
            <label className="block text-[#30374f] mb-1">Password</label>
            <input
              type="password"
              {...getFieldProps("password")}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8438fd]"
              disabled={isSubmitting}
            />
            {errors.password && touched.password && (
              <div className="text-red-500 text-sm mt-1">{errors.password}</div>
            )}
          </div>

          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Authenticating..." : "Authenticate"}
          </Button>
        </Form>
      )}
    </Formik>
  );
};
