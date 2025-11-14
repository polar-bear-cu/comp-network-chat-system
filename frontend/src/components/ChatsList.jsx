import { useEffect } from "react";
import NoChatsFound from "./NoChatsFound";
import UsersLoadingSkeleton from "./UserLoadingSkeleton";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { User } from "lucide-react";

const ChatsList = () => {
  const {
    getChatPartners,
    chats,
    isUsersLoading,
    setSelectedUser,
    getUnreadCounts,
    unreadCounts,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getChatPartners();
    getUnreadCounts();
  }, [getChatPartners, getUnreadCounts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (!Array.isArray(chats) || chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => {
        const isOnline = onlineUsers.includes(chat._id);
        const unreadCount = unreadCounts[chat._id] || 0;

        return (
          <div
            key={chat._id}
            className="p-4 rounded-lg cursor-pointer bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
            onClick={() => setSelectedUser(chat)}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full relative bg-muted flex items-center justify-center border border-border">
                <User className="w-8 h-8 text-primary" />

                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-background ${
                    isOnline ? "bg-green-500" : "bg-gray-500"
                  }`}
                />
              </div>

              <div className="flex-1">
                <h4 className="font-medium truncate text-foreground/90">
                  {chat.username}
                </h4>
              </div>

              {unreadCount > 0 && (
                <div className="bg-primary text-primary-foreground text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-2">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default ChatsList;
