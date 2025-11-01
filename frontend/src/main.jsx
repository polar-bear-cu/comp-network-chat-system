import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import LandingPage from "./page/LandingPage.jsx";
import LoginPage from "./page/LoginPage";
import SignupPage from "./page/SignupPage";
import ChatPage from "./page/ChatPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  { path: "/signup", element: <SignupPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/chat", element: <ChatPage /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
