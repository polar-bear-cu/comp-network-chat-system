import { useEffect, useRef } from "react";
import MessageInput from "./MessageInput";
import { useGroupStore } from "@/store/useGroupStore";
import { useAuthStore } from "@/store/useAuthStore";
import NotMemberPlaceholder from "./NotMemberPlaceholder";
import GroupChatHeader from "./GroupChatHeader";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import NoGroupChatHistoryPlaceholder from "./NoGroupChatHistoryPlaceHolder";
import { formatMessageTime } from "@/lib/utils";
import { UserRoundMinus, UserRoundPlus } from "lucide-react";
import TypingText from "./TypingText";

const GroupChatContainer = () => {
  const {
    selectedGroup,
    messages,
    isMessagesLoading,
    getMessagesByGroupId,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
    groupTypingUsers,
  } = useGroupStore();
  const { authUser } = useAuthStore();
  const bottomRef = useRef(null);

  if (!selectedGroup) return null;

  useEffect(() => {
    if (selectedGroup?._id) {
      getMessagesByGroupId(selectedGroup._id);
      subscribeToGroupMessages();
    }

    return () => unsubscribeFromGroupMessages();
  }, [
    selectedGroup,
    getMessagesByGroupId,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  const isMember = selectedGroup.members?.some((m) => m._id === authUser?._id);
  const typingInGroup =
    selectedGroup._id && groupTypingUsers[selectedGroup._id]
      ? Object.entries(groupTypingUsers[selectedGroup._id])
          .filter(([userId]) => userId !== authUser._id)
          .map(([, username]) => username)
      : [];

  return (
    <div className="flex flex-col h-full">
      <GroupChatHeader />

      <div className="flex-1 px-6 overflow-y-auto py-8 bg-transparent">
        {!isMember ? (
          <NotMemberPlaceholder />
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : messages.length > 0 ? (
          <div className="max-w-3xl mx-auto space-y-2">
            {messages.map((msg, index) => {
              if (msg.isSystemMessage) {
                return (
                  <div key={msg._id} className="flex justify-center my-4">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border text-muted-foreground text-sm">
                      {msg.systemMessageType === "join" ? (
                        <UserRoundPlus className="w-4 h-4 text-primary" />
                      ) : (
                        <UserRoundMinus className="w-4 h-4 text-primary" />
                      )}
                      <span>{msg.text}</span>
                      <span className="opacity-50">
                        {formatMessageTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              }
              
              const isMe = msg.sender._id === authUser._id;
              
              const prevMsg = messages[index - 1];
              const timeDiff = prevMsg ? new Date(msg.createdAt) - new Date(prevMsg.createdAt) : null;
              const isMoreThan3Minutes = timeDiff ? timeDiff > 3 * 60 * 1000 : false;
              
              const showUsername = !isMe && msg.sender?.username && (
                !prevMsg || 
                prevMsg.isSystemMessage || 
                prevMsg.sender?._id !== msg.sender._id ||
                isMoreThan3Minutes
              );
              
              return (
                <div key={msg._id}>
                  {showUsername && (
                    <p className="text-xs text-muted-foreground mb-1">
                      {msg.sender.username}
                    </p>
                  )}
                  <div
                    className={`flex items-end gap-2 ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    {isMe && (
                      <div className="flex flex-col text-xs opacity-70 text-muted-foreground">
                        {msg.readBy && msg.readBy.length > 0 && (
                          <p className="mb-0 text-right">Read {msg.readBy.length}</p>
                        )}
                        <p className="mb-1 text-left">{formatMessageTime(msg.createdAt)}</p>
                      </div>
                    )}
                    <div
                      className={`relative p-3 border border-border max-w-[75%] whitespace-pre-wrap wrap-break-word shadow-sm ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-none"
                          : "bg-card text-card-foreground rounded-2xl rounded-tl-none"
                      }`}
                    >
                      {msg.text && <p>{msg.text}</p>}
                    </div>
                    {!isMe && (
                      <div className="flex flex-col text-xs opacity-70 text-muted-foreground">
                        <p className="mb-1 text-left">{formatMessageTime(msg.createdAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {typingInGroup.length > 0 && (
              <div className="flex justify-start">
                <TypingText
                  username={
                    typingInGroup.length === 1
                      ? typingInGroup[0]
                      : typingInGroup.length === 2
                      ? `${typingInGroup[0]} and ${typingInGroup[1]}`
                      : `${typingInGroup[0]}, ${typingInGroup[1]} and others`
                  }
                />
              </div>
            )}

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
