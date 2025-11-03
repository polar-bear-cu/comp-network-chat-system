import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import { formatMessageTime } from "@/lib/utils";
import TypingText from "./TypingText";

const ChatContainer = () => {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    typingUsers,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const bottomRef = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessagesByUserId(selectedUser._id);
      subscribeToMessages();
    }

    return () => unsubscribeFromMessages();
  }, [
    selectedUser,
    getMessagesByUserId,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isSelectedUserTyping = selectedUser && typingUsers[selectedUser._id];

  return (
    <>
      <ChatHeader />
      <div className="flex-1 px-6 overflow-y-auto py-8 bg-transparent">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => {
              const isMe = msg.senderId === authUser._id;
              return (
                <div
                  key={msg._id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`relative rounded-lg p-4 border border-border max-w-[75%] whitespace-pre-wrap wrap-break-word shadow-sm ${
                      isMe
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-card-foreground"
                    }`}
                  >
                    {msg.text && <p>{msg.text}</p>}
                    <p className="text-xs mt-1 opacity-70 text-foreground">
                      {formatMessageTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}

            {isSelectedUserTyping && (
              <div className="flex justify-start">
                <TypingText username={selectedUser.username} />
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser?.username} />
        )}
      </div>

      <MessageInput />
    </>
  );
};

export default ChatContainer;
