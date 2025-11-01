import { Loader } from "lucide-react";

const PageLoader = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-background dark:bg-card">
      <p className="text-2xl font-semibold text-primary dark:text-white animate-pulse flex items-center gap-2">
        Loading <Loader className="animate-spin" />
      </p>
    </div>
  );
};

export default PageLoader;
