import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLoader from "./PageLoader";

const LoginPage = () => {
  const navigate = useNavigate();
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authUser) {
      navigate("/chat");
    }
  }, [authUser]);

  if (isCheckingAuth) return <PageLoader />;

  return <div>LoginPage</div>;
};

export default LoginPage;
