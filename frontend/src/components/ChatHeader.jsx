import { useEffect } from "react";
import { useChatStore } from "@/store/useChatStore";
import { User, X } from "lucide-react";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  return (
    <div className="flex justify-between items-center border-b max-h-[84px] px-6 flex-1 bg-background border-border text-foreground">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border border-border">
          <User className="w-8 h-8 text-primary" />
        </div>

        <div>
          <h3 className="text-foreground font-medium">
            {selectedUser?.username || "No user selected"}
          </h3>
          <p className="text-muted-foreground text-sm">Online</p>
        </div>
      </div>

      <button onClick={() => setSelectedUser(null)}>
        <X className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
      </button>
    </div>
  );
};

export default ChatHeader;
