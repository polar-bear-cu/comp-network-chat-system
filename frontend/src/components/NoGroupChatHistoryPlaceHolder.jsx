import { MessageCircle } from "lucide-react";

const NoGroupChatHistoryPlaceholder = ({ name }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-foreground">
      {/* Icon Circle */}
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 bg-linear-to-br from-accent/20 to-accent-foreground/10">
        <MessageCircle className="w-8 h-8 text-accent-foreground" />
      </div>

      {/* Heading */}
      <h3 className="text-lg font-medium mb-3 text-foreground">
        Start your conversation in {name}
      </h3>

      {/* Description with line */}
      <div className="flex flex-col space-y-3 max-w-md mb-5">
        <p className="text-sm text-muted-foreground">
          This is the beginning of your conversation. Send a message to start
          chatting!
        </p>
        <div className="h-px w-32 mx-auto bg-linear-to-r from-transparent via-accent/30 to-transparent"></div>
      </div>

      {/* Suggested Texts */}
      <div className="flex flex-wrap gap-2 justify-center">
        {["👋 Say Hello", "🤝 How are you?", "📅 Meet up soon?"].map((text) => (
          <p
            key={text}
            className="px-4 py-2 text-xs font-medium rounded-full transition-colors text-accent-foreground bg-accent/10 hover:bg-accent/20"
          >
            {text}
          </p>
        ))}
      </div>
    </div>
  );
};

export default NoGroupChatHistoryPlaceholder;
