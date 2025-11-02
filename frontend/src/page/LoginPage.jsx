import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLoader from "./PageLoader";
import { Eye, EyeOff, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

const LoginPage = () => {
  const navigate = useNavigate();
  const { checkAuth, isCheckingAuth, login, authUser, isLoggingIn } =
    useAuthStore();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
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
    try {
      await login(formData.username.trim(), formData.password.trim());
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-primary to-secondary flex justify-center items-center px-4">
      <main className="bg-background w-full max-w-md rounded-2xl shadow-2xl p-8">
        <h1 className="text-4xl text-center font-bold text-primary mb-8">
          Login
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
            disabled={isLoggingIn}
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
              disabled={isLoggingIn}
              className="border w-full p-2 rounded-md pr-10"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="cursor-pointer disabled:cursor-not-allowed absolute right-2 top-3"
              disabled={isLoggingIn}
            >
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>

          {errorMessage && (
            <p className="text-destructive text-center">{errorMessage}</p>
          )}

          <Button
            type="submit"
            disabled={isLoggingIn || !formData.username || !formData.password}
            className="bg-primary text-white py-2 rounded-md"
          >
            {isLoggingIn ? "Logging in..." : "Log In"}
            {isLoggingIn && <Loader className="animate-spin" />}
          </Button>
        </form>

        <p className="text-center mt-6">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="cursor-pointer disabled:cursor-not-allowed text-primary underline"
            disabled={isLoggingIn}
          >
            Sign up here
          </button>
        </p>
      </main>
    </div>
  );
};

export default LoginPage;
