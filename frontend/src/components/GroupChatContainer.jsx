import { useEffect, useRef } from "react";
import MessageInput from "./MessageInput";
import { useGroupStore } from "@/store/useGroupStore";
import { useAuthStore } from "@/store/useAuthStore";
import NotMemberPlaceholder from "./NotMemberPlaceholder";
import GroupChatHeader from "./GroupChatHeader";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import NoGroupChatHistoryPlaceholder from "./NoGroupChatHistoryPlaceHolder";
import { formatMessageTime } from "@/lib/utils";

const GroupChatContainer = () => {
  const { selectedGroup, messages, isMessagesLoading, getMessagesByGroupId } =
    useGroupStore();
  const { authUser } = useAuthStore();
  const bottomRef = useRef(null);

  if (!selectedGroup) return null;

  useEffect(() => {
    if (selectedGroup?._id) {
      getMessagesByGroupId(selectedGroup._id);
    }
  }, [selectedGroup, getMessagesByGroupId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isMember = selectedGroup.members?.some((m) => m._id === authUser?._id);

  return (
    <div className="flex flex-col h-full">
      <GroupChatHeader />

      <div className="flex-1 px-6 overflow-y-auto py-8 bg-transparent">
        {!isMember ? (
          <NotMemberPlaceholder />
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : messages.length > 0 ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => {
              const isMe = msg.sender._id === authUser._id;
              return (
                <div
                  key={msg._id}
                  className={`flex flex-col ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  {!isMe && msg.sender?.username && (
                    <p className="text-xs text-muted-foreground mb-1">
                      {msg.sender.username}
                    </p>
                  )}
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
            <div ref={bottomRef} />
          </div>
        ) : (
          <NoGroupChatHistoryPlaceholder name={selectedGroup.name} />
        )}
      </div>

      {isMember && <MessageInput />}
    </div>
  );
};

export default GroupChatContainer;
