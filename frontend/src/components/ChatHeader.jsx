import { useEffect } from "react";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { User, X } from "lucide-react";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);

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
        <div className="w-12 h-12 rounded-full flex items-center justify-center border border-border relative">
          <User className="w-8 h-8 text-primary" />
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-background ${
              isOnline ? "bg-green-500" : "bg-gray-500"
            }`}
          />
        </div>

        <div>
          <h3 className="text-foreground font-medium">
            {selectedUser.username}
          </h3>
          <p
            className={`text-sm ${
              isOnline ? "text-green-500" : "text-gray-400"
            }`}
          >
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <button onClick={() => setSelectedUser(null)}>
        <X className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
      </button>
    </div>
  );
};

export default ChatHeader;
