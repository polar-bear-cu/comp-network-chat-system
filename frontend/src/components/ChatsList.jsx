import { useEffect } from "react";
import NoChatsFound from "./NoChatsFound";
import { useChatStore } from "@/store/useChatStore";
import UsersLoadingSkeleton from "./UserLoadingSkeleton";
import { User } from "lucide-react";

const ChatsList = () => {
  const { getChatPartners, chats, isUsersLoading, setSelectedUser } =
    useChatStore();

  useEffect(() => {
    getChatPartners();
  }, [getChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (!Array.isArray(chats) || chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => (
        <div
          key={chat._id}
          className="p-4 rounded-lg cursor-pointer bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
          onClick={() => setSelectedUser(chat)}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border border-border">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h4 className="font-medium truncate text-foreground/90">
              {chat.username}
            </h4>
          </div>
        </div>
      ))}
    </>
  );
};
export default ChatsList;
