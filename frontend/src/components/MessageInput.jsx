import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "./ui/button";
import { useChatStore } from "@/store/useChatStore";

function MessageInput() {
  const { sendMessage } = useChatStore();
  const [text, setText] = useState("");

  const handleSendMessage = (e) => {
    e.preventDefault();
    sendMessage(text);
    setText("");
  };

  return (
    <div className="p-4 border-t border-border bg-background">
      <form onSubmit={handleSendMessage} className="flex space-x-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
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
