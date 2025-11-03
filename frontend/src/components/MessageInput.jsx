import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "./ui/button";
import { useChatStore } from "@/store/useChatStore";
import { useGroupStore } from "@/store/useGroupStore";

function MessageInput() {
  const { sendMessage, selectedUser, emitTyping, emitStopTyping } =
    useChatStore();
  const {
    sendGroupMessage,
    selectedGroup,
    emitGroupTyping,
    emitGroupStopTyping,
  } = useGroupStore();

  const [text, setText] = useState("");
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current) {
        if (selectedUser) emitStopTyping();
        if (selectedGroup) emitGroupStopTyping();
        isTypingRef.current = false;
      }
    };
  }, [selectedUser, selectedGroup, emitStopTyping, emitGroupStopTyping]);

  const handleTextChange = (e) => {
    const value = e.target.value;
    setText(value);

    if (!value.trim()) {
      if (isTypingRef.current) {
        if (selectedUser) emitStopTyping();
        if (selectedGroup) emitGroupStopTyping();
        isTypingRef.current = false;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      return;
    }

    if (!isTypingRef.current) {
      if (selectedUser) emitTyping();
      if (selectedGroup) emitGroupTyping();
      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (selectedUser) emitStopTyping();
      if (selectedGroup) emitGroupStopTyping();
      isTypingRef.current = false;
    }, 2000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (isTypingRef.current) {
      if (selectedUser) emitStopTyping();
      if (selectedGroup) emitGroupStopTyping();
      isTypingRef.current = false;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (selectedUser) {
      sendMessage(text);
    } else if (selectedGroup) {
      sendGroupMessage(text);
    }
    setText("");
  };

  return (
    <div className="p-4 border-t border-border bg-background">
      <form onSubmit={handleSendMessage} className="flex space-x-4">
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          className="flex-1 bg-card border border-border rounded-lg py-2 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Type your message..."
        />

        <Button
          type="submit"
          disabled={!text.trim()}
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2 font-medium transition-all hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center"
        >
          <Send className="w-5 h-5" />
        </Button>
      </form>
    </div>
  );
}
export default MessageInput;
