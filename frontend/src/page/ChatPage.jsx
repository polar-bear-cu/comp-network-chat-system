import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLoader from "./PageLoader";

const ChatPage = () => {
  const navigate = useNavigate();
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authUser) {
      navigate("/login");
    }
  }, [authUser, navigate]);

  if (isCheckingAuth) return <PageLoader />;

  return <div>ChatPage</div>;
};

export default ChatPage;
