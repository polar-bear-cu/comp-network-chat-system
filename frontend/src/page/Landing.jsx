import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

const LandingPage = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-primary to-secondary flex justify-center items-center">
      <main className="flex flex-col justify-center items-center gap-16 p-4">
        <div className="flex flex-col items-center text-white font-bold gap-4">
          <h1 className="text-6xl text-primary-foreground drop-shadow-lg">
            SockeTalk
          </h1>
          <h1 className="text-2xl">Chat Website with Socket.io</h1>
        </div>

        <Button
          className={"cursor-pointer"}
          onClick={handleClick}
          size="landing"
        >
          <p className="text-lg font-semibold text-background">Get Started</p>
        </Button>
      </main>
    </div>
  );
};

export default LandingPage;
