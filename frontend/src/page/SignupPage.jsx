import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLoader from "./PageLoader";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const SignupPage = () => {
  const navigate = useNavigate();
  const { checkAuth, isCheckingAuth, signup, authUser } = useAuthStore();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authUser) navigate("/chat");
  }, [authUser, navigate]);

  if (isCheckingAuth) return <PageLoader />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      await signup(formData.username.trim(), formData.password.trim());
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-primary to-secondary flex justify-center items-center px-4">
      <main className="bg-background w-full max-w-md rounded-2xl shadow-2xl p-8">
        <h1 className="text-4xl text-center font-bold text-primary mb-8">
          Register
        </h1>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          {/* Username */}
          <input
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            type="text"
            placeholder="Enter your username"
            disabled={isLoading}
            className="border p-2 rounded-md"
          />

          {/* Password */}
          <div className="relative">
            <input
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              disabled={isLoading}
              className="border w-full p-2 rounded-md pr-10"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-3"
            >
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>

          {errorMessage && (
            <p className="text-red-600 text-center">{errorMessage}</p>
          )}

          <Button
            type="submit"
            disabled={isLoading || !formData.username || !formData.password}
            className="cursor-pointer bg-primary text-white py-2 rounded-md"
          >
            {isLoading ? "Creating..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center mt-6">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="cursor-pointer text-primary underline"
          >
            Login here
          </button>
        </p>
      </main>
    </div>
  );
};

export default SignupPage;
