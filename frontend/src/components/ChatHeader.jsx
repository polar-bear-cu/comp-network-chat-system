import { useEffect } from "react";
import { useChatStore } from "@/store/useChatStore";
import { UserCircle, X } from "lucide-react";

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
    <div
      className="flex justify-between items-center border-b max-h-[84px] px-6 flex-1"
      style={{
        backgroundColor: "var(--color-background)",
        borderColor: "var(--color-border)",
        color: "var(--color-foreground)",
      }}
    >
      <div className="flex items-center space-x-3">
        <div className="avatar online">
          <div
            className="w-12 rounded-full"
            style={{ backgroundColor: "var(--color-card)" }}
          >
            <UserCircle className="w-6 h-6 text-foreground/60" />
          </div>
        </div>

        <div>
          <h3 className="text-slate-200 font-medium">
            {selectedUser?.username || "No user selected"}
          </h3>
          <p className="text-slate-400 text-sm">Online</p>
        </div>
      </div>

      <button onClick={() => setSelectedUser(null)}>
        <X className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
      </button>
    </div>
  );
};

export default ChatHeader;
