import { UserCircle } from "lucide-react";

const ChatUserContainer = ({ user, onClick, isActive = false, isOnline }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between w-full p-3 rounded-xl cursor-pointer transition-all duration-200
        ${isActive ? "bg-primary/60" : "hover:bg-card/10"}
      `}
    >
      <div className="flex items-center gap-3">
        <UserCircle
          size={32}
          className="text-background dark:text-foreground"
        />
        <div className="flex flex-col overflow-hidden">
          <span className="font-semibold text-md truncate text-background dark:text-foreground">
            {user.username}
          </span>
          {isOnline ? (
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <p className="text-sm text-green-500">Online</p>
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <p className="text-sm text-gray-500">Offline</p>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatUserContainer;
