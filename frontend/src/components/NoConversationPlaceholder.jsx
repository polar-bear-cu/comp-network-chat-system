import { MessageCircle } from "lucide-react";

const NoConversationPlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-foreground">
      {/* Icon Circle */}
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-accent">
        <MessageCircle className="w-10 h-10 text-accent-foreground" />
      </div>

      {/* Heading */}
      <h3 className="text-xl font-semibold mb-2 text-foreground">
        Select a conversation
      </h3>

      {/* Description */}
      <p className="max-w-md text-muted-foreground">
        Choose a contact from the sidebar to start chatting or continue a
        previous conversation.
      </p>
    </div>
  );
};

export default NoConversationPlaceholder;
