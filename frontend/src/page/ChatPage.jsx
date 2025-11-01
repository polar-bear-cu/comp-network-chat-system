import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLoader from "./PageLoader";
import ChatUserContainer from "@/elements/ChatUserContainer";
import { Button } from "@/components/ui/button";
import LogoutPopup from "@/elements/LogoutPopup";
import { ChevronLeft } from "lucide-react";

const staticChatUsers = [
  { id: "2", username: "Bob" },
  { id: "3", username: "Charlie" },
];

const staticMessages = [
  { id: "m1", username: "Alice", message: "Hello Bob!", isMe: true },
  { id: "m2", username: "Bob", message: "Hi Alice!", isMe: false },
];

const ChatPage = () => {
  const navigate = useNavigate();
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();

  const [chatUsers] = useState(staticChatUsers);
  const [activeChatId, setActiveChatId] = useState(
    staticChatUsers[0]?.id || null
  );
  const [openLogoutPopup, setOpenLogoutPopup] = useState(false);
  const [onlineFriends] = useState(staticChatUsers.map((u) => u.id)); // all online for demo
  const [isRightPanelOpenMobile, setRightPanelOpenMobile] = useState(false);

  const activeUser = chatUsers.find((c) => c.id === activeChatId);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authUser) navigate("/login");
  }, [authUser, navigate]);

  if (isCheckingAuth) return <PageLoader />;

  return (
    <div className="w-full h-screen flex bg-linear-to-tl from-primary to-secondary dark:from-primary/70 dark:to-secondary/70 overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-full md:max-w-[400px] shrink-0 h-full bg-linear-to-br from-primary to-primary/10 dark:from-primary/20 dark:to-primary/5 backdrop-blur-lg flex flex-col">
        <h2 className="sticky top-0 bg-card text-primary dark:text-white text-2xl font-bold p-3 shadow-md z-10 mb-2">
          Your Chats
        </h2>

        <ul className="flex-1 overflow-y-auto space-y-2 p-3">
          {chatUsers.map((chatUser) => (
            <ChatUserContainer
              key={chatUser.id}
              user={chatUser}
              onClick={() => {
                setActiveChatId(chatUser.id);
                if (window.innerWidth < 768) setRightPanelOpenMobile(true);
              }}
              isActive={chatUser.id === activeChatId}
              isOnline={onlineFriends.includes(chatUser.id)}
            />
          ))}
        </ul>

        <div className="w-full h-20 bg-card text-primary dark:text-white p-3 shadow-md z-10 relative flex justify-between gap-4">
          <div>
            <p className="text-sm">Logged in as:</p>
            <p className="font-bold">{authUser?.username ?? "Unknown"}</p>
          </div>
          <Button
            className="cursor-pointer"
            variant="destructive"
            onClick={() => setOpenLogoutPopup(true)}
          >
            Log out
          </Button>
        </div>
      </aside>

      {/* Right Panel */}
      <main
        className={`fixed md:static top-0 right-0 w-full md:flex-1 h-full bg-background flex flex-col z-30 transition-transform duration-300
        ${
          isRightPanelOpenMobile
            ? "translate-x-0"
            : "translate-x-full md:translate-x-0"
        }`}
      >
        {activeUser ? (
          <>
            {/* Header */}
            <div className="sticky text-primary top-0 p-3 text-2xl font-bold border-b border-border bg-card flex items-center gap-2">
              <button
                className="md:hidden cursor-pointer p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => setRightPanelOpenMobile(false)}
              >
                <ChevronLeft size={22} />
              </button>
              {activeUser.username}
            </div>

            {/* Messages */}
            <ul className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {staticMessages.map((msg) => (
                <li
                  key={msg.id}
                  className={`flex ${
                    msg.isMe ? "justify-end" : "justify-start"
                  }`}
                >
                  <span
                    className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                      msg.isMe
                        ? "bg-primary text-white"
                        : "bg-card text-primary dark:bg-gray-800 dark:text-white"
                    }`}
                  >
                    {msg.message}
                  </span>
                </li>
              ))}
            </ul>

            {/* Message Input */}
            <div className="p-4 border-t border-border flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded-lg"
              />
              <Button className="cursor-pointer">Send</Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-6xl font-bold">
            SockeTalk
          </div>
        )}
      </main>

      {/* Logout Popup */}
      {openLogoutPopup && (
        <LogoutPopup setOpenLogoutPopup={setOpenLogoutPopup} />
      )}
    </div>
  );
};

export default ChatPage;
